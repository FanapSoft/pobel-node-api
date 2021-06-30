import httpStatus from "http-status";
import {handleError} from "../../imports/errors.js";
import Answer from "../../prisma/models/Answer.js";
import Dataset from "../../prisma/models/Dataset.js";
import DatasetItem from "../../prisma/models/DatasetItem.js";
import UserTarget from "../../prisma/models/UserTarget.js";
import prisma from "../../prisma/prisma.module.js";
import Transaction from "../../prisma/models/Transaction.js";

const creditsController = {};

creditsController.getCredit = async (req, res) => {
    const {
        DatasetId,
        UserId
    } = req.query;

    let where = {}, include = null;

    let uId = UserId ? UserId : req.decoded.Id;
    if(req.decoded.Role !== 'admin') {
        uId = req.decoded.Id;
    }

    where.DatasetId = DatasetId;
    where.UserId = uId;
    where.CreaditCalculated = false;
    where.AnswerType = Answer.answerTypes.GOLDEN;

    let credit = 0;

    try {
        const ds = await Dataset.findById(DatasetId, 'admin');
        if(!ds)
            return handleError(res, {code: 3002, status: httpStatus.BAD_REQUEST});

        let userTarget = await UserTarget.getUserCurrentTarget(uId, ds.Id);
        if(!userTarget) {
            return handleError(res, {status: httpStatus.EXPECTATION_FAILED, code: 3203});
        }
        if(!userTarget.TargetDefinition) {
            return handleError(res, {status: httpStatus.EXPECTATION_FAILED, error: {code: 1000, message: 'User has target, but we can not find its definition'}});
        }

        let utd = userTarget.TargetDefinition;
        credit = await Answer.calculateCredit(uId, ds, utd);
        return res.send({credit});
    } catch (error) {
        console.log(error)
        return handleError(res, {});
    }
};

creditsController.collectCredit = async (req, res) => {
    const {
        DatasetId,
        UserId
    } = req.query;

    let where = {}, include = null;

    let uId = UserId ? UserId : req.decoded.Id;
    if(req.decoded.Role !== 'admin') {
        uId = req.decoded.Id;
    }

    where.DatasetId = DatasetId;
    where.UserId = uId;
    where.CreaditCalculated = false;
    where.AnswerType = Answer.answerTypes.GOLDEN;

    let credit = 0;

    try {
        const ds = await Dataset.findById(DatasetId, 'admin');
        if(!ds)
            return handleError(res, {code: 3002, status: httpStatus.BAD_REQUEST});

        let userTarget = await UserTarget.getUserCurrentTarget(uId, ds.Id);
        if(!userTarget) {
            return handleError(res, {status: httpStatus.EXPECTATION_FAILED, code: 3203});
        }
        if(!userTarget.TargetDefinition) {
            return handleError(res, {status: httpStatus.EXPECTATION_FAILED, error: {code: 1000, message: 'User has target, but we can not find its definition'}});
        }
        let utd = userTarget.TargetDefinition;

        let canCollect = false;
        //can collect if:
        // 1.target ended
        // 2.dataset items ended
        // 3.user has reached its labeling limit on the dataset
        if(userTarget.TargetEnded || ds.LabelingStatus > Dataset.labelingStatuses.LABELING_ALLOWED) {
            canCollect = true;
        } else {
            const answersCount = Answer.client.count({
                where: {
                    DatasetId,
                    UserId,
                    CreditCalculated: false
                }
            });

            if(answersCount >= ds.AnswerBudgetCountPerUser) {
                await UserTarget.finishUserTarget(userTarget.Id);
                canCollect = true;
            }
        }

        if(canCollect) {
            credit = await Answer.calculateCredit(uId, ds, utd);
            const transaction = await Transaction.client.create({
                data: {
                    ReferenceDatasetId: ds.Id,
                    OwnerId: uId,
                    CreditAmount: credit,
                    DebitAmount: 0,
                    Reason: 0
                }
            });
            const updateResult = await Answer.client.updateMany({
                where: {
                    DatasetId: ds.Id,
                    UserId: uId,
                    CreditCalculated: false
                },
                data: {
                    CreditCalculated: true
                }
            });

            return res.send({success: true});
        } else {
            return handleError(res, {status: httpStatus.EXPECTATION_FAILED, code: 3400});
        }
    } catch (error) {
        console.log(error)
        return handleError(res, {});
    }
};

export default creditsController;
