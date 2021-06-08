import prisma from "../../prisma/prisma.module.js";
import httpStatus from "http-status";
import {handleError} from "../../imports/errors.js";
import acl from "../../imports/acl.js";
import TargetDefinitions from "../../prisma/models/TargetDefinitions.js";

const targetController = {};

// Get All Users
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
        let targets = await TargetDefinitions.client.findMany({
            where,
            take: Limit,
            skip: Skip
        });
        return res.send(targets);
    } catch (error) {
        console.log(error)
        return handleError(res, {});
    }
};


// Get User By ID
targetController.findOne = async (req, res) => {
    const {
        id
    } = req.params;
    try {
        let target = await TargetDefinitions.findById(parseInt(id), req.decoded.Role);

        if (!target) {
            return handleError(res, {code: 3000, status: httpStatus.BAD_REQUEST});
        }

        return res.send(target);
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
};

// Create Target
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
        const dataset = Dataset.findById(DatasetId);
        if (!dataset) {
            return handleError(res, {code: 3000, status: httpStatus.BAD_REQUEST});
        }

        let td = await TargetDefinitions.client.create({
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
            return handleError(res, {code: 3000, status: httpStatus.BAD_REQUEST});
        }

        return res.send(td);
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
};

// Update User By ID
targetController.update = async (req, res) => {
    const {
        id
    } = req.params;
    const {
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
        let target = await TargetDefinitions.findById(parseInt(id))

        if (!target)
            return handleError(res, {code: 3000, status: httpStatus.BAD_REQUEST});

        if(!acl.currentUserCan(req.decoded, target, 'update')) {
            return handleError(res, {code: 2004, status: httpStatus.FORBIDDEN});
        }

        Object.assign(target, req.body);

        const result = await prisma.user.update({
            where: { Id: target.Id },
            data: target,
        });
        //await user.save();
        return res.send(result);
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
};


// Delete User By ID
targetController.delete = async (req, res) => {
    if(!acl.currentUserCan(req.decoded, null, 'delete')) {
        return handleError(res, {code: 2004});
    }
    const {
        id
    } = req.params;

    if (!id)
        return handleError(res, {code: 3000, status: httpStatus.BAD_REQUEST});

    try {
        let td = await TargetDefinitions.client.delete({where: { Id: parseInt(id) }});

        return res.send(td);
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
};

export default targetController;
