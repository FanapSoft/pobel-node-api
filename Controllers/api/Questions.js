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

        if(ds.LabelingStatus === 0) {
            return handleError(res, {status: httpStatus.EXPECTATION_FAILED, error: {code: 3300}});
        }

        const answersCount = Answer.client.count({
            where: {
                DatasetId,
                UserId: req.decoded.Id
            }
        });

        const userTargets = UserTarget.client.findMany({
            where: {
                OwnerId: req.decoded.Id,
                DatasetId: newTargetDefinition.DatasetId
            },
            include: {
                TargetDefinition: true
            },
            orderBy: {
                CreatedAt: 'desc'
            },
            take: 1
        });

        if(!userTargets.length || (userTargets[0].TargetDefinition && userTargets.TargetDefinition.TargetEnded)) {
            return handleError(res, {status: httpStatus.EXPECTATION_FAILED, code: 3203});
        }

        let datasetItems = null;
        let label = null;

        const positiveGoldens = Math.floor(25 / 100 * Count);
        const negativeGoldens = Math.ceil(20 / 100 * Count);
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
                '(SELECT "Id", "LabelId", "Name", "FileName", "IsGoldenData", "Type" FROM "DatasetItems" DI WHERE "DatasetId" = ' + "'" + DatasetId + "'  AND \"IsGoldenData\" = " + true + " AND \"LabelId\" = '" + label.Id +  "' AND \"AnswersCount\" < " + ds.AnswerReplicationCount +  "   AND NOT EXISTS (Select 1 From \"AnswerLogs\" AL WHERE DI.\"Id\" = AL.\"DatasetItemId\" AND AL.\"UserId\" = '" + req.decoded.Id + "' ) ORDER BY random() LIMIT " + positiveGoldens + ")" +
                'UNION (SELECT "Id", "LabelId", "Name", "FileName", "IsGoldenData", "Type" FROM "DatasetItems" DI WHERE "DatasetId" = ' + "'" + DatasetId + "' AND \"IsGoldenData\" = " + false + " AND \"LabelId\" <> '" + label.Id +  "' AND \"AnswersCount\" < " + ds.AnswerReplicationCount +  "  AND NOT EXISTS (Select 1 From \"AnswerLogs\" AL WHERE DI.\"Id\" = AL.\"DatasetItemId\" AND AL.\"UserId\" = '" + req.decoded.Id + "' ) ORDER BY random() LIMIT  " + negativeGoldens + ")" +
                'UNION (SELECT "Id", "LabelId", "Name", "FileName", "IsGoldenData", "Type" FROM "DatasetItems" DI WHERE "DatasetId" = ' + "'" + DatasetId + "' AND \"IsGoldenData\" = " + false + " AND \"LabelId\" = '" + label.Id +  "' AND \"AnswersCount\" < " + ds.AnswerReplicationCount +  "  AND NOT EXISTS (Select 1 From \"AnswerLogs\" AL WHERE DI.\"Id\" = AL.\"DatasetItemId\" AND AL.\"UserId\" = '" + req.decoded.Id + "' ) ORDER BY random() LIMIT  " + noneGoldens + ")" +
                ") AS T1 ORDER BY random()");
        } else {
            datasetItems = await prisma.$queryRaw('SELECT * FROM (' +
                '(SELECT "Id", "LabelId", "Name", "FileName", "IsGoldenData", "Type" FROM "DatasetItems" DI WHERE "DatasetId" = ' + "'" + DatasetId + "'  AND \"IsGoldenData\" = " + true + " AND \"AnswersCount\" < " + ds.AnswerReplicationCount +  " AND NOT EXISTS (Select 1 From \"AnswerLogs\" AL WHERE DI.\"Id\" = AL.\"DatasetItemId\" AND AL.\"UserId\" = '" + req.decoded.Id + "' ) ORDER BY random() LIMIT " + positiveGoldens + ")" +
            'UNION (SELECT "Id", "LabelId", "Name", "FileName", "IsGoldenData", "Type" FROM "DatasetItems" DI WHERE "DatasetId" = ' + "'" + DatasetId + "' AND \"IsGoldenData\" = " + false + " AND \"AnswersCount\" < " + ds.AnswerReplicationCount +  " AND NOT EXISTS (Select 1 From \"AnswerLogs\" AL WHERE DI.\"Id\" = AL.\"DatasetItemId\" AND AL.\"UserId\" = '" + req.decoded.Id + "' ) ORDER BY random() LIMIT " + (negativeGoldens + noneGoldens) + ")" +
            ") AS T1 ORDER BY random()");
        }

        //TODO: is incomplete
        if(datasetItems && datasetItems.length) {
            const generatedQuestion = await QuestionRequestLog.client.create({
                DatasetId: ds.Id,
                LabelId: Label ? Label.Id : null,
                Type: Label ? QuestionRequestLog.types.GRID : QuestionRequestLog.types.LINEAR,
                OwnerId: uId,
                DatasetItems: datasetItems.map(item => {return {id: item.id, g: item.IsGoldenData}}),
                ItemsCount: datasetItems.length
            });

            for (let item of datasetItems) {
                let itemJob = item.filePath;
                itemJob = fieldName.split('\\')[4];

                questions.push({
                    G: req.decoded.role === 'admin' ? item.IsGoldenData : undefined,
                    DatasetItemId: item.Id,
                    AnswerType: ds.AnswerType,
                    Title: null, //TODO: calculate from ds.questiontemplate
                    ItemName: item.Name,
                    ItemJob: itemJob,
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
                    LabelingStatus: 0
                }
            });

            return handleError(res, {status: httpStatus.EXPECTATION_FAILED, code: 3300});
        }

        return res.send(questions);
    } catch (error) {
        console.log(error)
        return handleError(res, {});
    }
};

export default questionsController;
