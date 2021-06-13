// import prisma from "../../prisma/prisma.module.js";
import httpStatus from "http-status";
import {handleError} from "../../imports/errors.js";
import acl from "../../imports/acl.js";
import Dataset from "../../prisma/models/Dataset.js";

const datasetController = {};

// Get All Users
datasetController.findAll = async (req, res) => {
    const {
        Name,
        Description,
        IsActive,
        Limit = 10,
        Skip = 0
    } = req.query;

    let where = {};
    if(Name)
        where.Name = {
            contains: Name
        };
    if(IsActive !== null && IsActive !== undefined)
        where.IsActive = IsActive;
    if(Description)
        where.Description = {
            contains: Description
        };

    try {
        let datasets = await Dataset.client.findMany({
            where,
            orderBy: {
                CreatedAt: 'desc',
            },
            take: Limit,
            skip: Skip
        });
        return res.send(datasets);
    } catch (error) {
        console.log(error)
        return handleError(res, {});
    }
};


// Get User By ID
datasetController.findOne = async (req, res) => {
    const {
        id
    } = req.params;
    try {
        let dataset = await Dataset.findById(id, req.decoded.Role);

        if (!dataset) {
            return handleError(res, {code: 3000, status: httpStatus.BAD_REQUEST});
        }

        return res.send(dataset);
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
};

// Create Target
datasetController.create = async (req, res, next) => {
    const {
        Name,
        Description,
        Type,
        AnswerType,
        IsActive,
        LabelingStatus,
        T,
        UMin,
        UMax,
        AnswerReplicationCount,
        AnswerBudgetCountPerUser
    } = req.body;
    try {
        let dataset = await Dataset.client.create({
            data: {
                Name,
                Description,
                Type: JSON.parse(Type),
                AnswerType: JSON.parse(AnswerType),
                IsActive: JSON.parse(IsActive),
                LabelingStatus: JSON.parse(LabelingStatus),
                T: JSON.parse(T),
                UMin: JSON.parse(UMin),
                UMax: JSON.parse(UMax),
                AnswerReplicationCount: JSON.parse(AnswerReplicationCount),
                AnswerBudgetCountPerUser: JSON.parse(AnswerBudgetCountPerUser)
            }
        });

        if (!dataset) {
            return handleError(res, {code: 3000, status: httpStatus.BAD_REQUEST});
        }

        return res.send(dataset);
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
};

// Update User By ID
datasetController.update = async (req, res) => {
    const {
        id
    } = req.params;
    const {
        Name,
        Description,
        Type,
        AnswerType,
        IsActive,
        LabelingStatus,
        T,
        UMin,
        UMax,
        AnswerReplicationCount,
        AnswerBudgetCountPerUser
    } = req.body;
    try {
        let dataset = await Dataset.findById(id)

        if (!dataset)
            return handleError(res, {code: 3000, status: httpStatus.BAD_REQUEST});


        const result = await Dataset.client.update({
            where: { Id: dataset.Id },
            data: {
                Name,
                Description,
                Type: JSON.parse(Type),
                AnswerType: JSON.parse(AnswerType),
                IsActive: JSON.parse(IsActive),
                LabelingStatus: JSON.parse(LabelingStatus),
                T: JSON.parse(T),
                UMin: JSON.parse(UMin),
                UMax: JSON.parse(UMax),
                AnswerReplicationCount: JSON.parse(AnswerReplicationCount),
                AnswerBudgetCountPerUser: JSON.parse(AnswerBudgetCountPerUser)
            }
        });
        return res.send(result);
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
};


// Delete User By ID
datasetController.delete = async (req, res) => {
    if(!acl.currentUserCan(req.decoded, null, 'delete')) {
        return handleError(res, {code: 2004});
    }
    const {
        id
    } = req.params;

    if (!id)
        return handleError(res, {code: 3000, status: httpStatus.BAD_REQUEST});

    try {
        let dataset = await Dataset.client.delete({where: { Id: id }});

        return res.send(dataset);
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
};

export default datasetController;
