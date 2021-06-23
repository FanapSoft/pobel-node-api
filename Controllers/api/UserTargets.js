// import bcrypt from "bcrypt";

// import jwt from "jsonwebtoken";
// import prisma from "../../prisma/prisma.module.js";
// import httpStatus from "http-status";
// import acl from "../../imports/acl.js";
import {handleError} from "../../imports/errors.js";
import UserTarget from "../../prisma/models/UserTarget.js";
import Answer from "../../prisma/models/Answer.js";
import {validationResult} from "express-validator";

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

        //TODO: improve condition by new scenario
        if(!tmpTarget || !tmpTarget.length || (tmpTarget.length && tmpTarget[0].TargetDefinitionId !== TargetDefinitionId)) {
            const result = await UserTarget.client.create({
                data: {
                    TargetDefinition: {
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

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let uId = UserId ? UserId : req.decoded.Id
    if(req.decoded.Role !== 'admin') {
        uId = req.decoded.Id;
    }

    try {
        //TODO: count answers and cache them
        const answersCount = await Answer.client.count({
            where: {
                UserId: uId,
                DatasetId: DatasetId
            }
        });
        const userTargets = await UserTarget.client.findMany({
            where: {
                OwnerId: uId
            },
            orderBy: {
                CreatedAt: 'desc'
            },
            include: {
                TargetDefinition: true
            }
        });

        let targetEnded = false, noTarget = false;
        if(!userTargets.length || (userTargets.length && !userTargets[0].TargetDefinition)) {
            noTarget = true;
        } else if(userTargets.length && userTargets[0].TargetDefinition.AnswerCount <= answersCount) {
            targetEnded = true;
        }

        return res.send({noTarget, targetEnded});
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
}


export default userController;
