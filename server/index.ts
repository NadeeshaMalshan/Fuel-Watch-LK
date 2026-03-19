import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { db } from './db.js';
import { stations, fuelUpdates, stationRequests } from './schema.js';
import { eq, asc } from 'drizzle-orm';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'dev-fallback-secret-change-in-production';
const JWT_EXPIRES_IN = '8h';

const app = express();
app.use(cors({
  origin: [
    'https://fuelalert.online',
    'http://localhost:5173',
    'http://localhost:4173',
    process.env.FRONTEND_URL || '',
    /\.fuelalert\.online$/,
    /\.vercel\.app$/,
    /\.up\.railway\.app$/, // Railway-hosted frontends
  ].filter(Boolean),
  credentials: true,
}));

app.use(express.json({ limit: '50mb' })); // Allow large payloads for seeding

const PORT = process.env.PORT || 3000;

// Admin Authentication Middleware (JWT)
const checkAdminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).admin = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// GET all stations
app.get('/api/stations', async (req, res) => {
  try {
    const allStations = await db.select().from(stations);
    res.json(allStations);
  } catch (error) {
    console.error('Error fetching stations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST to update station fuel status
app.post('/api/stations/:id/updates', async (req, res) => {
  try {
    const stationId = parseInt(req.params.id);
    const { userName, message, status, petrol92, petrol95, autoDiesel, superDiesel, kerosene, petrolQueueLength, petrolWaitingTime, dieselQueueLength, dieselWaitingTime } = req.body;

    if (isNaN(stationId)) {
      return res.status(400).json({ error: 'Invalid station ID' });
    }

    // Insert update log
    await db.insert(fuelUpdates).values({
      stationId,
      userName,
      message,
      status,
      petrol92,
      petrol95,
      autoDiesel,
      superDiesel,
      kerosene,
      petrolQueueLength,
      petrolWaitingTime,
      dieselQueueLength,
      dieselWaitingTime,
    });

    // Keep only the latest 10 updates per station — delete oldest if exceeded
    const MAX_UPDATES_PER_STATION = 10;
    const existingUpdates = await db
      .select({ id: fuelUpdates.id })
      .from(fuelUpdates)
      .where(eq(fuelUpdates.stationId, stationId))
      .orderBy(asc(fuelUpdates.timestamp));

    if (existingUpdates.length > MAX_UPDATES_PER_STATION) {
      const toDelete = existingUpdates.slice(0, existingUpdates.length - MAX_UPDATES_PER_STATION);
      for (const record of toDelete) {
        await db.delete(fuelUpdates).where(eq(fuelUpdates.id, record.id));
      }
    }

    // Update the station's main status block
    const updateField: any = {
      lastUpdated: new Date(),
    };
    if (status) updateField.status = status;
    if (petrol92) updateField.petrol92Status = petrol92;
    if (petrol95) updateField.petrol95Status = petrol95;
    if (autoDiesel) updateField.autoDieselStatus = autoDiesel;
    if (superDiesel) updateField.superDieselStatus = superDiesel;
    if (kerosene) updateField.keroseneStatus = kerosene;
    if (petrolQueueLength !== undefined) updateField.petrolQueueLength = petrolQueueLength;
    if (petrolWaitingTime !== undefined) updateField.petrolWaitingTime = petrolWaitingTime;
    if (dieselQueueLength !== undefined) updateField.dieselQueueLength = dieselQueueLength;
    if (dieselWaitingTime !== undefined) updateField.dieselWaitingTime = dieselWaitingTime;

    await db.update(stations)
      .set(updateField)
      .where(eq(stations.id, stationId));

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating fuel status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin - Seed stations from OSM data (admin only)
app.post('/api/stations/seed', checkAdminAuth, async (req, res) => {
  try {
    const { stations: newStations } = req.body;
    if (!newStations || !Array.isArray(newStations)) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    // Insert ignoring conflicts (if osmId exists) won't crash
    const promises = newStations.map((s) => {
      // Generate a simple unique code based on osmId or random if not present
      const generatedCode = s.stationCode || `FW-${s.id || Math.floor(Math.random() * 1000000)}`;

      return db.insert(stations).values({
        stationCode: generatedCode,
        osmId: s.id,
        name: s.name,
        nameSi: s.nameSi,
        nameTa: s.nameTa,
        lat: s.coordinates[0],
        lng: s.coordinates[1],
        address: s.address,
        addressSi: s.addressSi,
        addressTa: s.addressTa,
        status: s.status || 'out-of-stock',
        petrol92Status: s.fuelTypes?.petrol92 || 'not-available',
        petrol95Status: s.fuelTypes?.petrol95 || 'not-available',
        autoDieselStatus: s.fuelTypes?.autoDiesel || 'not-available',
        superDieselStatus: s.fuelTypes?.superDiesel || 'not-available',
        keroseneStatus: s.fuelTypes?.kerosene || 'not-available',
        petrolQueueLength: s.petrolQueueLength || 0,
        petrolWaitingTime: s.petrolWaitingTime || 0,
        dieselQueueLength: s.dieselQueueLength || 0,
        dieselWaitingTime: s.dieselWaitingTime || 0,
        lastUpdated: new Date(),
      }).onConflictDoNothing({ target: stations.osmId })
    });

    await Promise.all(promises);
    res.json({ success: true, count: newStations.length });
  } catch (error) {
    console.error('Error seeding stations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin - Reset all station data (admin only)
app.post('/api/stations/reset', checkAdminAuth, async (req, res) => {
  try {
    const { password } = req.body;
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid password for reset' });
    }

    // Clear all updates
    await db.delete(fuelUpdates);

    // Reset all stations to N/A and 0
    await db.update(stations).set({
      status: 'out-of-stock',
      petrol92Status: 'not-available',
      petrol95Status: 'not-available',
      autoDieselStatus: 'not-available',
      superDieselStatus: 'not-available',
      keroseneStatus: 'not-available',
      petrolQueueLength: 0,
      petrolWaitingTime: 0,
      dieselQueueLength: 0,
      dieselWaitingTime: 0,
      lastUpdated: new Date(),
    });

    res.json({ success: true, message: 'All mock data reset to N/A and 0' });
  } catch (error) {
    console.error('Error resetting data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Login — returns a signed JWT on success
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign(
      { username, role: 'admin' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    res.json({ success: true, token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Admin - Add new station
app.post('/api/admin/stations', checkAdminAuth, async (req, res) => {
  try {
    const { name, nameSi, nameTa, lat, lng, address, addressSi, addressTa, stationCode } = req.body;
    
    const [newStation] = await db.insert(stations).values({
      name,
      nameSi,
      nameTa,
      lat,
      lng,
      address,
      addressSi,
      addressTa,
      stationCode: stationCode || `ADMIN-${Date.now()}`,
      status: 'out-of-stock',
      petrol92Status: 'not-available',
      petrol95Status: 'not-available',
      autoDieselStatus: 'not-available',
      superDieselStatus: 'not-available',
      keroseneStatus: 'not-available',
      petrolQueueLength: 0,
      petrolWaitingTime: 0,
      dieselQueueLength: 0,
      dieselWaitingTime: 0,
      lastUpdated: new Date(),
    }).returning();

    res.json(newStation);
  } catch (error) {
    console.error('Error creating station:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin - Update station details
app.patch('/api/admin/stations/:id', checkAdminAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const updates = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    await db.update(stations)
      .set({
        ...updates,
        lastUpdated: new Date(),
      })
      .where(eq(stations.id, id));

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating station:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin - Delete station
app.delete('/api/admin/stations/:id', checkAdminAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    await db.delete(stations).where(eq(stations.id, id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting station:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin - Fetch all station requests
app.get('/api/admin/requests', checkAdminAuth, async (req, res) => {
  try {
    const requests = await db.select().from(stationRequests);
    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin - Update request status
app.patch('/api/admin/requests/:id', checkAdminAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const { status } = req.body;
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    await db.update(stationRequests)
      .set({ status })
      .where(eq(stationRequests.id, id));

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Public - Submit a station request/feedback
app.post('/api/feedback/request', async (req, res) => {
  try {
    const { type, stationId, name, nameSi, nameTa, lat, lng, address, addressSi, addressTa, stationCode, message } = req.body;
    
    // Ensure stationId is either a number or null
    const parsedStationId = stationId && stationId !== "" ? parseInt(stationId.toString()) : null;

    await db.insert(stationRequests).values({
      type,
      stationId: parsedStationId,
      name,
      nameSi,
      nameTa,
      lat,
      lng,
      address,
      addressSi,
      addressTa,
      stationCode,
      message,
      status: 'pending'
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error submitting request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
