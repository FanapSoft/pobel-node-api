// import bcrypt from "bcrypt";

// import jwt from "jsonwebtoken";
import prisma from "../../prisma/prisma.module.js";
import httpStatus from "http-status";
import acl from "../../imports/acl.js";
import {handleError} from "../../imports/errors.js";
import User from "../../prisma/models/User.js";
import UserTarget from "../../prisma/models/UserTarget.js";

const userController = {};

/**
 *
 * @param OwnerId
 * @param TargetDefinitionId
 * @return {"targetEnded": true,"noTarget": true}
 * @constructor
 */
userController.activateTarget =  async (req, res) => {
    const {
        OwnerId,
        TargetDefinitionId
    } = req.body;

    let uId = OwnerId
    if(req.decoded.Role !== 'admin') {
        uId = req.decoded.Id;
    }

    try {
        const tmpTarget = await UserTarget.client.findMany({
            where: {
                OwnerId: uId
            },
            orderBy: {
                CreatedAt: 'desc'
            },
            take: 1
        });

        if(!tmpTarget || !tmpTarget.length || (tmpTarget.length && tmpTarget[0].TargetDefinitionId !== TargetDefinitionId)) {
            const result = await UserTarget.client.create({
                data: {
                    Definition: {
                        connect: {
                            Id: TargetDefinitionId
                        }
                    },
                    Owner: {
                        connect: {
                            Id: uId
                        }
                    }
                }
            });
        }

        return res.send({success: true});
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
}

userController.getCurrentTargetStatus =  async (req, res) => {
    const {
        UserId,
        DatasetId
    } = req.query;

    let uId = UserId ? UserId : req.decoded.Id
    if(req.decoded.Role !== 'admin') {
        uId = req.decoded.Id;
    }

    try {
        //TODO: count answers and cache them
        return res.send({success: true});
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
}


export default userController;
