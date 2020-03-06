"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const queries_1 = require("./queries");
const port = 8000;
const app = express_1.default();
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({
    extended: true,
}));
app.get('/', (request, response) => {
    response.send(`Server running on port ${port}.`);
});
app.listen(port, () => console.log(`Server running on port ${port}.`));
app.get('/locations', queries_1.getLocations);
