import "core-js/stable";
import "regenerator-runtime/runtime";

import express from "express";
import methodOverride from 'method-override';
import session from  'express-session';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import cors from "cors";

import testRoutes from './router/index.test.js'
import realRoutes from './router'
const routes = process.env.node_env === 'test' ? testRoutes : realRoutes;

BigInt.prototype.toJSON = function() {
  return this.toString()
}

import errorHandler from 'errorhandler'

const app = express();

import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      version: '0.1.0',
      title: 'POD ♯ POBEL NodeJS Backend',
      description: 'POBEL Backend API written in Node.js',
      contact: {
        name: "POBEL",
        url: "https://pobel.com",
        email: "info@pobel.com",
      }
    },
    host: `localhost:8080`,
    basePath: '/'
  },
  apis: ['./src/router/*.js'],
};

if(['development', 'test'].includes(process.env.NODE_ENV)) {
  const openapiSpecification = swaggerJsdoc(options);

  app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(openapiSpecification, { explorer: true })
  );
}

var allowedOrigins = ['http://localhost', 'http://localhost:8080', 'http://localhost:8787', 'http://10.56.16.50'];

app.use(cors({
  origin: function(origin, callback){    // allow requests with no origin
    // (like mobile apps or curl requests)
    console.log(origin)
    if(!origin) return callback(null, true);    if(allowedOrigins.indexOf(origin) === -1){
      var msg = 'The CORS policy for this site does not ' +
          'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }    return callback(null, true);
  }
}));

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

