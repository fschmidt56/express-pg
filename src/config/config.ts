import { IPgConnectionParams, } from '../types/types'
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config()
export const apiUrl: string = 'https://api.openrouteservice.org/v2/directions/foot-walking/geojson';
//@ts-ignore
export const apiKey: string = process.env.ORS_API_KEY

export const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
    'Authorization': apiKey
}

export const pgConnectionParameters: IPgConnectionParams<string, number> = {
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    //@ts-ignore
    port: parseInt(process.env.PG_PORT)
}

export const pool: Pool = new Pool(pgConnectionParameters);