// import bcrypt from "bcrypt";

// import jwt from "jsonwebtoken";
// import prisma from "../../prisma/prisma.module.js";
// import httpStatus from "http-status";
// import acl from "../../imports/acl.js";
import {handleError} from "../../imports/errors.js";
import UserTarget from "../../prisma/models/UserTarget.js";
import Answer from "../../prisma/models/Answer.js";
import {validationResult} from "express-validator";
import TargetDefinition from "../../prisma/models/TargetDefinition.js";
import httpStatus from "http-status";

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

    let uId = OwnerId ? OwnerId : req.decoded.Id;
    if(req.decoded.Role !== 'admin') {
        uId = req.decoded.Id;
    }

    try {
        const newTargetDefinition = await TargetDefinition.findById(TargetDefinitionId, 'admin');
        if(!newTargetDefinition) {
            return handleError(res, {
                status: httpStatus.BAD_REQUEST,
                error: {
                    code: 3002,
                    message: 'Invalid target definition'
                }
            });
        }

        const tmpTargets = await UserTarget.client.findMany({
            where: {
                OwnerId: uId,
                DatasetId: newTargetDefinition.DatasetId
            },
            orderBy: {
                CreatedAt: 'desc'
            },
            include: {
                TargetDefinition: true
            },
            take: 1
        });

        if(!tmpTargets || !tmpTargets.length) {
            await UserTarget.createTarget(uId, newTargetDefinition.DatasetId, TargetDefinitionId);
            return res.send({success: true});
        } else {
            if (tmpTargets[0].TargetDefinition) {
                const oldTarget = tmpTargets[0].TargetDefinition;
                if(oldTarget.Id === newTargetDefinition.Id) {
                    return res.send({success: true});
                }

                if(newTargetDefinition.AnswerCount < oldTarget.AnswerCount) {
                    return handleError(res, {
                        code: 3200,
                        status: httpStatus.EXPECTATION_FAILED,
                    });
                }

                const userAnswersCount = await Answer.client.count({
                    where: {
                        UserId: uId,
                        DatasetId: oldTarget.DatasetId,
                        CreditCalculated: false
                    }
                });

                if(oldTarget.AnswerCount <= userAnswersCount) {
                    await UserTarget.client.update({
                        where: {
                            Id: tmpTargets[0].Id
                        },
                        data: {
                            TargetEnded: true
                        }
                    });

                    return handleError(res, {
                        status: httpStatus.EXPECTATION_FAILED,
                        code: 3201,
                    });
                }

                await UserTarget.createTarget(uId, newTargetDefinition.DatasetId, TargetDefinitionId);
                return res.send({success: true});
            } else {
                return handleError(res, {
                    status: httpStatus.EXPECTATION_FAILED,
                    error: {
                        code: 1000,
                        message: 'Target definition not existed'
                    }
                });
            }
        }
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
}

userController.getCurrentTargetStatus = async (req, res) => {
    const {
        UserId,
        DatasetId
    } = req.query;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let uId = UserId ? UserId : req.decoded.Id;
    if(req.decoded.Role !== 'admin') {
        uId = req.decoded.Id;
    }

    try {
        const userTargets = await UserTarget.client.findMany({
            where: {
                OwnerId: uId,
                DatasetId: DatasetId
            },
            orderBy: {
                CreatedAt: 'desc'
            },
            include: {
                TargetDefinition: true
            },
            take: 1
        });

        let targetEnded = false, noTarget = false;
        if(!userTargets || !userTargets.length) {
            noTarget = true;
        } else {
            const currentTarget = userTargets[0].TargetDefinition;
            // const userAnswersCount = await Answer.client.count({
            //     where: {
            //         UserId: uId,
            //         DatasetId: currentTarget.DatasetId,
            //         CreditCalculated: false
            //     }
            // });
            targetEnded = currentTarget.TargetEnded === null;
        }

        return res.send({noTarget, targetEnded});
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
}


export default userController;
