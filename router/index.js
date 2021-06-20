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

import User from "../prisma/models/User.js";

import { handleError } from "../imports/errors.js";
import httpStatus from "http-status";


const ROUTER = express.Router();

acl.config({
    filename: 'nacl.json',
    path: 'config',
    baseUrl: '/api',
    denyCallback: (res) => {
        return handleError(res, {code: 2004, status: httpStatus.FORBIDDEN})
    }
});

ROUTER.get("/", function(req, res, next) {
    res.json({ message: "from index api" });
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

    if (!token)
        return handleError(res, {code: 2002, status: httpStatus.UNAUTHORIZED});

    const user = await User.findByObject({
        LocalToken: token,
        TokenExpiresAt: {
            gt: new Date().toISOString()
        }
    }, 'admin');

    if(!user)
        return handleError(res, {code: 2001, status: httpStatus.UNAUTHORIZED});

    req.decoded = {
        ...user,
        role: user.Role
    };

    return next();
});

ROUTER.use(acl.authorize);

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
//
// export { ROUTER };
export default function (app) {
    app.use(ROUTER);
}
