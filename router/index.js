import express from "express";
import acl from "express-acl";

import authRoutes from './auth'
import userRoutes from './user'
import User from "../prisma/models/User";
import datasetRoutes from "./dataset";
import userTargetsRoutes from "./userTargets";
import targetDefinitionsRoutes from "./targetDefinitions";
import {handleError} from "../imports/errors";
import httpStatus from "http-status";

const ROUTER = express.Router();

acl.config({
    filename: 'nacl.json',
    path: 'config',
    baseUrl: '/api',
    denyCallback: (res) => {
        return handleError(res, {code: 2004, status: httpStatus.FORBIDDEN})
        // return res.status(403).json({
        //     status: 'Access Denied',
        //     success: false,
        //     message: 'You are not authorized to access this resource'
        // });
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

    if (!token) {
        return handleError(res, {code: 2002, status: httpStatus.UNAUTHORIZED});
    }

    const user = await User.findByObject({
        LocalToken: token,
        TokenExpiresAt: {
            gt: new Date().toISOString()
        }
    }, 'admin');//We might not send this result to every client



    if(!user) {
        return handleError(res, {code: 2001, status: httpStatus.UNAUTHORIZED});
        //return res.status(402).send({error: 'Invalid token or user'});
    }

    const decoded = {
        ...user,
        role: user.Role
    };

    req.decoded = decoded;

    return next()
});

ROUTER.use(acl.authorize);

/**
 * Routes that need acl
 */
userRoutes(ROUTER);
datasetRoutes(ROUTER);
userTargetsRoutes(ROUTER);
targetDefinitionsRoutes(ROUTER);

export { ROUTER };
export default function (app) {
    app.use(ROUTER);
}
