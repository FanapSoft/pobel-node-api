import {handleError} from "../../imports/errors.js";
import Label from "../../prisma/models/Label.js";
import prisma from "../../prisma/prisma.module.js";
import {query, validationResult} from "express-validator";
// import DatasetItem from "../../prisma/models/DatasetItem.js";
import Dataset from "../../prisma/models/Dataset.js";
import httpStatus from "http-status";
import UserTarget from "../../prisma/models/UserTarget.js";
import Answer from "../../prisma/models/Answer.js";

const questionsController = {};

// Get All Answers
questionsController.getQuestions = async (req, res) => {
    let {
        DatasetId,
        LabelId,
        OnlyOneLabel = true,
        Count
    } = req.query;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
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

        const answersCount = Answer.client.count({
            where: {
                DatasetId,
                UserId: req.decoded.Id
            }
        });

        const userTarget = UserTarget.client.findMany({
            where: {
                OwnerId: req.decoded.Id
            },
            include: {
                TargetDefinition: true
            },
            orderBy: {
                CreatedAt: 'desc'
            },
            take: 1
        });

        if(!userTarget || (userTarget.TargetDefinition && userTarget.TargetDefinition.AnswerCount <= answersCount)) {
            return handleError(res, {status: httpStatus.EXPECTATION_FAILED, error: {code: 2004, message: 'تارگت ندارید یا تارگت شما به پایان رسیده است.'}});
        }

        let datasetItems = null;
        let label = null;

        const positiveGoldens = Math.floor(25 / 100 * Count);
        const negativeGoldens = Math.ceil(20 / 100 * Count);
        const noneGoldens =  Count - (positiveGoldens + negativeGoldens);

        if (OnlyOneLabel) {
            if(LabelId) {
                label = await Label.findById(LabelId, 'admin');
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

        if(datasetItems && datasetItems.length) {
            for (let item of datasetItems) {
                questions.push({
                    G: req.decoded.role === 'admin' ? item.IsGoldenData : undefined,
                    DatasetItemId: item.Id,
                    AnswerType: ds.AnswerType,
                    Title: null, //TODO: calculate from ds.questiontemplate
                    ItemName: item.Name,
                    Options: ds.AnswerOptions,
                    QuestionType: 0,
                    QuestionSubjectFileSrc: null,//TODO: Idk what is it for
                    QuestionFileSrc: null,//TODO: put datasetitem file src so user can get the image
                    Label: label? label : undefined
                });
            }
        }

        return res.send(questions);
    } catch (error) {
        console.log(error)
        return handleError(res, {});
    }
};

export default questionsController;
