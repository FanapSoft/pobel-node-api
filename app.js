import express from "express";
import bodyParser from "body-parser";
import logger from 'morgan'
import methodOverride from 'method-override'
import session from  'express-session'
import path from 'path'
import routes from './router'

import fs from 'fs'

import errorHandler from 'errorhandler'

const app = express();

routes(app);

import swaggerUi from 'swagger-ui-express'
import swaggerDocument from './swagger.json'
import * as readline from "readline";

app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument)
);
//let accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

app.use(errorHandler())
//app.use(express.logger());
//app.use(logger('combined', { stream: accessLogStream }));
app.use(methodOverride());
app.use(session({ resave: true, saveUninitialized: true,
  secret: 'uwotm9' }));

// parse application/json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')))

/* final catch-all route to index.html defined last */
app.get('/*', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(8080,  () => {
  console.log(`Server is running`);
});
