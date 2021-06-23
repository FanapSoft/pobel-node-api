import httpStatus from "http-status";
import {handleError} from "../../imports/errors.js";
import Answer from "../../prisma/models/Answer.js";
import Dataset from "../../prisma/models/Dataset.js";
import DatasetItem from "../../prisma/models/DatasetItem.js";

const answersController = {};

// Get All Answers
answersController.findAll = async (req, res) => {
    const {
        IncludeQuestion,
        DatasetId,
        UserId,
        From,
        To,
        Limit = 10,
        Skip = 0
    } = req.query;

    let where = {}, include = null;
    //if(IncludeQuestion !== null && IncludeQuestion !== undefined)

    if(DatasetId)
        where.DatasetId = DatasetId;
    if(UserId)
        where.UserId = UserId;

    if(From)
        where.CreatedAt = {
            gte: new Date(From).toISOString()
        }

    if(To)
        where.CreatedAt = {
            lte: new Date(To).toISOString()
        }

    try {
        const items = await Answer.client.findMany({
            where,
            orderBy: {
                CreatedAt: 'desc',
            },
            take: Limit,
            skip: Skip
        });
        const totalCount = await Answer.client.count({
            where,
        });
        return res.send({totalCount, items});
    } catch (error) {
        console.log(error)
        return handleError(res, {});
    }
};

answersController.findOne = async (req, res) => {
    const {
        id
    } = req.params;
    try {
        let answer = await Answer.findById(id, req.decoded.Role);

        if (!answer) {
            return handleError(res, {code: 3002, status: httpStatus.BAD_REQUEST});
        }

        return res.send(answer);
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
};

answersController.submitBatchAnswer = async (req, res, next) => {
    const {
        Answers
    } = req.body;

    if(!Answers || !Array.isArray(Answers) || !Answers.length) {
        return handleError(res, {status: httpStatus.BAD_REQUEST, error: {code: 3002, message:'Invalid Answers'}});
    }

    let storedAnswers = [];

    for(const [index, item] of Answers.entries()) {
        try {
            let ds = await Dataset.findById(item.DatasetId, req.decoded.Role);
            if (!ds)
                return handleError(res, {status: httpStatus.BAD_REQUEST, error: {code: 3002, message:'Invalid dataset: ' + item.DatasetId}});

            let dsi = await DatasetItem.findById(item.DatasetItemId, req.decoded.Role);
            if (!dsi)
                return handleError(res, {status: httpStatus.BAD_REQUEST, error: {code: 3002, message:'Invalid dataset item: ' + item.DatasetId}});


            //TODO: Calculate the correct answer point
            let dataset = await Answer.client.create({
                data: {
                    UserId: req.decoded.Id,
                    Ignored: JSON.parse(item.Ignored),
                    IgnoreReason: item.IgnoreReason,
                    DatasetId: item.DatasetId,
                    DatasetItemId: item.DatasetItemId,
                    Answer: JSON.parse(item.AnswerIndex),
                    QuestionObject: item.QuestionObject,
                    DurationToAnswerInSeconds: JSON.parse(item.DurationToAnswerInSeconds),
                }
            });
            await DatasetItem.client.update({
                where: { Id: dsi.Id },
                data: {
                    AnswersCount: dsi.AnswersCount + 1
                }
            });

            storedAnswers.push({
                id: dataset.Id,
                targetEnded: false
            });

        } catch (error) {
            console.log(error);
            return handleError(res, {});
        }
    }

    return res.send(storedAnswers);
};

answersController.stats = async (req, res, next) => {
    const {
        UserId,
        DatasetId
    } = req.query;

    let where = {};

    if(UserId)
        where.UserId = UserId

    if(DatasetId)
        where.DatasetId = DatasetId

    try {
        let result = await Answer.client.count({
            where
        });

        return res.send({
            totalCount: result
        });

    } catch (error) {
        console.log(error)
        return handleError(res, {});
    }
};

export default answersController;
