import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";
import prisma from "../../prisma/prisma.module";
import httpStatus from "http-status";
import {handleError} from "../../imports/errors";
import User from "../../prisma/models/User";
import acl from "../../imports/acl";
import TargetDefinitions from "../../prisma/models/TargetDefinitions";

const targetController = {};

// Get All Users
targetController.findAll = async (req, res) => {
    const {
        limit = 10,
        skip = 0
    } = req.query;
    try {
        let targets = await prisma.targetDefinitions.findMany({
            take: limit,
            skip,
            orderBy: {
                id: 'desc',
            }});
        return res.send(targets);
    } catch (error) {
        console.log(error)
        return handleError(res, {});
    }
};


// Get User By ID
targetController.findOne = async (req, res) => {
    const {
        id
    } = req.params;
    try {
        let target = await TargetDefinitions.findById(parseInt(id), req.decoded.Role);

        if (!target) {
            return handleError(res, {code: 3000, status: httpStatus.BAD_REQUEST});
        }

        return res.send(target);
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
};

// Create Target
targetController.create = async (req, res, next) => {
    const {
        T,
        UMin,
        UMax,
        Type,
        AnswerType,
        IsActive,
        LabelingStatus
    } = req.body;

    try {
        let td = await prisma.targetDefinitions.create({
            data: {
                T,
                UMax,
                UMin,
                Type,
                AnswerType,
                IsActive,
                LabelingStatus
            }
        });

        if (!td) {
            return handleError(res, {code: 3000, status: httpStatus.BAD_REQUEST});
        }

        return res.send(td);
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
};

// Update User By ID
targetController.update = async (req, res) => {
    const {
        id
    } = req.params;
    const {
        //TODO: fields to update
    } = req.body;
    try {
        let target = await TargetDefinitions.findById(parseInt(id))

        if (!target)
            return handleError(res, {code: 3000, status: httpStatus.BAD_REQUEST});

        if(!acl.currentUserCan(req.decoded, target, 'update')) {
            return handleError(res, {code: 2004, status: httpStatus.FORBIDDEN});
        }

        Object.assign(target, req.body);

        const result = await prisma.user.update({
            where: { Id: target.Id },
            data: target,
        });
        //await user.save();
        return res.send(result);
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
};


// Delete User By ID
targetController.delete = async (req, res) => {
    if(!acl.currentUserCan(req.decoded, null, 'delete')) {
        return handleError(res, {code: 2004});
    }
    const {
        id
    } = req.params;

    if (!id)
        return handleError(res, {code: 3000, status: httpStatus.BAD_REQUEST});

    try {
        let user = await prisma.targetDefinitions.delete({where: { Id: parseInt(id) }});

        return res.send(user);
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
};

export default targetController;
