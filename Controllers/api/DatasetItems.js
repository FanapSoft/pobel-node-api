import httpStatus from "http-status";
import {handleError} from "../../imports/errors.js";
import DatasetItem from "../../prisma/models/DatasetItem.js";
import acl from "../../imports/acl.js";

const datasetItemsController = {};

datasetItemsController.findAll = async (req, res) => {
    const {
        LabelName,
        DatasetId,
        IsGoldenData,
        Limit = process.env.API_PAGED_RESULTS_DEFAULT_LIMIT,
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
        let items = await DatasetItem.client.findMany({
            where,
            include,
            orderBy: {
                CreatedAt: 'desc',
            },
            take: parseInt(Limit),
            skip: Skip,

        });
        const totalCount = await DatasetItem.client.count({
            where,
        });
        return res.send({totalCount, items});
    } catch (error) {
        console.log(error)
        return handleError(res, {});
    }
};

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

datasetItemsController.create = async (req, res, next) => {
    const {

    } = req;
};

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
