import prisma from "../../prisma/prisma.module";
import httpStatus from "http-status";
import {handleError} from "../../imports/errors";
import acl from "../../imports/acl";
import Dataset from "../../prisma/models/Dataset";

const datasetController = {};

// Get All Users
datasetController.findAll = async (req, res) => {
    const {
        limit = 10,
        skip = 0
    } = req.query;
    try {
        let datasets = await prisma.datasets.findMany({
            take: limit,
            skip,
            orderBy: {
                id: 'desc',
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
    const {
        Name,
        Description,
        Type,
        AnswerType,
        IsActive,
        LabelingStatus
    } = req.body;

    const {
        id
    } = req.params;
    try {
        let dataset = await prisma.datasets.create({
            data: {
                Name,
                Description,
                Type,
                AnswerType,
                IsActive,
                LabelingStatus
            }
        })

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
        UserName,
        Name,
        Email,
    } = req.body;
    try {
        let dataset = await Dataset.findById(parseInt(id))

        if (!dataset)
            return handleError(res, {code: 3000, status: httpStatus.BAD_REQUEST});

        Object.assign(dataset, req.body);
        const result = await prisma.user.update({
            where: { Id: dataset.Id },
            data: dataset,
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
        let dataset = await prisma.datasets.delete({where: { Id: parseInt(id) }});

        return res.send(dataset);
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
};

export default datasetController;
