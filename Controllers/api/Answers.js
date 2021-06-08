
import httpStatus from "http-status";
import {handleError} from "../../imports/errors.js";
import acl from "../../imports/acl.js";
import Answers from "../../prisma/models/Answer.js";

const answersController = {};

// Get All Users
answersController.findAll = async (req, res) => {
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
        let datasets = await Answer.client.findMany({
            where: where,
            take: Limit,
            Skip,
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
answersController.findOne = async (req, res) => {
    const {
        id
    } = req.params;
    try {
        let dataset = await Answers.findById(parseInt(id), req.decoded.Role);

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
answersController.submitBatchAnswer = async (req, res, next) => {
    const {

    } = req.body;


};

// Delete User By ID
answersController.delete = async (req, res) => {
    if(!acl.currentUserCan(req.decoded, null, 'delete')) {
        return handleError(res, {code: 2004});
    }
    const {
        id
    } = req.params;

    if (!id)
        return handleError(res, {code: 3000, status: httpStatus.BAD_REQUEST});

    try {
        let dataset = await Answers.client.delete({where: { Id: parseInt(id) }});

        return res.send(dataset);
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
};

export default answersController;
