// import prisma from "../../prisma/prisma.module.js";
import httpStatus from "http-status";
import {handleError} from "../../imports/errors.js";
import acl from "../../imports/acl.js";
import Dataset from "../../prisma/models/Dataset.js";
import {body, validationResult} from "express-validator";
// import DatasetItem from "../../prisma/models/DatasetItem.js";
import prisma from "../../prisma/prisma.module.js";

const datasetController = {};

// Get All Users
datasetController.findAll = async (req, res) => {
    let {
        Name,
        Description,
        IsActive,
        IncludeRandomItem = false,
        IncludeItemsCount = false,
        Limit = process.env.API_PAGED_RESULTS_DEFAULT_LIMIT,
        Skip = 0
    } = req.query;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    if(Limit > 20)
        Limit = 20

    let where = {}, select =  Dataset.getFieldsByRole(req.decoded.role);
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

    if(IncludeItemsCount) {
        select._count = {
            select: {
                DatasetItems: true
            }
        }
    }

    try {
        let items = await Dataset.client.findMany({
            select,
            where,
            orderBy: {
                CreatedAt: 'desc',
            },
            take: parseInt(Limit),
            skip: Skip
        });

        if(IncludeRandomItem && items.length) {
            for (const item of items) {
                const randomDsItem = await prisma.$queryRaw`SELECT "Id"  FROM "DatasetItems" WHERE "DatasetId"=${item.Id} ORDER  BY random() LIMIT 1;`;
                item.RandomItemId = randomDsItem.length ? randomDsItem[0].Id : null;
            }
        }

        const totalCount = await Dataset.client.count({
            where,
        });
        return res.send({totalCount, items});
    } catch (error) {
        console.log(error)
        return handleError(res, {});
    }
};

datasetController.findOne = async (req, res) => {
    const {
        id
    } = req.params;

    try {
        let dataset = await Dataset.findById(id, req.decoded.Role);

        if (!dataset) {
            return handleError(res, {code: 3002, status: httpStatus.BAD_REQUEST});
        }

        return res.send(dataset);
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
};

datasetController.create = async (req, res, next) => {
    const {
        Name,
        Description,
        Type,
        IsActive,
        LabelingStatus,
        AnswerReplicationCount,
        AnswerBudgetCountPerUser,
        AnswerPackId
    } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        let dataset = await Dataset.client.create({
            data: {
                Name,
                Description,
                Type,
                IsActive,
                LabelingStatus,
                AnswerReplicationCount,
                AnswerBudgetCountPerUser,
                AnswerPackId
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

datasetController.update = async (req, res) => {
    const {
        id
    } = req.params;

    try {
        let dataset = await Dataset.findById(id)

        if (!dataset)
            return handleError(res, {code: 3000, status: httpStatus.BAD_REQUEST});

        const editableParams = [
            "Name", "Description", "Type",  "IsActive", "LabelingStatus",
            "AnswerReplicationCount", "AnswerBudgetCountPerUser", "AnswerPackId"
        ];
        const params = {};
        editableParams.forEach(item => {
            if(req.body[item] !== undefined) {
                params[item] = req.body[item]
            }
        });
        const result = await Dataset.client.update({
            where: { Id: dataset.Id },
            data: params
        });
        return res.send(result);
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
};

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
