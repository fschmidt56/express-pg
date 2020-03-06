import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import { getLocations } from './queries'


const port: number = 8000
const app: Application = express();

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)

app.get('/', (request: Request, response: Response) => {
    response.send(`Server running on port ${port}.`)
})

app.listen(port, () => console.log(`Server running on port ${port}.`))

app.get('/locations', getLocations)