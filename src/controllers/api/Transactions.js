// import prisma from "../../prisma/prisma.module.js";
import httpStatus from "http-status";
import {handleError} from "../../imports/errors.js";
import acl from "../../imports/acl.js";
import Dataset from "../../prisma/models/Dataset.js";
import {body, validationResult} from "express-validator";
import Transaction from "../../prisma/models/Transaction.js";

const transactionsController = {};

transactionsController.findAll = async (req, res) => {
    const {
        CreditMin,
        CreditMax,
        DebitMin,
        DebitMax,
        OwnerId,
        ReferenceDatasetId,
        Limit = process.env.API_PAGED_RESULTS_DEFAULT_LIMIT,
        Skip = 0
    } = req.query;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }


    let uId = OwnerId ? OwnerId : undefined;
    if(req.decoded.Role !== 'admin' && uId) {
        uId = req.decoded.Id
    }

    let where = {};
    if(uId)
        where.OwnerId = uId;
    if(ReferenceDatasetId)
        where.ReferenceDatasetId = ReferenceDatasetId
    if(CreditMax)
        where.CreditAmount = {lte: CreditMax}
    if(CreditMin)
        where.CreditAmount = {gte: CreditMin}
    if(DebitMax)
        where.DebitAmount = {lte: DebitMax}
    if(DebitMin)
        where.DebitAmount = {gte: DebitMin}

    try {
        let items = await Transaction.client.findMany({
            where,
            orderBy: {
                CreatedAt: 'desc',
            },
            take: parseInt(Limit),
            skip: Skip
        });

        const totalCount = await Transaction.client.count({
            where,
        });
        return res.send({totalCount, items});
    } catch (error) {
        console.log(error)
        return handleError(res, {});
    }
};

transactionsController.findOne = async (req, res) => {
    const {
        id
    } = req.params;

    try {
        let trans = await Transaction.findById(id, req.decoded.Role);

        if (!trans) {
            return handleError(res, {code: 3002, status: httpStatus.BAD_REQUEST});
        }

        return res.send(trans);
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
};

export default transactionsController;
