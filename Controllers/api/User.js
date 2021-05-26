import prisma from "../../prisma/prisma.module";
import httpStatus from "http-status";
import User  from "../../prisma/models/User";
import acl from '../../imports/acl'
import {handleError} from "../../imports/errors";

const userController = {};

// Get All Users
userController.findAll = async (req, res) => {
    try {
        const users = await prisma.user.findMany({});
        return res.status(200).send(users);
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
        let user = await User.findById(parseInt(id), req.decoded.Role);

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
        UserName,
        Name,
        Email,
    } = req.body;
    try {
        let user = await User.findById(parseInt(id))

        if (!user)
            return handleError(res, {code: 3000, status: httpStatus.BAD_REQUEST});

        if(!acl.currentUserCan(req.decoded, user, 'update')) {
            return handleError(res, {code: 2004, status: httpStatus.FORBIDDEN});
        }

        Object.assign(user, req.body);

        const result = await prisma.user.update({
            where: { Id: user.Id },
            data: user,
        });
        //await user.save();
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
        let user = await prisma.user.delete({where: { Id: parseInt(id) }});

        return res.send(user);
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
};

export default userController;
