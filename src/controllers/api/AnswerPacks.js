import httpStatus from "http-status";
import {handleError} from "../../imports/errors.js";
import Answer from "../../prisma/models/Answer.js";
import {validationResult} from "express-validator";
import AnswerPack from "../../prisma/models/AnswerPack";

const answerPacksController = {};

// Get All AnswerPacks
answerPacksController.findAll = async (req, res) => {
    const {
        Limit = process.env.API_PAGED_RESULTS_DEFAULT_LIMIT,
        Skip = 0
    } = req.query;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let select = {
        ...AnswerPack.getFieldsByRole(req.decoded.role)
    };

    try {
        const items = await AnswerPack.client.findMany({
            select,
            take: parseInt(Limit),
            skip: Skip
        });
        const totalCount = await Answer.client.count();
        return res.send({totalCount, items});
    } catch (error) {
        console.log(error)
        return handleError(res, {});
    }
};

export default answerPacksController;
