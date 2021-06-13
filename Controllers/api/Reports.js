// import prisma from "../../prisma/prisma.module.js";
// import httpStatus from "http-status";
import {handleError} from "../../imports/errors.js";
// import acl from "../../imports/acl.js";
import Dataset from "../../prisma/models/Dataset.js";

const reportController = {};

// Get All Users
reportController.answersCountTrend = async (req, res) => {
    const {
        UserId,
        From,
        To,
        DatasetId
    } = req.query;

    let where = {};
    if(UserId)
        where.UserId = {
            contains: UserId
        };
    if(From)
        where.CreatedAt = {
            gte: From
        };

    if(To)
        where.CreatedAt = {
            lte: To
        };
    if(DatasetId)
        where.DatasetId = DatasetId;

    if(From || To)
    const periodDates = generateDates(From, To);


    try {
        let datasets = await Dataset.client.findMany({
            where: where,
        });
        return res.send(datasets);
    } catch (error) {
        console.log(error)
        return handleError(res, {});
    }
};


function generateDates(From, To) {
    //let differenceInTime  = new Date(To).getTime() - new Date(From).getTime();
    //let totalDays = differenceInTime / (1000 * 3600 * 24);

    let isDone = false;
    let counter = 0;
    let result = [];
    while(!isDone) {
        let f = new Date(From);
        let out = new Date(f.getTime() + (1000 * 3600 * 24 * counter));
        if(out.getTime() > new Date(To)) {
            isDone = true;
        }
        counter++;
        result.push(out);
    }

    return result;
}

export default reportController;
