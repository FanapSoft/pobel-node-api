import prisma from "../../prisma/prisma.module.js";
import httpStatus from "http-status";
import {handleError} from "../../imports/errors.js";
import acl from "../../imports/acl.js";
import TargetDefinition from "../../prisma/models/TargetDefinition.js";
import Dataset from "../../prisma/models/Dataset.js";

const targetController = {};

targetController.findAll = async (req, res) => {
    const {
        DatasetId,
        Limit = 10,
        Skip = 0
    } = req.query;

    let where = {};

    if(DatasetId)
        where.DatasetId = DatasetId;

    try {
        let items = await TargetDefinition.client.findMany({
            where,
            orderBy: {
                CreatedAt: 'desc'
            },
            take: Limit,
            skip: Skip
        });
        const totalCount = await TargetDefinition.client.count({
            where,
        });
        return res.send({totalCount, items});
    } catch (error) {
        console.log(error)
        return handleError(res, {});
    }
};

targetController.findOne = async (req, res) => {
    const {
        id
    } = req.params;
    try {
        let target = await TargetDefinition.findById(id, req.decoded.Role);

        if (!target) {
            return handleError(res, {code: 3000, status: httpStatus.BAD_REQUEST});
        }

        return res.send(target);
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
};

targetController.create = async (req, res, next) => {
    const {
        DatasetId,
        UMin,
        UMax,
        T,
        Type,
        AnswerCount,
        GoldenCount,
        BonusFalse,
        BonusTrue
    } = req.body;

    try {
        const dataset = await Dataset.findById(DatasetId);
        if (!dataset) {
            return handleError(res, {code: 3000, status: httpStatus.BAD_REQUEST});
        }

        let td = await TargetDefinition.client.create({
            data: {
                DatasetId: dataset.Id,
                UMin,
                UMax,
                T,
                Type,
                AnswerCount,
                GoldenCount,
                BonusFalse,
                BonusTrue
            }
        });

        if (!td) {
            return handleError(res, {code: 1000});
        }

        return res.send(td);
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
};

targetController.update = async (req, res) => {
    const {
        id
    } = req.params;
    // const {} = req.body;
    try {
        let target = await TargetDefinition.findById(id)

        if (!target)
            return handleError(res, {code: 3000, status: httpStatus.BAD_REQUEST});

        if(!acl.currentUserCan(req.decoded, null, 'update')) {
            return handleError(res, {code: 2004, status: httpStatus.FORBIDDEN});
        }

        const editableParams = ["UMin", "UMax", "T", "Type", "BonusFalse", "BonusTrue", "AnswerCount", "GoldenCount"];
        const params = {};
        editableParams.forEach(item => {
            if(req.body[item] !== null) {
                params[item] = req.body[item]
            }
        });
        const result = await TargetDefinition.client.update({
            where: { Id: target.Id },
            data: params,
        });
        return res.send(result);
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
};

targetController.delete = async (req, res) => {
    if(!acl.currentUserCan(req.decoded, null, 'delete')) {
        return handleError(res, {code: 2004});
    }
    const {
        id
    } = req.params;

    if (!id)
        return handleError(res, {code: 3002, status: httpStatus.BAD_REQUEST});

    try {
        let td = await TargetDefinition.client.delete({where: { Id: id }});

        return res.send(td);
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
};

export default targetController;
