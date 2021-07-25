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
import utils from "../../imports/utils";

const questionsController = {};

questionsController.getQuestions = async (req, res, next, runCount = 0) => {
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
        const ds = await Dataset.findById(DatasetId, 'admin');
        if(!ds) {
            return handleError(res, {code: 3002, status: httpStatus.BAD_REQUEST});
        }

        if(ds.LabelingStatus > Dataset.labelingStatuses.LABELING_ALLOWED) {
            return handleError(res, {status: httpStatus.EXPECTATION_FAILED, error: {code: 3300}});
        }

        const userTarget = await UserTarget.getUserCurrentTarget(uId, ds.Id);
        if(!userTarget || userTarget.TargetEnded) {
            return handleError(res, {status: httpStatus.EXPECTATION_FAILED, code: 3203});
        }

        let answersCount = await Answer.client.count({
            where: {
                DatasetId,
                UserId: uId,
                CreditCalculated: false
            }
        });

        if(answersCount >= userTarget.TargetDefinition.AnswerCount) {
            await UserTarget.finishUserTarget(userTarget.Id);
            return handleError(res, {status: httpStatus.EXPECTATION_FAILED, code: 3203});
        }

        answersCount = await Answer.client.count({
            where: {
                DatasetId,
                UserId: uId
            }
        });

        if(ds.AnswerBudgetCountPerUser && ds.AnswerBudgetCountPerUser <= answersCount) {
            await UserTarget.finishUserTarget(userTarget.Id);
            return handleError(res, {status: httpStatus.EXPECTATION_FAILED, code: 3301});
        }

        let datasetItems = null;
        let label = null;

        const positiveGoldens = Math.floor((25 / 100) * Count);
        const negativeGoldens = Math.ceil((20 / 100) * Count);
        const noneGoldensCount =  Count - (positiveGoldens + negativeGoldens);

        if (OnlyOneLabel) {
            if(LabelId) {
                // label = await Label.findById(LabelId, 'admin');
                label = await prisma.$queryRaw("select * from \"Labels\" " +
                    "where \"ItemsDone\"=false AND \"Id\"='" + LabelId + "'  " +
                    "AND EXISTS (select 1 from \"DatasetItems\"  " +
                    " where \"DatasetId\" = '" + DatasetId + "'  " +
                    " and \"DatasetItems\".\"AnswersCount\" < " + ds.AnswerReplicationCount +
                    " and \"DatasetItems\".\"IsGoldenData\"= " + false +
                    " and not exists (select 1 from \"AnswerLogs\" al where \"DatasetItems\".\"Id\"=al.\"Id\" and al.\"UserId\"='" + uId + "' )) " +
                    "ORDER BY random()\n" +
                    "LIMIT 1");
                if(label.length)
                    label = label[0];
                else
                    return handleError(res, {status: httpStatus.EXPECTATION_FAILED, error: {code: 3002, message: 'Invalid LabelId'}});

            } else {
                // label = await prisma.$queryRaw('SELECT * from "Labels" WHERE "DatasetId" = '+ "'" + DatasetId + "' AND \"ItemsDone\" = " + false + " ORDER BY random() Limit 1;");
                label = await prisma.$queryRaw("select * from \"Labels\" \n" +
                    "where \"ItemsDone\"=false \n" +
                    "AND EXISTS (select 1 from \"DatasetItems\" " +
                    " where \"DatasetId\" = '" + DatasetId + "' " +
                    " and \"DatasetItems\".\"AnswersCount\" < " + ds.AnswerReplicationCount +
                    " and \"DatasetItems\".\"IsGoldenData\"= " + false +
                    " and not exists (select 1 from \"AnswerLogs\" al where \"DatasetItems\".\"Id\"=al.\"Id\" and al.\"UserId\"='" + uId + "' )) " +
                    "ORDER BY random() " +
                    "LIMIT 1");

                if(label.length)
                    label = label[0];
                else {
                    await UserTarget.finishUserTarget(userTarget.Id);
                    return handleError(res, {status: httpStatus.EXPECTATION_FAILED, code: 3600});
                }
            }


            datasetItems = await prisma.$queryRaw('SELECT * FROM (' +
                '(SELECT "Id", "LabelId", "Name", "FileName", "FilePath", "IsGoldenData", "Type", false AS "NG" FROM "DatasetItems" DI WHERE "DatasetId" = ' + "'" + DatasetId + "'  AND \"IsGoldenData\" = " + true + " AND \"LabelId\" = '" + label.Id +  "' AND \"AnswersCount\" < " + ds.AnswerReplicationCount +  "   AND NOT EXISTS (Select 1 From \"AnswerLogs\" AL WHERE DI.\"Id\" = AL.\"DatasetItemId\" AND AL.\"UserId\" = '" + uId + "' ) ORDER BY random() LIMIT " + positiveGoldens + ")" +
                'UNION (SELECT "Id", "LabelId", "Name", "FileName", "FilePath", "IsGoldenData", "Type", true AS "NG" FROM "DatasetItems" DI WHERE "DatasetId" = ' + "'" + DatasetId + "' AND \"IsGoldenData\" = " + true + " AND \"LabelId\" <> '" + label.Id +  "'  AND NOT EXISTS (Select 1 From \"AnswerLogs\" AL WHERE DI.\"Id\" = AL.\"DatasetItemId\" AND AL.\"UserId\" = '" + uId + "' ) ORDER BY random() LIMIT  " + negativeGoldens + ")" +
                'UNION (SELECT "Id", "LabelId", "Name", "FileName", "FilePath", "IsGoldenData", "Type", false AS "NG" FROM "DatasetItems" DI WHERE "DatasetId" = ' + "'" + DatasetId + "' AND \"IsGoldenData\" = " + false + " AND \"LabelId\" = '" + label.Id +  "' AND \"AnswersCount\" < " + ds.AnswerReplicationCount +  "  AND NOT EXISTS (Select 1 From \"AnswerLogs\" AL WHERE DI.\"Id\" = AL.\"DatasetItemId\" AND AL.\"UserId\" = '" + uId + "' ) ORDER BY random() LIMIT " + noneGoldensCount + ")" +
                ") AS T1 ORDER BY random()");


            //let noneGoldens = await prisma.$queryRaw('SELECT "Id", "LabelId", "Name", "FileName", "FilePath", "IsGoldenData", "Type", false AS "NG" FROM "DatasetItems" DI WHERE "DatasetId" = ' + "'" + DatasetId + "' AND \"IsGoldenData\" = " + false + " AND \"LabelId\" = '" + label.Id +  "' AND \"AnswersCount\" < " + ds.AnswerReplicationCount +  "  AND NOT EXISTS (Select 1 From \"AnswerLogs\" AL WHERE DI.\"Id\" = AL.\"DatasetItemId\" AND AL.\"UserId\" = '" + uId + "' ) ORDER BY random() LIMIT " + noneGoldensCount + ";")

            /*if(!noneGoldens || !noneGoldens.length) {
                //Sets Label.ItemsDone to true if all items reached their replicationCount

                await Label.maybeDoneLabel(label.Id, ds);

                const remainingLabelsCount = await Label.client.count({
                    where: {
                        ItemsDone: false,
                        DatasetId: ds.Id,
                    }
                });

                if(remainingLabelsCount) {
                    req.query.LabelId = null;
                    //TODO: Improve this to findout the dataset items are done
                    if(runCount < 4)
                        return questionsController.getQuestions(req, res, next,runCount + 1);
                    else
                        return handleError(res, {status: httpStatus.INTERNAL_SERVER_ERROR, code: 3600});
                } else {
                    await Dataset.changeDatasetLabelingStatus(ds.Id, Dataset.labelingStatuses.ITEMS_C0OMPLETED);
                    await UserTarget.finishUserTarget(userTarget.Id);
                    return handleError(res, {status: httpStatus.EXPECTATION_FAILED, code: 3600});
                }
            }*/

            /*datasetItems = [
                ...datasetItems,
                ...noneGoldens
            ];
            datasetItems.sort(utils.sortRandom);*/
        } else {
            datasetItems = await prisma.$queryRaw('SELECT * FROM (' +
                '(SELECT "Id", "LabelId", "Name", "FileName", "FilePath", "IsGoldenData", "Type" FROM "DatasetItems" DI WHERE "DatasetId" = ' + "'" + DatasetId + "'  AND \"IsGoldenData\" = " + true + " AND \"AnswersCount\" < " + ds.AnswerReplicationCount +  " AND NOT EXISTS (Select 1 From \"AnswerLogs\" AL WHERE DI.\"Id\" = AL.\"DatasetItemId\" AND AL.\"UserId\" = '" + req.decoded.Id + "' ) ORDER BY random() LIMIT " + positiveGoldens + ")" +
            'UNION (SELECT "Id", "LabelId", "Name", "FileName", "FilePath", "IsGoldenData", "Type" FROM "DatasetItems" DI WHERE "DatasetId" = ' + "'" + DatasetId + "' AND \"IsGoldenData\" = " + false + " AND \"AnswersCount\" < " + ds.AnswerReplicationCount +  " AND NOT EXISTS (Select 1 From \"AnswerLogs\" AL WHERE DI.\"Id\" = AL.\"DatasetItemId\" AND AL.\"UserId\" = '" + req.decoded.Id + "' ) ORDER BY random() LIMIT " + (negativeGoldens + noneGoldensCount) + ")" +
            ") AS T1 ORDER BY random()");
        }

        //TODO: is incomplete
        if(datasetItems && datasetItems.length) {
            const generatedQuestion = await QuestionRequestLog.client.create({
                data: {
                    DatasetId: ds.Id,
                    LabelId: label ? label.Id : null,
                    Type: Label ? QuestionRequestLog.types.GRID : QuestionRequestLog.types.LINEAR,
                    OwnerId: uId,
                    DatasetItems: datasetItems.map(item => {return {id: item.Id, determinedLabelId: label ? label.Id : item.LabelId,  g: item.IsGoldenData ? 1 : 0, ng: item.NG  ? 1 : 0 }}),
                    ItemsCount: datasetItems.length
                }
            });

            let goldensPath = null;
            if(label) {
                goldensPath = datasetItems.filter(item => item.isGoldenData);
                goldensPath = goldensPath.length ? goldensPath[0].FilePath : null;
            }

            for (let item of datasetItems) {
                let itemDetails = DatasetItem.processItem(item, label, goldensPath);

                questions.push({
                    G: req.decoded.role === 'admin' ? item.IsGoldenData : undefined,
                    NG: req.decoded.role === 'admin' ? item.NG : undefined,
                    DatasetItemId: item.Id,
                    AnswerType: ds.AnswerType,
                    Title: itemDetails.title,
                    ItemName: label? label.Name.replace(/[0-9]/g, "").replace(/_/g, " ") : item.Name,
                    ItemJob: itemDetails.itemJob,
                    Options: ds.AnswerOptions,
                    //QuestionType: 0,
                    Label: label? label : undefined,
                    QuestionId: generatedQuestion.Id
                });
            }
        } else {
            await Dataset.changeDatasetLabelingStatus(ds.Id, Dataset.labelingStatuses.ITEMS_COMPLETED)
            return handleError(res, {status: httpStatus.EXPECTATION_FAILED, code: 3350});
        }

        return res.send(questions);
    } catch (error) {
        console.log(error)
        return handleError(res, {});
    }
};

export default questionsController;
