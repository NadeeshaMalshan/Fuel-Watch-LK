import { pgTable, serial, text, timestamp, doublePrecision, varchar, integer } from 'drizzle-orm/pg-core';

export const stations = pgTable('stations', {
  id: serial('id').primaryKey(),
  stationCode: varchar('station_code', { length: 50 }).unique(),
  osmId: varchar('osm_id', { length: 50 }).unique(),
  name: varchar('name', { length: 255 }).notNull(),
  nameSi: varchar('name_si', { length: 255 }),
  nameTa: varchar('name_ta', { length: 255 }),
  lat: doublePrecision('lat'),
  lng: doublePrecision('lng'),
  address: varchar('address', { length: 255 }),
  addressSi: varchar('address_si', { length: 255 }),
  addressTa: varchar('address_ta', { length: 255 }),
  status: varchar('status', { length: 50 }).default('available'),
  petrol92Status: varchar('petrol_92_status', { length: 50 }).default('not-available'),
  petrol95Status: varchar('petrol_95_status', { length: 50 }).default('not-available'),
  autoDieselStatus: varchar('auto_diesel_status', { length: 50 }).default('not-available'),
  superDieselStatus: varchar('super_diesel_status', { length: 50 }).default('not-available'),
  keroseneStatus: varchar('kerosene_status', { length: 50 }).default('not-available'),
  petrolQueueLength: integer('petrol_queue_length').default(0),
  petrolWaitingTime: integer('petrol_waiting_time').default(0),
  dieselQueueLength: integer('diesel_queue_length').default(0),
  dieselWaitingTime: integer('diesel_waiting_time').default(0),
  lastUpdated: timestamp('last_updated').defaultNow(),
});

export const fuelUpdates = pgTable('fuel_updates', {
  id: serial('id').primaryKey(),
  stationId: integer('station_id').references(() => stations.id, { onDelete: 'cascade' }),
  userName: varchar('user_name', { length: 255 }),
  message: text('message'),
  status: varchar('status', { length: 50 }),
  petrol92: varchar('petrol92', { length: 50 }),
  petrol95: varchar('petrol95', { length: 50 }),
  autoDiesel: varchar('auto_diesel', { length: 50 }),
  superDiesel: varchar('super_diesel', { length: 50 }),
  kerosene: varchar('kerosene', { length: 50 }),
  queueLength: integer('queue_length'),
  waitingTime: integer('waiting_time'),
  petrolQueueLength: integer('petrol_queue_length'),
  petrolWaitingTime: integer('petrol_waiting_time'),
  dieselQueueLength: integer('diesel_queue_length'),
  dieselWaitingTime: integer('diesel_waiting_time'),
  timestamp: timestamp('timestamp').defaultNow(),
});

export const stationRequests = pgTable('station_requests', {
  id: serial('id').primaryKey(),
  type: varchar('type', { length: 50 }).notNull(), // 'add_station' or 'update_station'
  stationId: integer('station_id').references(() => stations.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }),
  nameSi: varchar('name_si', { length: 255 }),
  nameTa: varchar('name_ta', { length: 255 }),
  lat: doublePrecision('lat'),
  lng: doublePrecision('lng'),
  address: varchar('address', { length: 255 }),
  addressSi: varchar('address_si', { length: 255 }),
  addressTa: varchar('address_ta', { length: 255 }),
  stationCode: varchar('station_code', { length: 50 }),
  message: text('message'),
  status: varchar('status', { length: 50 }).default('pending'), // 'pending', 'approved', 'rejected'
  createdAt: timestamp('created_at').defaultNow(),
});
