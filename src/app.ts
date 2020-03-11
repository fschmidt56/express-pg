import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import { getLocations, getGeoJson } from './queries';

dotenv.config();

const app: Application = express();

const port: string | undefined = process.env.PORT;

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)
app.use(cors());

app.use(function(request, response, next) {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS,DELETE");
    response.setHeader("Access-Control-Allow-Headers", "X-Requested-With, Access-Control-Allow-Headers, Content-Type, Authorization, Origin, Accept");
    next();
});

app.get('/', (request: Request, response: Response) => {
    response.send(`Server running on port ${port}.`)
})

app.listen(port, () => console.log(`Server running on port ${port}.`))

app.post('/locations', getLocations)
app.get('/geojson', getGeoJson)