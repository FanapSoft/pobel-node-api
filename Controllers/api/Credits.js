import httpStatus from "http-status";
import {handleError} from "../../imports/errors.js";
import Answer from "../../prisma/models/Answer.js";
import Dataset from "../../prisma/models/Dataset.js";
import DatasetItem from "../../prisma/models/DatasetItem.js";

const creditsController = {};

// Get All Answers
creditsController.getCredit = async (req, res) => {
    const {
        DatasetId,
        UserId
    } = req.query;

    let where = {}, include = null;
    //if(IncludeQuestion !== null && IncludeQuestion !== undefined)

    where.DatasetId = DatasetId;
    where.UserId = UserId;


    try {
        const items = await Answer.client.findMany({
            where,
            orderBy: {
                CreatedAt: 'desc',
            },
            take: Limit,
            skip: Skip
        });

        return res.send({totalCount, items});
    } catch (error) {
        console.log(error)
        return handleError(res, {});
    }
};
export default creditsController;
