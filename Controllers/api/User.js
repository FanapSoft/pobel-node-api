import prisma from "../../prisma/prisma.module.js";
import httpStatus from "http-status";
import User  from "../../prisma/models/User.js";
import acl from '../../imports/acl.js'
import {handleError} from "../../imports/errors.js";

const userController = {};

// Get All Users
userController.findAll = async (req, res) => {
    const {
        Name,
        UserName,
        IsActive,
        Limit = process.env.API_PAGED_RESULTS_DEFAULT_LIMIT,
        Skip = 0
    } = req.query;

    let where = {};
    if(Name)
        where.Name = {
            contains: Name
        };
    if(IsActive !== null && IsActive !== undefined)
        where.IsActive = IsActive;
    if(UserName)
        where.UserName = UserName;

    try {
        const items = await User.client.findMany({
            where,
            orderBy: {
                CreatedAt: 'desc'
            },
            skip: Skip,
            take: parseInt(Limit),
        });
        const totalCount = await User.client.count({
            where,
        });
        return res.send({totalCount, items});
    } catch (error) {
        console.log(error)
        return handleError(res, {});
    }
};

// Get User By ID
userController.findOne = async (req, res) => {
    const {
        id
    } = req.params;
    try {
        let user = await User.findById(id, req.decoded.Role);

        if(!acl.currentUserCan(req.decoded, user, 'viewOne')) {
            return handleError(res, {code: 2004});
        }

        if (!user) {
            return handleError(res, {code: 3000, status: httpStatus.BAD_REQUEST});
        }

        return res.send(user);
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
};


// Update User By ID
userController.update = async (req, res) => {
    const {
        id
    } = req.params;
    const {
        Name,
        IsActive
    } = req.body;
    try {
        let user = await User.findById(id)

        if (!user)
            return handleError(res, {code: 3000, status: httpStatus.BAD_REQUEST});

        if(!acl.currentUserCan(req.decoded, user, 'update')) {
            return handleError(res, {code: 2004, status: httpStatus.FORBIDDEN});
        }

        if(IsActive !== null)
            user.IsActive = IsActive;
        if(Name !== null)
            user.Name = Name;

        const result = await prisma.user.update({
            where: { Id: user.Id },
            data: user,
        });

        return res.send(result);
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
};


// Delete User By ID
userController.delete = async (req, res) => {
    if(!acl.currentUserCan(req.decoded, null, 'delete')) {
        return handleError(res, {code: 2004});
    }
    const {
        id
    } = req.params;

    if (!id)
        return handleError(res, {code: 3000, status: httpStatus.BAD_REQUEST});

    try {
        let user = await prisma.user.delete({where: { Id: id }});

        return res.send(user);
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
};

export default userController;
