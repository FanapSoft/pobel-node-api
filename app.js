import express from "express";
import bodyParser from "body-parser";
import logger from 'morgan'
import methodOverride from 'method-override'
import session from  'express-session'
import path from 'path'
import passport from 'passport'
import routes from './router'

import fs from 'fs'

import errorHandler from 'errorhandler'

const app = express();

/*app.get("/", async (req, res, next) => {
    res.json({ message: "from index api" });
});*/
routes(app);

import swaggerUi from 'swagger-ui-express'
import swaggerDocument from './swagger.json'

app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument)
);
// var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

app.use(errorHandler())
//app.use(express.logger());
// app.use(logger('combined', { stream: accessLogStream }));
app.use(methodOverride());
app.use(session({ resave: true, saveUninitialized: true,
  secret: 'uwotm9' }));

// parse application/json
app.use(bodyParser.json());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
// app.use(passport.initialize({}));
// app.use(passport.session({}));

app.use(express.static(path.join(__dirname, 'public')))

/* final catch-all route to index.html defined last */
app.get('/*', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(8080,  () => {
  console.log(`Server is running`);
});
