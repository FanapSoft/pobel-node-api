import {CronJob} from "cron"
import Options from "../../prisma/models/Options";
import Dataset from "../../prisma/models/Dataset";
import {handleError} from "../../imports/errors";
import httpStatus from "http-status";
import prisma from "../../prisma/prisma.module";
import DatasetItem from "../../prisma/models/DatasetItem";
import {Result, validationResult} from "express-validator";
import DatasetType1Results from "../../prisma/models/DatasetType1Results";
import moment from "jalali-moment";

const resultsController = {};

resultsController.GetAll = async (req, res) => {
    const {
        DatasetId,
        Skip = 0,
        Limit = process.env.API_PAGED_RESULTS_DEFAULT_LIMIT,
    } = req.query;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    if(!DatasetId) {
        return handleError(res, {code: 3002, status: httpStatus.BAD_REQUEST});
    }

    let where = {}

    try {
        const ds = await Dataset.findById(DatasetId, 'admin');
        if(!ds)
            return handleError(res, {code: 3002, status: httpStatus.BAD_REQUEST});

        let option = await Options.getOption("datasetsResultCalculationData")
            , currentDatasetOption = option.Value[ds.Id];

        if(!currentDatasetOption.done) {
            return handleError(res, {code: 3800, status: httpStatus.BAD_REQUEST});
        }

        where.DatasetId = ds.Id;

        let items = await DatasetType1Results.client.findMany({
            where,
            orderBy: {
                CreatedAt: 'desc',
            },
            take: parseInt(Limit),
            skip: Skip
        });

        const totalCount = await Dataset.client.count({
            where,
        });
        return res.send({totalCount, items});
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
}

resultsController.startCalculatingResults = async (req, res) => {
    const {
        DatasetId,
    } = req.query;

    try {
        const ds = await Dataset.findById(DatasetId, 'admin')
        if(!ds)
            return handleError(res, {code: 3002, status: httpStatus.BAD_REQUEST});

        const itemsCount = await DatasetItem.client.count({
            where: {
                DatasetId: ds.Id
            }
        });

        if(!itemsCount) {
            return handleError(res, {code: 3302, status: httpStatus.EXPECTATION_FAILED});
        }

        let opt = await Options.getOption("datasetsResultCalculationData")
            , optData = opt ? opt.Value : {}
            , startupData = {
                datasetName: ds.Name,
                offset: 0,
                limit: 3000,
                canContinue: true,
                totalCount: itemsCount,
                started: true,
                done: false,
                hasError: false,
                error: null,
                message: null
            };

        if(!optData[DatasetId]) {
            optData[DatasetId] = startupData;
        } else {
            if(!optData[DatasetId].done) {
                if(optData[DatasetId].hasError) {
                    return res.send({success: false, hasError: true, error: optData[DatasetId].error});
                } else {
                    optData[DatasetId].started = true;
                    optData[DatasetId].canContinue = true;
                    optData[DatasetId].message = null;
                }
            } else {
                optData[DatasetId] = startupData;
            }
        }

        execCalculation(ds.Id, optData[DatasetId].offset, optData[DatasetId].limit);
        await Options.updateOption("datasetsResultCalculationData", optData);
        return res.send({success: true});

    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
};

resultsController.stopCalculatingResults = async (req, res) => {
    const {
        DatasetId,
    } = req.query;

    let opt = await Options.getOption("datasetsResultCalculationData");
    if(opt.Value[DatasetId]){
        opt.Value[DatasetId].canContinue = false;
        opt.Value[DatasetId].hasError = false;
        opt.Value[DatasetId].message = "Stopped by user request";
    }

    return res.send({success: true});
};

resultsController.resetResults = async (req, res) => {
    const {
        DatasetId,
    } = req.query;

    let opt = await Options.getOption("datasetsResultCalculationData")
        , optData = opt ? opt.Value : {};

    if(optData[DatasetId])
        optData[DatasetId] = null

    await Options.updateOption("datasetsResultCalculationData", optData);
    await DatasetType1Results.client.deleteMany({
        where: {
            DatasetId: DatasetId
        }
    });

    return res.send({success: true});
};

resultsController.getState = async (req, res) => {
    const {} = req.query;

    try {
        let opt = await Options.getOption("datasetsResultCalculationData")
        return res.send({success: true, state: opt ? opt.Value : null});
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
};

async function execCalculation(DatasetId, offset, limit) {

    try {
        await prisma.$queryRaw`
        INSERT INTO "DatasetType1Results"
        SELECT
        gen_random_uuid(),
            NOW() as "CreatedAt",
            subquery."DatasetId",
            subquery."DatasetItemId",
            case
                WHEN subquery."TotalAnswers" < subquery.replicationCount
                THEN false
                ELSE true
                END AS "IsReplicationDone",
                    subquery."TotalAnswers",
                    subquery."TotalYesAnswers",
                    subquery."TotalNoAnswers",
            case
                WHEN subquery."TotalYesAnswers" * 100 / subquery.replicationCount > 50 THEN 'yes'
                WHEN subquery."TotalNoAnswers" * 100 / subquery.replicationCount > 50 THEN 'no'
                ELSE 'none'
                END AS "OverAllResult",
            case
                WHEN subquery."TotalYesAnswers" * 100 / subquery.replicationCount > 50
                THEN subquery."TotalYesAnswers" * 100 / subquery.replicationCount
                WHEN subquery."TotalNoAnswers" * 100 / subquery.replicationCount > 50
                THEN subquery."TotalNoAnswers" * 100 / subquery.replicationCount
                ELSE 0
                END AS "OverAllResultPercent",
            subquery.replicationCount as "RequiredReplication"
        from (
            select dsitems."DatasetItemId", dsitems."AnswerReplicationCount" as replicationCount, dsitems."DatasetId",
            (
                select Count(*) as "TotalAnswers" 
                FROM "AnswerLogs" 
                where "DatasetItemId" = dsitems."DatasetItemId"
            ),
            (
                select Count(*) as "TotalYesAnswers" 
                FROM "AnswerLogs" 
                where 
                      "DatasetItemId" = dsitems."DatasetItemId" 
                      AND "Answer" = 1
            ),
            (
                select Count(*) as "TotalNoAnswers" FROM "AnswerLogs" where "DatasetItemId" = dsitems."DatasetItemId" AND "Answer" = 0
            )
    
            FROM (
                select "DatasetItems"."Id" as "DatasetItemId", "Datasets"."AnswerReplicationCount" as "AnswerReplicationCount",
                "Datasets"."Id" as "DatasetId"
                from "DatasetItems"
                JOIN "Datasets" ON "DatasetItems"."DatasetId" = "Datasets"."Id"
                WHERE "DatasetId" = ${DatasetId} AND "IsGoldenData" = FALSE
                LIMIT ${limit}
                OFFSET ${offset}
            ) dsitems
        ) subquery`;

        let opt = await Options.getOption("datasetsResultCalculationData")
            , optData = opt.Value[DatasetId];
        if(!optData)
            return;

        if(optData.canContinue) {
            if(optData.limit + optData.offset < optData.totalCount) {
                optData.offset = optData.limit + optData.offset;
                opt.Value[DatasetId] = optData;
                await Options.updateOption("datasetsResultCalculationData", opt.Value);
                return await execCalculation(DatasetId, optData.offset, optData.limit);
            } else {
                optData.canContinue = false;
                optData.done = true;
                optData.started = false;
                opt.Value[DatasetId] = optData;
                await Options.updateOption("datasetsResultCalculationData", opt.Value);
                return;
            }
        } else if(!optData.hasError) {
            optData.offset = optData.limit + optData.offset;
            opt.Value[DatasetId] = optData;
            await Options.updateOption("datasetsResultCalculationData", opt.Value);
        }
    } catch (error) {
        let opt = await Options.getOption("datasetsResultCalculationData")
            , optData = opt.Value[DatasetId] ? opt.Value[DatasetId] : {};
        optData.canContinue = false;
        optData.done = false;
        optData.started = false;
        optData.hasError = true;
        optData.error = (error && typeof error !== "string" ? JSON.stringify(error) : error);
        opt.Value[DatasetId] = optData;
        await Options.updateOption("datasetsResultCalculationData", opt.Value);
        console.log(error);
        return;
    }

}

export default resultsController;
