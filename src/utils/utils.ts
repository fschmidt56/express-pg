import { headers } from '../config/config';
import fetch from 'node-fetch';
import { IGeoJsonObject, IPgResultRows } from '../types/types';

export async function postData(url: string, data: any) {
    const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
    });
    return await response.json();
}

export function createGeoJson(data: IPgResultRows[]): IGeoJsonObject {
    let geojson: IGeoJsonObject = {
        "name": "bars",
        "type": "FeatureCollection",
        "features": []
    };
    for (let i: number = 0; i < data.length; i++) {
        //@ts-ignore
        geojson.features.push({
            //@ts-ignore
            "type": "Feature",
            "geometry": {
                //@ts-ignore
                "type": "Point",
                //@ts-ignore
                "coordinates": [data[i].long, data[i].lat]
            },
            //@ts-ignore
            "properties": { "gastro": `${data[i].gastro}`, "bier": `${data[i].bier}`, "preis": `${data[i].preis}` }
        })
    }
    return geojson;
}
