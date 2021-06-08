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
        where.Description = Description;



    try {
        let datasets = await Dataset.client.findMany({
            where: where,
            take: Limit,
            skip: Skip,
            orderBy: {
                CreatedAt: 'desc',
            }});

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
        let dataset = await Dataset.findById(parseInt(id), req.decoded.Role);

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
    console.log("req body>>>>>>>>>: ", req.body, req.params,req.query);

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
                Type,
                AnswerType,
                IsActive,
                LabelingStatus,
                T,
                UMin,
                UMax,
                AnswerReplicationCount,
                AnswerBudgetCountPerUser
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
        let dataset = await Dataset.findById(parseInt(id))

        if (!dataset)
            return handleError(res, {code: 3000, status: httpStatus.BAD_REQUEST});


        const result = await Dataset.client.update({
            where: { Id: dataset.Id },
            data: {
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
        let dataset = await Dataset.client.delete({where: { Id: parseInt(id) }});

        return res.send(dataset);
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
};

export default datasetController;
