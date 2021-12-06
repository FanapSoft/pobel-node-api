import Options from "../../prisma/models/Options.js";
import Dataset from "../../prisma/models/Dataset.js";
import {handleError} from "../../imports/errors.js";
import httpStatus from "http-status";
import prisma from "../../prisma/prisma.module.js";
import DatasetItem from "../../prisma/models/DatasetItem.js";
import {validationResult} from "express-validator";
import DatasetResults from "../../prisma/models/DatasetResults.js";
// import moment from "jalali-moment";
import * as fs from "fs";
import * as csv from "csv";

const generateCSVOptionKey = "datasetsCSVGenerationData"

const resultsController = {};

resultsController.GetAll = async (req, res) => {
    let {
        DatasetId,
        IsReplicationDone,
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

    if(Skip)
        Skip = parseInt(Skip)

    let where = {}

    if(IsReplicationDone !== null && typeof IsReplicationDone !== "undefined") {
        where.IsReplicationDone = (IsReplicationDone.toLowerCase() === 'true');
    }

    try {
        const ds = await Dataset.findById(DatasetId, 'admin');
        if(!ds)
            return handleError(res, {code: 3002, status: httpStatus.BAD_REQUEST});

        let option = await Options.getOption("datasetsResultCalculationData")
            , currentDatasetOption = option.Value[ds.Id];

        if(!currentDatasetOption || !currentDatasetOption.done) {
            return handleError(res, {code: 3800, status: httpStatus.BAD_REQUEST});
        }

        where.DatasetId = DatasetId;

        let items = await DatasetResults.client.findMany({
            where,
            orderBy: {
                CreatedAt: 'desc',
            },
            take: parseInt(Limit),
            skip: parseInt(Skip)
        });

        const totalCount = await DatasetResults.client.count({
            where,
        });
        return res.send({totalCount, items});
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
}

resultsController.StartCalculatingResults = async (req, res) => {
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

        if(ds.AnswerPack.Title === 'Feeling') {
            execCalculationType2(DatasetId, optData[DatasetId].offset, optData[DatasetId].limit)
        } else {
            execCalculation(DatasetId, optData[DatasetId].offset, optData[DatasetId].limit);
        }
        await Options.updateOption("datasetsResultCalculationData", optData);
        return res.send({success: true});

    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
};

resultsController.StopCalculatingResults = async (req, res) => {
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

resultsController.Reset = async (req, res) => {
    const {
        DatasetId,
        CSV
    } = req.query;

    let optKey = CSV ? generateCSVOptionKey : "datasetsResultCalculationData";
    let opt = await Options.getOption(optKey)
        , optData = opt ? opt.Value : {};

    if(optData[DatasetId])
        optData[DatasetId] = null
    await Options.updateOption(optKey, optData);

    if(CSV) {
        if(fs.existsSync(__dirname + '/../../public/export.csv'))
            fs.unlinkSync(__dirname + '/../../public/export.csv');
    } else {
        await DatasetResults.client.deleteMany({
            where: {
                DatasetId: DatasetId
            }
        });
    }

    return res.send({success: true});
};

resultsController.GetState = async (req, res) => {
    let {
        optionKey
    } = req.query;

    if(!optionKey) {
        optionKey = "datasetsResultCalculationData"
    }

    try {
        let opt = await Options.getOption(optionKey)
        return res.send({success: true, state: opt ? opt.Value : null});
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
};

resultsController.StartGenerateCSV = async (req, res) => {
    let {
        DatasetId,
        IsReplicationDone
    } = req.query;

    try {
        const ds = await Dataset.findById(DatasetId, 'admin')
        if(!ds)
            return handleError(res, {code: 3002, status: httpStatus.BAD_REQUEST});


        let opt = await Options.getOption("datasetsCSVGenerationData")
            , optData = opt ? opt.Value : {}
            , startupData = {
            datasetName: ds.Name,
            offset: 0,
            limit: 50000,
            totalCount: 0,
            isReplicationDone: null,
            started: true,
            done: false,
            hasError: false,
            error: null,
            message: null,
            canContinue: true
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
        let where = {}

        if(IsReplicationDone !== null && typeof IsReplicationDone !== "undefined") {
            where.IsReplicationDone = (IsReplicationDone.toLowerCase() === 'true');
        }
        where.DatasetId = DatasetId;

        let dataCount = await DatasetResults.client.count({
            where
        })

        optData[DatasetId].totalCount = dataCount;

        if(fs.existsSync(__dirname + '/../../public/export.csv'))
            fs.unlinkSync(__dirname + '/../../public/export.csv');
        await Options.updateOption(generateCSVOptionKey, optData);
        execCSVGeneration({
            DatasetId: DatasetId,
            Offset: optData[DatasetId].offset,
            IsReplicationDone
        });
        return res.send({success: true});
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
};

async function execCSVGeneration({
        DatasetId,
        Offset = 0,
        IsReplicationDone = null,
        Limit = 50000,
    }) {

    let where = {}

    if(IsReplicationDone !== null && typeof IsReplicationDone !== "undefined") {
        where.IsReplicationDone = (IsReplicationDone.toLowerCase() === 'true');
    }

    where.DatasetId = DatasetId;

    try {
        let items = await DatasetResults.client.findMany({
            where,
            skip: Offset,
            take: Limit
        });

        csv.stringify(items, {
            header: true
        }, async function (err, output) {
            if(!err){
                var stream = fs.createWriteStream(__dirname + '/../../public/export.csv', {flags:'a'});
                stream.write(output + "\n");
                stream.end();
                //await fs.appendFileSync(__dirname + '/../../public/export.csv', output);
                let opt = await Options.getOption(generateCSVOptionKey)
                    , optData = opt.Value[DatasetId];

                if(!optData)
                    return;

                if(optData.canContinue) {
                    if(optData.limit + optData.offset < optData.totalCount) {
                        optData.offset = optData.limit + optData.offset;
                        opt.Value[DatasetId] = optData;
                        await Options.updateOption(generateCSVOptionKey, opt.Value);
                        return await execCSVGeneration({
                            DatasetId,
                            Offset: optData.offset,
                            Limit: optData.limit,
                            IsReplicationDone
                        });
                    } else {
                        optData.canContinue = false;
                        optData.done = true;
                        optData.started = false;
                        opt.Value[DatasetId] = optData;
                        await Options.updateOption(generateCSVOptionKey, opt.Value);
                        return;
                    }
                } else if(!optData.hasError) {
                    optData.offset = optData.limit + optData.offset;
                    opt.Value[DatasetId] = optData;
                    await Options.updateOption(generateCSVOptionKey, opt.Value);
                }
            }
        });
    } catch (error) {
        let opt = await Options.getOption(generateCSVOptionKey)
            , optData = opt.Value[DatasetId] ? opt.Value[DatasetId] : {};
        optData.canContinue = false;
        optData.done = false;
        optData.started = false;
        optData.hasError = true;
        optData.error = (error && typeof error !== "string" ? JSON.stringify(error) : error);
        opt.Value[DatasetId] = optData;
        await Options.updateOption(generateCSVOptionKey, opt.Value);
        console.log(error);
        // return;
    }
}

async function execCalculation(datasetId, offset, limit) {

    try {
        await prisma.$queryRaw`
        INSERT INTO "DatasetResults"
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
                    0,
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
            subquery.replicationCount as "RequiredReplication",
            subquery."FileName"
        from (
            select dsitems."DatasetItemId", dsitems."AnswerReplicationCount" as replicationCount, dsitems."DatasetId",
            dsitems."FileName",
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
                "Datasets"."Id" as "DatasetId", "DatasetItems"."FileName" as "FileName" 
                from "DatasetItems"
                JOIN "Datasets" ON "DatasetItems"."DatasetId" = "Datasets"."Id"
                WHERE "DatasetId" = ${datasetId} AND "IsGoldenData" = FALSE
                LIMIT ${limit}
                OFFSET ${offset}
            ) dsitems
        ) subquery`;

        let opt = await Options.getOption("datasetsResultCalculationData")
            , optData = opt.Value[datasetId];
        if(!optData)
            return;

        if(optData.canContinue) {
            if(optData.limit + optData.offset < optData.totalCount) {
                optData.offset = optData.limit + optData.offset;
                opt.Value[datasetId] = optData;
                await Options.updateOption("datasetsResultCalculationData", opt.Value);
                return await execCalculation(datasetId, optData.offset, optData.limit);
            } else {
                optData.canContinue = false;
                optData.done = true;
                optData.started = false;
                opt.Value[datasetId] = optData;
                await Options.updateOption("datasetsResultCalculationData", opt.Value);
                return;
            }
        } else if(!optData.hasError) {
            optData.offset = optData.limit + optData.offset;
            opt.Value[datasetId] = optData;
            await Options.updateOption("datasetsResultCalculationData", opt.Value);
        }
    } catch (error) {
        let opt = await Options.getOption("datasetsResultCalculationData")
            , optData = opt.Value[datasetId] ? opt.Value[datasetId] : {};
        optData.canContinue = false;
        optData.done = false;
        optData.started = false;
        optData.hasError = true;
        optData.error = (error && typeof error !== "string" ? JSON.stringify(error) : error);
        opt.Value[datasetId] = optData;
        await Options.updateOption("datasetsResultCalculationData", opt.Value);
        console.log(error);
        return;
    }

}

async function execCalculationType2(datasetId, offset, limit) {

    try {
        await prisma.$queryRaw`
        INSERT INTO "DatasetResults"
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
            subquery."TotalNoIdeaAnswers",
            case
                WHEN subquery."TotalYesAnswers" * 100 / subquery.replicationCount > 50 THEN 'yes'
                WHEN subquery."TotalNoAnswers" * 100 / subquery.replicationCount > 50 THEN 'no'
                WHEN subquery."TotalNoIdeaAnswers" * 100 / subquery.replicationCount > 50 THEN 'noidea'
                ELSE 'none'
                END AS "OverAllResult",
            case
                WHEN subquery."TotalYesAnswers" * 100 / subquery.replicationCount > 50
                    THEN subquery."TotalYesAnswers" * 100 / subquery.replicationCount
                WHEN subquery."TotalNoAnswers" * 100 / subquery.replicationCount > 50
                    THEN subquery."TotalNoAnswers" * 100 / subquery.replicationCount
                WHEN subquery."TotalNoIdeaAnswers" * 100 / subquery.replicationCount > 50
                    THEN subquery."TotalNoIdeaAnswers" * 100 / subquery.replicationCount
                ELSE 0
                END AS "OverAllResultPercent",
            subquery.replicationCount as "RequiredReplication",
            subquery."FileName",
            subquery."ExternalId"
        from (
            select dsitems."DatasetItemId", dsitems."AnswerReplicationCount" as replicationCount, dsitems."DatasetId",
            dsitems."FileName", dsitems."ExternalId",
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
                select Count(*) as "TotalNoAnswers" 
                FROM "AnswerLogs" 
                where 
                  "DatasetItemId" = dsitems."DatasetItemId"
                  AND "Answer" = -1
            ),
            (
                select Count(*) as "TotalNoIdeaAnswers" 
                FROM "AnswerLogs" 
                where 
                "DatasetItemId" = dsitems."DatasetItemId"
                AND "Answer" = 0
            )

            FROM (
                select "DatasetItems"."Id" as "DatasetItemId", "Datasets"."AnswerReplicationCount" as "AnswerReplicationCount",
                "Datasets"."Id" as "DatasetId", "DatasetItems"."FileName" as "FileName", "DatasetItems"."ExternalId" as "ExternalId"
                from "DatasetItems"
                JOIN "Datasets" ON "DatasetItems"."DatasetId" = "Datasets"."Id"
                WHERE "DatasetId" = ${datasetId} AND "IsGoldenData" = FALSE
                ORDER BY "DatasetItems"."CreatedAt" DESC
                LIMIT ${limit}
                OFFSET ${offset}
            ) dsitems
        ) subquery`;

        let opt = await Options.getOption("datasetsResultCalculationData")
            , optData = opt.Value[datasetId];
        if(!optData)
            return;

        if(optData.canContinue) {
            if(optData.limit + optData.offset < optData.totalCount) {
                optData.offset = optData.limit + optData.offset;
                opt.Value[datasetId] = optData;
                await Options.updateOption("datasetsResultCalculationData", opt.Value);
                return await execCalculation(datasetId, optData.offset, optData.limit);
            } else {
                optData.canContinue = false;
                optData.done = true;
                optData.started = false;
                opt.Value[datasetId] = optData;
                await Options.updateOption("datasetsResultCalculationData", opt.Value);
                return;
            }
        } else if(!optData.hasError) {
            optData.offset = optData.limit + optData.offset;
            opt.Value[datasetId] = optData;
            await Options.updateOption("datasetsResultCalculationData", opt.Value);
        }
    } catch (error) {
        let opt = await Options.getOption("datasetsResultCalculationData")
            , optData = opt.Value[datasetId] ? opt.Value[datasetId] : {};
        optData.canContinue = false;
        optData.done = false;
        optData.started = false;
        optData.hasError = true;
        optData.error = (error && typeof error !== "string" ? JSON.stringify(error) : error);
        opt.Value[datasetId] = optData;
        await Options.updateOption("datasetsResultCalculationData", opt.Value);
        console.log(error);
        return;
    }

}

export default resultsController;
