import {postData, createGeoJson} from './utils/utils';
import {apiUrl, pool} from './config/config';
import { IPgResultRows, IRouteApiObject } from './types/types';

let body: IRouteApiObject;
let bboxData: IPgResultRows[];
let radiusData: IPgResultRows[];
let lineData: IPgResultRows[];
let numberOfBars: number;

export const getLocations = (request: any, response: any) => {
    numberOfBars = request.body.bars;
    let budget: number = request.body.budget;
    let radius: number = request.body.radius;
    let center:number[] = request.body.center;
    let startCoords: number[] = request.body.startPoint;
    let endCoords: number[] | any = request.body.endPoint;
    let extent: number[] = request.body.extent;
    const lineQuery: string = `SELECT ST_X(ST_TRANSFORM(geom, 4326)) as long, ST_Y(ST_TRANSFORM(geom, 4326)) as lat, gastro, bier, preis FROM (SELECT geom, gastro, bier, preis, sum(preis) OVER (ORDER BY RANDOM()) AS total_sum FROM bier.koelsch_test WHERE ST_DWithin(ST_BUFFER(ST_MAKELINE(ST_Transform(ST_SetSRID(ST_MAKEPOINT(${startCoords}),4326),3857), ST_Transform(ST_SetSRID(ST_MAKEPOINT(${endCoords}), 4326),3857)), 250), ST_SetSRID(geom,3857), 500)) t WHERE total_sum <= ${budget} ORDER BY geom LIMIT ${numberOfBars};`;
    const bboxQuery: string = `SELECT ST_X(ST_TRANSFORM(geom, 4326)) as long, ST_Y(ST_TRANSFORM(geom, 4326)) as lat, gastro, bier, preis FROM (SELECT geom, gastro, bier, preis, sum(preis) OVER (ORDER BY RANDOM()) AS total_sum FROM bier.koelsch_test AS a WHERE ST_Contains(ST_Transform(ST_MakeEnvelope(${extent}, 4326), 3857), a.geom)ORDER BY RANDOM()) t WHERE total_sum <= ${budget} ORDER BY geom LIMIT ${numberOfBars};`;
    const radiusQuery: string = `SELECT ST_X(ST_TRANSFORM(geom, 4326)) as long, ST_Y(ST_TRANSFORM(geom, 4326)) as lat, gastro, bier, preis FROM (SELECT geom, gastro, bier, preis, sum(preis) OVER (ORDER BY RANDOM()) AS total_sum FROM bier.koelsch_test WHERE ST_DWithin(ST_Transform(ST_SetSRID(ST_Point(${center}), 4326), 3857), ST_Transform(geom, 3857), 3000)) t WHERE total_sum <= ${budget} ORDER BY geom LIMIT ${numberOfBars};`;
    pool.query(lineQuery, (error, results) => {
        if (error) {
            throw error
        }
        let coordsArr: number[][] = [];
        lineData = results.rows;
        if (lineData.length < numberOfBars) {
            console.log('Calculating route with LineBuffer not possible. Trying calculating alternative route with BoundingBox...')
            pool.query(bboxQuery, (error, results) => {
                if (error) {
                    throw error
                }
                bboxData = results.rows;
                if (bboxData.length < numberOfBars) {
                    console.log('Calculating route with BoundingBox not possible. Trying calculating alternative route with radius...')
                    pool.query(radiusQuery, (error, results) => {
                        if (error) {
                            throw error
                        }
                        radiusData = results.rows;
                        if (radiusData.length < numberOfBars) {
                            console.log('Calculating route for given parameters not possible. Change your parameters.')
                        }
                        else {
                            console.log('Calculating route with radius successful.')
                            createGeoJson(radiusData)
                            for (let i = 0; i < radiusData.length; i++) {
                                let tempArr: number[] = [radiusData[i].long, radiusData[i].lat];
                                coordsArr.push(tempArr);
                            }
                            body = {
                                "coordinates": [startCoords, ...coordsArr, endCoords],
                                //"instructions": false,
                                "preference": "shortest"
                            }
                            postData(apiUrl, body)
                                .then((data) =>
                                    response.status(200).json(data))
                                .catch((error) => error)
                        }
                    })
                }
                else {
                    console.log('Calculating route with BoundingBox successful.')
                    createGeoJson(bboxData)
                    for (let i = 0; i < bboxData.length; i++) {
                        let tempArr: number[] = [bboxData[i].long, bboxData[i].lat]
                        coordsArr.push(tempArr)
                    }
                    body = {
                        "coordinates": [startCoords, ...coordsArr, endCoords],
                        //"instructions": false,
                        "preference": "shortest"
                    }
                    postData(apiUrl, body)
                        .then((data) =>
                            response.status(200).json(data))
                        .catch((error) => error)
                }
            })
        }
        else {
            console.log('Calculating route with LineBuffer successful.')
            createGeoJson(lineData)
            for (let i = 0; i < lineData.length; i++) {
                let tempArr: number[] = [lineData[i].long, lineData[i].lat]
                coordsArr.push(tempArr)
            }
            body = {
                "coordinates": [startCoords, ...coordsArr, endCoords],
                //"instructions": false,
                "preference": "shortest"
            }
            postData(apiUrl, body)
                .then((data) =>
                    response.status(200).json(data))
                .catch((error) => error)
        }
    })
};

export const getGeoJson = (request: Request, response: any) => {
    if (lineData.length == numberOfBars) {
        response.status(200).json(createGeoJson(lineData))
    }
    else if (bboxData.length == numberOfBars || radiusData.length == numberOfBars) {
        bboxData.length == numberOfBars ? response.status(200).json(createGeoJson(bboxData)) : response.status(200).json(createGeoJson(radiusData));
    }
    else (response.json('No geojson created yet.'))
}

