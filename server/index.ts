import express from 'express';
import cors from 'cors';
import { db } from './db.js';
import { stations, fuelUpdates } from './schema.js';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Allow large payloads for seeding

const PORT = process.env.PORT || 3000;

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
    const { userName, message, status, petrol92, petrol95, diesel, kerosene, queueLength, waitingTime } = req.body;

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
      diesel,
      kerosene,
      queueLength,
      waitingTime,
    });

    // Update the station's main status block
    const updateField: any = {
      lastUpdated: new Date(),
    };
    if (status) updateField.status = status;
    if (petrol92) updateField.petrol92Status = petrol92;
    if (petrol95) updateField.petrol95Status = petrol95;
    if (diesel) updateField.dieselStatus = diesel;
    if (kerosene) updateField.keroseneStatus = kerosene;
    if (queueLength !== undefined) updateField.queueLength = queueLength;
    if (waitingTime !== undefined) updateField.waitingTime = waitingTime;

    await db.update(stations)
      .set(updateField)
      .where(eq(stations.id, stationId));

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating fuel status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST to seed multiple stations initially
app.post('/api/stations/seed', async (req, res) => {
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
        status: s.status,
        petrol92Status: s.fuelTypes?.petrol92 || 'not-available',
        petrol95Status: s.fuelTypes?.petrol95 || 'not-available',
        dieselStatus: s.fuelTypes?.diesel || 'not-available',
        keroseneStatus: s.fuelTypes?.kerosene || 'not-available',
        queueLength: s.queueLength || 0,
        waitingTime: s.waitingTime || 0,
      }).onConflictDoNothing({ target: stations.osmId })
    });

    await Promise.all(promises);
    res.json({ success: true, count: newStations.length });
  } catch (error) {
    console.error('Error seeding stations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
