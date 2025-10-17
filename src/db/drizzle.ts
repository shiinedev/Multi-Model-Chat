import { config } from "dotenv";
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema  from "./schema";
import * as relations from "./relations"

config({ path: ".env" }); // or .env.local
const databaseUrl = process.env.DATABASE_URL!;
export const db = drizzle(databaseUrl,{schema:{...schema,...relations}});
