import express from "express";
// import bodyParser from "body-parser";
// import logger from 'morgan'
import methodOverride from 'method-override';
import session from  'express-session';
import path from 'path';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import testRoutes from './router/index.test.js'
import realRoutes from './router/index.js'

const routes = process.env.node_env === 'test' ? testRoutes : realRoutes;

// import fs from 'fs'

BigInt.prototype.toJSON = function() {
  return this.toString()
}

import errorHandler from 'errorhandler'

const app = express();

import swaggerUi from 'swagger-ui-express'
// const swaggerDocument = require('./config/swagger.json');
// import * as readline from "readline";

import swaggerJsdoc from 'swagger-jsdoc';
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      version: '0.1.0',
      title: 'POD <<POBEL>> NodeJS Backend',
      description: 'POBEL Backend API written in Node.js',
      contact: {
        name: "POBEL",
        url: "https://pobel.com",
        email: "info@pobel.com",
      }
    },
    host: `localhost:8080`,
    basePath: '/',
    // servers: [
    //   {
    //     url: "http://localhost:8080/",
    //   },
    // ],
  },
  apis: ['./router/*.js'],
};

const openapiSpecification = swaggerJsdoc(options);

app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(openapiSpecification, { explorer: true })
);
//let accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

app.use(errorHandler());
//app.use(express.logger());
//app.use(logger('combined', { stream: accessLogStream }));
app.use(methodOverride());
app.use(session({ resave: true, saveUninitialized: true,
  secret: 'uwotb9' }));

// parse application/json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

/**
 * Registers all routes
 */
routes(app);

/* final catch-all route to index.html defined last */
app.get('/*', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(8080,  () => {
  console.log(`Server is running`);
});

export default app;

