"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils/utils");
const config_1 = require("./config/config");
let body;
let bboxData;
let radiusData;
let lineData;
let numberOfBars;
exports.getLocations = (request, response) => {
    numberOfBars = request.body.bars;
    let budget = request.body.budget;
    let radius = request.body.radius;
    let center = request.body.center;
    let startCoords = request.body.startPoint;
    let endCoords = request.body.endPoint;
    let extent = request.body.extent;
    const lineQuery = `SELECT ST_X(ST_TRANSFORM(geom, 4326)) as long, ST_Y(ST_TRANSFORM(geom, 4326)) as lat, gastro, bier, preis FROM (SELECT geom, gastro, bier, preis, sum(preis) OVER (ORDER BY RANDOM()) AS total_sum FROM bier.koelsch_test WHERE ST_DWithin(ST_BUFFER(ST_MAKELINE(ST_Transform(ST_SetSRID(ST_MAKEPOINT(${startCoords}),4326),3857), ST_Transform(ST_SetSRID(ST_MAKEPOINT(${endCoords}), 4326),3857)), 250), ST_SetSRID(geom,3857), 500)) t WHERE total_sum <= ${budget} ORDER BY geom LIMIT ${numberOfBars};`;
    const bboxQuery = `SELECT ST_X(ST_TRANSFORM(geom, 4326)) as long, ST_Y(ST_TRANSFORM(geom, 4326)) as lat, gastro, bier, preis FROM (SELECT geom, gastro, bier, preis, sum(preis) OVER (ORDER BY RANDOM()) AS total_sum FROM bier.koelsch_test AS a WHERE ST_Contains(ST_Transform(ST_MakeEnvelope(${extent}, 4326), 3857), a.geom)ORDER BY RANDOM()) t WHERE total_sum <= ${budget} ORDER BY geom LIMIT ${numberOfBars};`;
    const radiusQuery = `SELECT ST_X(ST_TRANSFORM(geom, 4326)) as long, ST_Y(ST_TRANSFORM(geom, 4326)) as lat, gastro, bier, preis FROM (SELECT geom, gastro, bier, preis, sum(preis) OVER (ORDER BY RANDOM()) AS total_sum FROM bier.koelsch_test WHERE ST_DWithin(ST_Transform(ST_SetSRID(ST_Point(${center}), 4326), 3857), ST_Transform(geom, 3857), 3000)) t WHERE total_sum <= ${budget} ORDER BY geom LIMIT ${numberOfBars};`;
    config_1.pool.query(lineQuery, (error, results) => {
        if (error) {
            throw error;
        }
        let coordsArr = [];
        lineData = results.rows;
        if (lineData.length < numberOfBars) {
            console.log('Calculating route with LineBuffer not possible. Trying calculating alternative route with BoundingBox...');
            config_1.pool.query(bboxQuery, (error, results) => {
                if (error) {
                    throw error;
                }
                bboxData = results.rows;
                if (bboxData.length < numberOfBars) {
                    console.log('Calculating route with BoundingBox not possible. Trying calculating alternative route with radius...');
                    config_1.pool.query(radiusQuery, (error, results) => {
                        if (error) {
                            throw error;
                        }
                        radiusData = results.rows;
                        if (radiusData.length < numberOfBars) {
                            console.log('Calculating route for given parameters not possible. Change your parameters.');
                        }
                        else {
                            console.log('Calculating route with radius successful.');
                            utils_1.createGeoJson(radiusData);
                            for (let i = 0; i < radiusData.length; i++) {
                                let tempArr = [radiusData[i].long, radiusData[i].lat];
                                coordsArr.push(tempArr);
                            }
                            body = {
                                "coordinates": [startCoords, ...coordsArr, endCoords],
                                //"instructions": false,
                                "preference": "shortest"
                            };
                            utils_1.postData(config_1.apiUrl, body)
                                .then((data) => response.status(200).json(data))
                                .catch((error) => error);
                        }
                    });
                }
                else {
                    console.log('Calculating route with BoundingBox successful.');
                    utils_1.createGeoJson(bboxData);
                    for (let i = 0; i < bboxData.length; i++) {
                        let tempArr = [bboxData[i].long, bboxData[i].lat];
                        coordsArr.push(tempArr);
                    }
                    body = {
                        "coordinates": [startCoords, ...coordsArr, endCoords],
                        //"instructions": false,
                        "preference": "shortest"
                    };
                    utils_1.postData(config_1.apiUrl, body)
                        .then((data) => response.status(200).json(data))
                        .catch((error) => error);
                }
            });
        }
        else {
            console.log('Calculating route with LineBuffer successful.');
            utils_1.createGeoJson(lineData);
            for (let i = 0; i < lineData.length; i++) {
                let tempArr = [lineData[i].long, lineData[i].lat];
                coordsArr.push(tempArr);
            }
            body = {
                "coordinates": [startCoords, ...coordsArr, endCoords],
                //"instructions": false,
                "preference": "shortest"
            };
            utils_1.postData(config_1.apiUrl, body)
                .then((data) => response.status(200).json(data))
                .catch((error) => error);
        }
    });
};
exports.getGeoJson = (request, response) => {
    if (lineData.length == numberOfBars) {
        response.status(200).json(utils_1.createGeoJson(lineData));
    }
    else if (bboxData.length == numberOfBars || radiusData.length == numberOfBars) {
        bboxData.length == numberOfBars ? response.status(200).json(utils_1.createGeoJson(bboxData)) : response.status(200).json(utils_1.createGeoJson(radiusData));
    }
    else
        (response.json('No geojson created yet.'));
};
