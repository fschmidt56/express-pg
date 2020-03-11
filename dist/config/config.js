"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.apiUrl = 'https://api.openrouteservice.org/v2/directions/foot-walking/geojson';
//@ts-ignore
exports.apiKey = process.env.ORS_API_KEY;
exports.headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
    'Authorization': exports.apiKey
};
exports.pgConnectionParameters = {
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    //@ts-ignore
    port: parseInt(process.env.PG_PORT)
};
exports.pool = new pg_1.Pool(exports.pgConnectionParameters);
