import express from "express";
import acl from "express-acl";

import authRoutes from './auth.js'
import userRoutes from './user.js'
import datasetRoutes from "./dataset.js";
import userTargetsRoutes from "./userTargets.js";
import targetDefinitionsRoutes from "./targetDefinitions.js";
import datasetItems from "./datasetItems.js";
import reports from "./reports.js";
import answers from "./answers.js";
import questions from "./questions.js";
import wallet from "./wallet";

import User from "../prisma/models/User.js";

import { handleError } from "../imports/errors.js";
import httpStatus from "http-status";
import credit from "./credit.js";
import transactions from "./transactions.js";
import files from "./files.js";
import path from 'path'
import scripts from "./scripts";
import answerPacks from "./answerPacks";
import datasetResults from "./datasetResults";
import app from "../app";

const ROUTER = express.Router();

ROUTER.use('/public/export.csv', function (req, res) {
    res.sendFile(path.join(__dirname, '/../public/export.csv'))
});

acl.config({
    filename: 'nacl.json',
    path: __dirname + '/../config',
    baseUrl: '/api',
    denyCallback: (res) => {
        return handleError(res, {code: 2004, status: httpStatus.FORBIDDEN})
    }
});

ROUTER.get(["/", "/loggedIn/*"], function(req, res, next) {
    if(process.env.NODE_ENV === 'production') {
        res.sendFile(path.resolve('dist/public/index.html'));
    } else {
        res.sendFile(path.resolve('src/public/index.html'));
    }
});
ROUTER.get(["/admin","/admin/*"], function(req, res, next) {
    if(process.env.NODE_ENV === 'production') {
        res.sendFile(path.resolve('dist/public/admin/index.html'));
    } else {
        res.sendFile(path.resolve('src/public/admin/index.html'));
    }
});


/**
 * Routes that don't need acl or auth
 */
authRoutes(ROUTER);

/**
 * Middleware for auth
 * express-acl middleware depends on the role
 * the role can either be in req.decoded (jsonwebtoken) or req.session
 */
ROUTER.use(async function(req, res, next) {
    const token = req.headers['token'];
    if (token) {
        const user = await User.findByObject({
            LocalToken: token,
            TokenExpiresAt: {
                gt: new Date().toISOString()
            }
        }, 'admin');

        if(user) {
            if(!user.IsActive) {
                return handleError(res, {code: 3700});
            }
            req.decoded = {
                ...user,
                role: user.Role
            };
        }
    }

    if(!req.decoded) {
        req.decoded = {
            role: 'guest'
        }
    }

    return next();
});

ROUTER.use(acl.authorize.unless({
    //path: ['/api/Reports/ScoreBoard']
}));

/**
 * Routes that need acl
 */
userRoutes(ROUTER);
datasetRoutes(ROUTER);
userTargetsRoutes(ROUTER);
targetDefinitionsRoutes(ROUTER);
datasetItems(ROUTER);
reports(ROUTER);
answers(ROUTER);
questions(ROUTER);
credit(ROUTER);
transactions(ROUTER);
files(ROUTER);
wallet(ROUTER);
scripts(ROUTER);
answerPacks(ROUTER);
datasetResults(ROUTER);

export default function (app) {
    app.use(ROUTER);
}
