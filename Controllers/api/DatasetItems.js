import prisma from "../../prisma/prisma.module";
import httpStatus from "http-status";
import {handleError} from "../../imports/errors";
import DatasetItem from "../../prisma/models/DatasetItem";
import acl from "../../imports/acl";

const datasetItemsController = {};

// Get All Users
datasetItemsController.findAll = async (req, res) => {
    const {
        limit = 10,
        skip = 0
    } = req.query;
    try {
        let datasetItems = await prisma.datasetItems.findMany({
            take: limit,
            skip,
            orderBy: {
                id: 'desc',
            }});
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
        let di = await DatasetItem.findById(parseInt(id), req.decoded.Role);

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
        let di = await DatasetItem.findById(parseInt(id));

        if (!di)
            return handleError(res, {code: 3000, status: httpStatus.BAD_REQUEST});

        if(!acl.currentUserCan(req.decoded, di, 'update')) {
            return handleError(res, {code: 2004, status: httpStatus.FORBIDDEN});
        }

        Object.assign(di, req.body);

        const result = await prisma.datasetItems.update({
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
    const {
        userId
    } = req.params;
    try {
        let user = await prisma.datasetItems.delete({where: { Id: userId }});
        if (!user) {
            return res
                .status(httpStatus.BAD_REQUEST)
                .json({ message: "User not found" });
        }
        return res.json({ message: "User deleted successfully!" });
    } catch (error) {
        return res.status(500).json({ error: error.toString() });
    }
};

export default datasetItemsController;
