import {handleError} from "../../imports/errors.js";
import Label from "../../prisma/models/Label.js";
import prisma from "../../prisma/prisma.module.js";
import {query, validationResult} from "express-validator";
// import DatasetItem from "../../prisma/models/DatasetItem.js";
import Dataset from "../../prisma/models/Dataset.js";
import httpStatus from "http-status";
import UserTarget from "../../prisma/models/UserTarget.js";
import Answer from "../../prisma/models/Answer.js";
import QuestionRequestLog from "../../prisma/models/QuestionRequestLog.js";
import DatasetItem from "../../prisma/models/DatasetItem.js";

const questionsController = {};

// Get All Answers
questionsController.getQuestions = async (req, res) => {
    let {
        DatasetId,
        OwnerId,
        LabelId,
        OnlyOneLabel = true,
        Count
    } = req.query;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let uId = OwnerId ? OwnerId : req.decoded.Id;
    if(req.decoded.Role !== 'admin') {
        uId = req.decoded.Id;
    }

    if(!Count || Count > 20) {
        Count = 9
    }

    try {
        const questions = [];
        const ds = await Dataset.client.findUnique({
            where: {
                Id: DatasetId
            },
            include: {
                AnswerOptions: true
            }
        });
        if(!ds) {
            return handleError(res, {code: 3002, status: httpStatus.BAD_REQUEST});
        }

        if(ds.LabelingStatus > Dataset.labelingStatuses.LABELING_ALLOWED) {
            return handleError(res, {status: httpStatus.EXPECTATION_FAILED, error: {code: 3300}});
        }

        // const userTargets = await UserTarget.client.findMany({
        //     where: {
        //         OwnerId: uId,
        //         DatasetId: ds.Id
        //     },
        //     include: {
        //         TargetDefinition: true
        //     },
        //     orderBy: {
        //         CreatedAt: 'desc'
        //     },
        //     take: 1
        // });

        const userTarget = await UserTarget.getUserCurrentTarget(uId, ds.Id);
        if(!userTarget || userTarget.TargetEnded) {
            return handleError(res, {status: httpStatus.EXPECTATION_FAILED, code: 3203});
        }

        const answersCount = await Answer.client.count({
            where: {
                DatasetId,
                UserId: uId,
                CreditCalculated: false,
                //TODO: exclude negative goldens ?
            }
        });

        if(ds.AnswerBudgetCountPerUser && ds.AnswerBudgetCountPerUser <= answersCount) {
            //TODO: shall we set targetdefinition.targetended to true ? so user can collect its credit
            await UserTarget.finishUserTarget(userTarget.Id);
            return handleError(res, {status: httpStatus.EXPECTATION_FAILED, code: 3301});
        }

        let datasetItems = null;
        let label = null;

        const positiveGoldens = Math.floor((25 / 100) * Count);
        const negativeGoldens = Math.ceil((20 / 100) * Count);
        const noneGoldens =  Count - (positiveGoldens + negativeGoldens);

        if (OnlyOneLabel) {
            if(LabelId) {
                label = await Label.findById(LabelId, 'admin');
                if(!label) {
                    return handleError(res, {status: httpStatus.EXPECTATION_FAILED, error: {code: 3002, message: 'Invalid LabelId'}});
                }
            } else {
                label = await prisma.$queryRaw('SELECT * from "Labels" WHERE "DatasetId" = '+ "'" + DatasetId + "' ORDER BY random() Limit 1;");
                label = label[0];
            }
            datasetItems = await prisma.$queryRaw('SELECT * FROM (' +
                '(SELECT "Id", "LabelId", "Name", "FileName", "FilePath", "IsGoldenData", "Type", false AS "NG" FROM "DatasetItems" DI WHERE "DatasetId" = ' + "'" + DatasetId + "'  AND \"IsGoldenData\" = " + true + " AND \"LabelId\" = '" + label.Id +  "' AND \"AnswersCount\" < " + ds.AnswerReplicationCount +  "   AND NOT EXISTS (Select 1 From \"AnswerLogs\" AL WHERE DI.\"Id\" = AL.\"DatasetItemId\" AND AL.\"UserId\" = '" + uId + "' ) ORDER BY random() LIMIT " + positiveGoldens + ")" +
                'UNION (SELECT "Id", "LabelId", "Name", "FileName", "FilePath", "IsGoldenData", "Type", true AS "NG" FROM "DatasetItems" DI WHERE "DatasetId" = ' + "'" + DatasetId + "' AND \"IsGoldenData\" = " + false + " AND \"LabelId\" <> '" + label.Id +  "' AND \"AnswersCount\" < " + ds.AnswerReplicationCount +  "  AND NOT EXISTS (Select 1 From \"AnswerLogs\" AL WHERE DI.\"Id\" = AL.\"DatasetItemId\" AND AL.\"UserId\" = '" + uId + "' ) ORDER BY random() LIMIT  " + negativeGoldens + ")" +
                'UNION (SELECT "Id", "LabelId", "Name", "FileName", "FilePath", "IsGoldenData", "Type", false AS "NG" FROM "DatasetItems" DI WHERE "DatasetId" = ' + "'" + DatasetId + "' AND \"IsGoldenData\" = " + false + " AND \"LabelId\" = '" + label.Id +  "' AND \"AnswersCount\" < " + ds.AnswerReplicationCount +  "  AND NOT EXISTS (Select 1 From \"AnswerLogs\" AL WHERE DI.\"Id\" = AL.\"DatasetItemId\" AND AL.\"UserId\" = '" + uId + "' ) ORDER BY random() LIMIT  " + noneGoldens + ")" +
                ") AS T1 ORDER BY random()");
        } else {
            datasetItems = await prisma.$queryRaw('SELECT * FROM (' +
                '(SELECT "Id", "LabelId", "Name", "FileName", "FilePath", "IsGoldenData", "Type" FROM "DatasetItems" DI WHERE "DatasetId" = ' + "'" + DatasetId + "'  AND \"IsGoldenData\" = " + true + " AND \"AnswersCount\" < " + ds.AnswerReplicationCount +  " AND NOT EXISTS (Select 1 From \"AnswerLogs\" AL WHERE DI.\"Id\" = AL.\"DatasetItemId\" AND AL.\"UserId\" = '" + req.decoded.Id + "' ) ORDER BY random() LIMIT " + positiveGoldens + ")" +
            'UNION (SELECT "Id", "LabelId", "Name", "FileName", "FilePath", "IsGoldenData", "Type" FROM "DatasetItems" DI WHERE "DatasetId" = ' + "'" + DatasetId + "' AND \"IsGoldenData\" = " + false + " AND \"AnswersCount\" < " + ds.AnswerReplicationCount +  " AND NOT EXISTS (Select 1 From \"AnswerLogs\" AL WHERE DI.\"Id\" = AL.\"DatasetItemId\" AND AL.\"UserId\" = '" + req.decoded.Id + "' ) ORDER BY random() LIMIT " + (negativeGoldens + noneGoldens) + ")" +
            ") AS T1 ORDER BY random()");
        }

        //TODO: is incomplete
        if(datasetItems && datasetItems.length) {
            const generatedQuestion = await QuestionRequestLog.client.create({
                data: {
                    DatasetId: ds.Id,
                    LabelId: Label ? Label.Id : null,
                    Type: Label ? QuestionRequestLog.types.GRID : QuestionRequestLog.types.LINEAR,
                    OwnerId: uId,
                    DatasetItems: datasetItems.map(item => {return {id: item.Id, g: item.IsGoldenData, ng: item.NG}}),
                    ItemsCount: datasetItems.length
                }
            });

            for (let item of datasetItems) {

                let itemDetails = DatasetItem.processItem(item, label);

                questions.push({
                    G: req.decoded.role === 'admin' ? item.IsGoldenData : undefined,
                    NG: req.decoded.role === 'admin' ? item.NG : undefined,
                    DatasetItemId: item.Id,
                    AnswerType: ds.AnswerType,
                    Title: itemDetails.title,
                    ItemName: item.Name,
                    ItemJob: itemDetails.itemJob,
                    Options: ds.AnswerOptions,
                    //QuestionType: 0,
                    //QuestionSubjectFileSrc: null,//TODO: Idk what is it for
                    //QuestionFileSrc: null,//TODO: put datasetitem file src so user can get the image
                    Label: label? label : undefined,
                    QuestionId: generatedQuestion.Id
                });
            }
        } else {
            Dataset.client.update({
                where: {
                    Id: ds.Id
                },
                data: {
                    LabelingStatus: Dataset.labelingStatuses.NO_ITEMS
                }
            });

            return handleError(res, {status: httpStatus.EXPECTATION_FAILED, code: 3350});
        }

        return res.send(questions);
    } catch (error) {
        console.log(error)
        return handleError(res, {});
    }
};

export default questionsController;
