import { Pool } from 'pg';
import fetch from 'node-fetch';

const apiUrl: string = 'https://api.openrouteservice.org/v2/directions/foot-walking/geojson';

const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
    'Authorization': apiKey
}

let startCoord: number[] = [7.036400, 50.968590];
let endCoord: number[] = [7.036400, 50.968590]
let body;

export const pool: Pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'test',
    password: 'postgres',
    port: 5432
});

// Example POST method implementation:
async function postData(url: string, data: any) {
    const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
    });
    return await response.json(); // parses JSON response into native JavaScript objects
}

export const getLocations = (request: any, response: any) => {
    pool.query(`SELECT ST_X(ST_TRANSFORM(geometry,4326)) as long, 
                ST_Y(ST_TRANSFORM(geometry,4326)) as lat 
                FROM nabu.home 
                ORDER BY RANDOM() 
                LIMIT 5`, (error, results) => {
        if (error) {
            throw error
        }
        let coordsArr: number[][] = [];
        const data = results.rows;
        for (let i = 0; i < data.length; i++) {
            let tempArr: number[] = [data[i].long, data[i].lat]
            coordsArr.push(tempArr)
        }
        body = { "coordinates": [startCoord, ...coordsArr, endCoord] }
        postData(apiUrl, body)
            .then((data) =>
                response.status(200).json(data))
            .catch((error) => error)
    })
};

