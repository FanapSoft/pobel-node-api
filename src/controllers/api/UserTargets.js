import {handleError} from "../../imports/errors.js";
import UserTarget from "../../prisma/models/UserTarget.js";
import Answer from "../../prisma/models/Answer.js";
import {validationResult} from "express-validator";
import TargetDefinition from "../../prisma/models/TargetDefinition.js";
import httpStatus from "http-status";
import Dataset from "../../prisma/models/Dataset.js";

const userController = {};

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

        const ds = await Dataset.findById(newTargetDefinition.DatasetId, 'admin');

        if(ds.Labelingstatus > Dataset.labelingStatuses.LABELING_ALLOWED) {
            return handleError(res, {status: httpStatus.EXPECTATION_FAILED, error: {code: 3300}});
        }

        const userTarget = await UserTarget.getUserCurrentTarget(uId, ds.Id);

        if(!userTarget) {
            await UserTarget.createTarget(uId, newTargetDefinition.DatasetId, TargetDefinitionId);
            return res.send({success: true});
        } else {
            if (userTarget.TargetDefinition) {
                const oldTargetDafeinition = userTarget.TargetDefinition;
                if(oldTargetDafeinition.Id === newTargetDefinition.Id) {
                    return res.send({success: true});
                }

                if(newTargetDefinition.AnswerCount < oldTargetDafeinition.AnswerCount) {
                    return handleError(res, {
                        code: 3200,
                        status: httpStatus.EXPECTATION_FAILED,
                    });
                }

                const userAnswersCount = await Answer.client.count({
                    where: {
                        UserId: uId,
                        DatasetId: oldTargetDafeinition.DatasetId,
                        CreditCalculated: false
                    }
                });

                if(oldTargetDafeinition.AnswerCount <= userAnswersCount && !userTarget.TargetEnded) {
                    await UserTarget.client.update({
                        where: {
                            Id: userTarget.Id
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

                await UserTarget.createTarget(uId, newTargetDefinition.DatasetId, newTargetDefinition.Id);
                return res.send({success: true});
            } else {
                return handleError(res, {
                    status: httpStatus.EXPECTATION_FAILED,
                    error: {
                        code: 1000,
                        message: 'Target definition not exists'
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
        const userTarget = await UserTarget.getUserCurrentTarget(uId, DatasetId);
        let targetEnded = false, noTarget = false;
        if(!userTarget) {
            noTarget = true;
        } else {
            targetEnded = userTarget.TargetEnded;
        }

        return res.send({noTarget, targetEnded});
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
}

userController.getCurrentTarget = async (req, res) => {
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
        // const userTarget = await UserTarget.getUserCurrentTarget(uId, DatasetId);
        const userTarget = await UserTarget.getUserCurrentTarget(uId, DatasetId);
        if(!userTarget || userTarget.TargetEnded) {
            return handleError(res, {status: httpStatus.EXPECTATION_FAILED, code: 3203});
        }

        return res.send(userTarget);
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
}

export default userController;
