"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const node_fetch_1 = __importDefault(require("node-fetch"));
const apiUrl = 'https://api.openrouteservice.org/v2/directions/foot-walking/geojson';
const apiKey = '5b3ce3597851110001cf6248651568a78b4e48489463497db3fddbc7';
const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
    'Authorization': apiKey
};
let startCoord = [7.036400, 50.968590];
let endCoord = [7.036400, 50.968590];
let body;
exports.pool = new pg_1.Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'test',
    password: 'postgres',
    port: 5432
});
// Example POST method implementation:
function postData(url, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield node_fetch_1.default(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });
        return yield response.json(); // parses JSON response into native JavaScript objects
    });
}
exports.getLocations = (request, response) => {
    exports.pool.query(`SELECT ST_X(ST_TRANSFORM(geometry,4326)) as long, 
                ST_Y(ST_TRANSFORM(geometry,4326)) as lat 
                FROM nabu.home 
                ORDER BY RANDOM() 
                LIMIT 5`, (error, results) => {
        if (error) {
            throw error;
        }
        let coordsArr = [];
        const data = results.rows;
        for (let i = 0; i < data.length; i++) {
            let tempArr = [data[i].long, data[i].lat];
            coordsArr.push(tempArr);
        }
        body = { "coordinates": [startCoord, ...coordsArr, endCoord] };
        postData(apiUrl, body)
            .then((data) => response.status(200).json(data))
            .catch((error) => error);
    });
};
