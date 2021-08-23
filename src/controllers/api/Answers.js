import httpStatus from "http-status";
import {handleError} from "../../imports/errors.js";
import Answer from "../../prisma/models/Answer.js";
import Dataset from "../../prisma/models/Dataset.js";
import DatasetItem from "../../prisma/models/DatasetItem.js";
import QuestionRequestLog from "../../prisma/models/QuestionRequestLog.js";
import UserTarget from "../../prisma/models/UserTarget.js";
import {validationResult} from "express-validator";
import moment from "jalali-moment";
import prisma from "../../prisma/prisma.module";

const answersController = {};

// Get All Answers
answersController.findAll = async (req, res) => {
    const {
        //TODO:Still not implemented
        IncludeDatasetItem,
        DatasetId,
        UserId,
        From,
        To,
        Limit = process.env.API_PAGED_RESULTS_DEFAULT_LIMIT,
        Skip = 0
    } = req.query;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let uId = UserId ? UserId : req.decoded.Id;
    if(req.decoded.Role !== 'admin') {
        uId = req.decoded.Id;
    }

    let where = {};

    if(DatasetId)
        where.DatasetId = DatasetId;
    if(UserId)
        where.UserId = uId;

    if(From)
        where.CreatedAt = {
            gte: new Date(From).toISOString()
        }

    if(To)
        where.CreatedAt = {
            lte: new Date(To).toISOString()
        }

    let select = {
        ...Answer.getFieldsByRole(req.decoded.role),
        DeterminedLabel: true
    };

    if(IncludeDatasetItem !== null && IncludeDatasetItem !== undefined){
        select.DatasetItem = true;
    }


    try {
        const items = await Answer.client.findMany({
            select,
            where,
            orderBy: {
                CreatedAt: 'desc',
            },
            take: parseInt(Limit),
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
        Answers,
        QuestionId
    } = req.body;

    if(!Answers || !Array.isArray(Answers) || !Answers.length) {
        return handleError(res, {status: httpStatus.BAD_REQUEST, error: {code: 3002, message:'Invalid Answers array'}});
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let storedAnswers = [], question;

    question = await QuestionRequestLog.findById(QuestionId, 'admin');
    if(!question) {
        return handleError(res, {status: httpStatus.BAD_REQUEST, error: {code: 3002, message:'Invalid QuestionId'}});
    }

    const ds = await Dataset.findById(question.DatasetId, 'admin');

    if(!ds) {
        return handleError(res, {code: 3002, status: httpStatus.BAD_REQUEST});
    }

    if(ds.LabelingStatus > Dataset.labelingStatuses.LABELING_ALLOWED) {
        return handleError(res, {status: httpStatus.EXPECTATION_FAILED, error: {code: 3300}});
    }

    const userTarget = await UserTarget.getUserCurrentTarget(req.decoded.Id, question.DatasetId);
    if(!userTarget || userTarget.TargetEnded) {
        return handleError(res, {status: httpStatus.EXPECTATION_FAILED, code: 3203});
    }

    let answersCount = await Answer.client.count({
        where: {
            DatasetId: question.DatasetId,
            UserId: question.OwnerId,
            CreditCalculated: false
        }
    });

    if(answersCount >= userTarget.TargetDefinition.AnswerCount) {
        await UserTarget.finishUserTarget(userTarget.Id);
        return handleError(res, {status: httpStatus.EXPECTATION_FAILED, code: 3203});
    }

    answersCount = await Answer.client.count({
        where: {
            DatasetId: question.DatasetId,
            UserId: question.OwnerId
        }
    });

    if(ds.AnswerBudgetCountPerUser && ds.AnswerBudgetCountPerUser <= answersCount) {
        await UserTarget.finishUserTarget(userTarget.Id);
        return handleError(res, {status: httpStatus.EXPECTATION_FAILED, code: 3301});
    }

    let questionItems = question.DatasetItems;

    for(const [index, item] of Answers.entries()) {
        try {
            if (question.DatasetId !== item.DatasetId)
                return handleError(res, {status: httpStatus.BAD_REQUEST, error: {code: 3002, message:'Invalid dataset: ' + item.DatasetId}});

            if(!questionItems.map(item => item.id).includes(item.DatasetItemId)) {
                return handleError(res, {status: httpStatus.BAD_REQUEST, error: {code: 3002, message:'This item does not belongs to current question: ' + item.DatasetItemId}});
            }

            const qItem = questionItems.find(it => it.id === item.DatasetItemId);

            let dsi = await DatasetItem.findById(item.DatasetItemId, 'admin');
            if (!dsi)
                return handleError(res, {status: httpStatus.BAD_REQUEST, error: {code: 3002, message:'Invalid dataset item: ' + item.DatasetId}});

            let answerType = Answer.answerTypes.NORMAL, goldenType = Answer.goldenTypes.ISNOTGOLDEN;

            if(qItem.g) {
                answerType = Answer.answerTypes.GOLDEN;
                goldenType = Answer.goldenTypes.POSITIVE;
            } else if(qItem.ng) {
                answerType = Answer.answerTypes.GOLDEN;
                goldenType = Answer.goldenTypes.NEGATIVE;
            }
            // if(dsi.IsGoldenData) {
            //     answerType = Answer.answerTypes.GOLDEN;
            //     goldenType = Answer.goldenTypes.POSITIVE;
            // }
            // else if(question.LabelId && dsi.LabelId !== question.LabelId) {
            //     answerType = Answer.answerTypes.GOLDEN;
            //     goldenType = Answer.goldenTypes.NEGATIVE;
            // }
            //TODO: we should submit answers with the question owner id or the current requesterID ?

            let isCorrectAnswer = null;
            if(qItem.g) {
                if(answerType === Answer.answerTypes.GOLDEN && dsi.CorrectGoldenAnswerIndex !== null) {
                    if(dsi.CorrectGoldenAnswerIndex === JSON.parse(item.AnswerIndex)) {
                        isCorrectAnswer = true;
                    } else if(dsi.CorrectGoldenAnswerIndex !== JSON.parse(item.AnswerIndex)) {
                        isCorrectAnswer = false;
                    }
                }
            } else if(qItem.ng) {
                if(answerType === Answer.answerTypes.GOLDEN && dsi.CorrectGoldenAnswerIndex !== null) {
                    if(dsi.CorrectGoldenAnswerIndex !== JSON.parse(item.AnswerIndex)) {
                        isCorrectAnswer = true;
                    } else if(dsi.CorrectGoldenAnswerIndex === JSON.parse(item.AnswerIndex)) {
                        isCorrectAnswer = false;
                    }
                }
            }


            let answer = await Answer.client.create({
                data: {
                    UserId: question.OwnerId,
                    Ignored: JSON.parse(item.Ignored),
                    IgnoreReason: item.IgnoreReason,
                    DatasetId: item.DatasetId,
                    DatasetItemId: item.DatasetItemId,
                    Answer: JSON.parse(item.AnswerIndex),
                    //QuestionObject: item.QuestionObject,
                    DeterminedLabelId: qItem.determinedLabelId,
                    DurationToAnswerInSeconds: JSON.parse(item.DurationToAnswerInSeconds),
                    AnswerType: answerType,
                    GoldenType: goldenType,
                    IsCorrect: isCorrectAnswer
                }
            });
            //We store the negative golden answer but we don't count it in the replication limit
            if(goldenType !== Answer.goldenTypes.NEGATIVE) {
                await DatasetItem.client.update({
                    where: { Id: dsi.Id },
                    data: {
                        AnswersCount: dsi.AnswersCount + 1
                    }
                });
            }

            storedAnswers.push({
                id: answer.Id
            });
        } catch (error) {
            console.log(error);
            return handleError(res, {});
        }
    }

    try {
        await QuestionRequestLog.client.update({
            where: {
                Id: question.Id
            },
            data: {
                IsDone: true
            }
        });
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }

    return res.send(storedAnswers);
};

answersController.stats = async (req, res, next) => {
    const {
        UserId,
        DatasetId,
        OnlyNonCalculated
    } = req.query;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let uId = UserId ? UserId : null;
    if(UserId && req.decoded.Role !== 'admin') {
        uId = req.decoded.Id;
    }

    let where = {};

    if(UserId)
        where.UserId = uId

    if(DatasetId)
        where.DatasetId = DatasetId

    if(OnlyNonCalculated)
        where.CreditCalculated = false;

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

answersController.removeAnswers = async (req, res, next) => {
    let {
        UserId,
        From,
        To,
        DatasetId
    } = req.query;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let uId = UserId ? UserId : null;
    if(UserId && req.decoded.Role !== 'admin') {
        uId = req.decoded.Id;
    }

    let datasetIdString = '';
    if(DatasetId) {
        datasetIdString = "AND \"DatasetId\" = '" + DatasetId + "'"
    }

    try {
        let dateRange = '';
        if(From) {
            if(From && new Date(From) < new Date()) {
                From = moment(moment(From).toISOString()).utc(false).toISOString().split('T', 1)[0];
            } else {
                From = null;
            }
            if(To) {
                To = moment(moment(To).toISOString()).utc(false).add(1,'days').toISOString().split('T', 1)[0];
            }
            if(!To && From) {
                To = moment(moment().toISOString()).utc(false).add(1,'days').toISOString().split('T', 1)[0];
            }

            if(From)
                dateRange = " AND \"CreatedAt\" BETWEEN '" + From + "' AND '" + To + "'";
        }

        let sqlCommand = "\n" +
            "WITH cteids as \n" +
            "(\n" +
            "\t\t\tSELECT \"Id\", \"DatasetItemId\" \n" +
            "\t\t\tFROM \"AnswerLogs\" \n" +
            "\t\t\tWHERE \"UserId\" = " + "'" + uId + "' " + datasetIdString + " "+ dateRange +"\n" +
            "),\n" +
            "cteupdate as\n" +
            "(\n" +
            "\t\n" +
            "\t\tUPDATE \"DatasetItems\"\n" +
            "\t\tSET \"AnswersCount\" = \"AnswersCount\" - 1\n" +
            "\t\tWHERE \"DatasetItems\".\"Id\" IN\n" +
            "\t\t(\n" +
            "\t\t\tSELECT cteids.\"DatasetItemId\" FROM cteids\n" +
            "\t\t) AND \"AnswersCount\" > 0\n" +
            "\t\tRETURNING *\n" +
            "),\n" +
            "ctedelete as\n" +
            "(\n" +
            "\t\n" +
            "\t\tDELETE FROM \"AnswerLogs\"\n" +
            "\t\tWHERE \"Id\" IN (\n" +
            "\t\t\tSELECT cteids.\"Id\" FROM cteids\n" +
            "\t\t) \n" +
            "\t\tRETURNING *\n" +
            "),\n" +
            "cteend as(\n" +
            "\t\tselect distinct cteids.\"Id\"\n" +
            "\t\tfrom cteupdate,\n" +
            "\t\t\tctedelete,\n" +
            "\t\t\tcteids\n" +
            ")\n" +
            "\n" +
            "SELECT *\n" +
            "from cteend";

        let temp = await prisma.$executeRaw(sqlCommand);

        return res.send({
            success: true,
            affectedRows: temp
        });
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
};

export default answersController;
