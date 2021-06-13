import httpStatus from "http-status";
import {handleError} from "../../imports/errors.js";
import DatasetItem from "../../prisma/models/DatasetItem.js";
import acl from "../../imports/acl.js";

const datasetItemsController = {};

// Get All Users
datasetItemsController.findAll = async (req, res) => {
    const {
        LabelName,
        DatasetId,
        IsGoldenData,
        Limit = 10,
        Skip = 0
    } = req.query;

    let where = {}, include = {};

    if(DatasetId)
        where.DatasetId = DatasetId;

    if(LabelName)
        where.Name = {
            contains: LabelName
        };

    if(IsGoldenData !== null && IsGoldenData !== undefined)
        where.IsGoldenData = IsGoldenData;

    if(!Object.keys(include).length)
        include = null;

    try {
        let datasetItems = await DatasetItem.client.findMany({
            where,
            include,
            orderBy: {
                CreatedAt: 'desc',
            },
            take: Limit,
            skip: Skip,

        });

        return res.send(datasetItems);
    } catch (error) {
        console.log(error)
        return handleError(res, {});
    }
};

// Get User By ID
datasetItemsController.findOne = async (req, res) => {
    const {
        id
    } = req.params;
    try {
        let di = await DatasetItem.findById(id, req.decoded.Role);

        if (!di) {
            return handleError(res, {code: 3000, status: httpStatus.BAD_REQUEST});
        }

        return res.send(di);
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
};

// Create Target
datasetItemsController.create = async (req, res, next) => {
    const {

    } = req;
};

// Update User By ID
datasetItemsController.update = async (req, res) => {
    const {
        id
    } = req.params;
    const {
        //TODO: fields to update
    } = req.body;
    try {
        let di = await DatasetItem.findById(id);

        if (!di)
            return handleError(res, {code: 3000, status: httpStatus.BAD_REQUEST});

        if(!acl.currentUserCan(req.decoded, di, 'update')) {
            return handleError(res, {code: 2004, status: httpStatus.FORBIDDEN});
        }

        Object.assign(di, req.body);

        const result = await DatasetItem.client.update({
            where: { Id: di.Id },
            data: di,
        });
        //await user.save();
        return res.send(result);
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
};


// Delete User By ID
datasetItemsController.delete = async (req, res) => {
    if(!acl.currentUserCan(req.decoded, null, 'delete')) {
        return handleError(res, {code: 2004});
    }
    const {
        id
    } = req.params;

    if (!id)
        return handleError(res, {code: 3000, status: httpStatus.BAD_REQUEST});

    try {
        let datasetItem = await DatasetItem.client.delete({where: { Id: id }});

        return res.send(datasetItem);
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
};

export default datasetItemsController;
