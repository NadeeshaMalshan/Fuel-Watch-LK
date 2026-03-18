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
  dieselStatus: varchar('diesel_status', { length: 50 }).default('not-available'),
  keroseneStatus: varchar('kerosene_status', { length: 50 }).default('not-available'),
  queueLength: integer('queue_length').default(0),
  waitingTime: integer('waiting_time').default(0),
  lastUpdated: timestamp('last_updated').defaultNow(),
});

export const fuelUpdates = pgTable('fuel_updates', {
  id: serial('id').primaryKey(),
  stationId: integer('station_id').references(() => stations.id),
  userName: varchar('user_name', { length: 255 }),
  message: text('message'),
  status: varchar('status', { length: 50 }),
  petrol92: varchar('petrol92', { length: 50 }),
  petrol95: varchar('petrol95', { length: 50 }),
  diesel: varchar('diesel', { length: 50 }),
  kerosene: varchar('kerosene', { length: 50 }),
  queueLength: integer('queue_length'),
  waitingTime: integer('waiting_time'),
  timestamp: timestamp('timestamp').defaultNow(),
});
