import prisma from '../prisma.module.js'
import DBModelBase from "./DBModelBase.Class.js";
import {handleError} from "../../imports/errors.js";
import httpStatus from "http-status";

class UserTarget extends DBModelBase {
    constructor() {
        super();
        this.table = 'userTargets';
        this.client = prisma.userTargets;
        this.modelPublicFields = {Id: true, Name: true, Description: true, Type: true, AnswerType: true, IsActive: true,  LabelingStatus: true};
    }

    async createTarget(userId, datasetId, targetDefinitionId) {
        return await this.client.create({
            data: {
                TargetDefinition: {
                    connect: {
                        Id: targetDefinitionId
                    }
                },
                Owner: {
                    connect: {
                        Id: userId
                    }
                },
                Dataset: {
                    connect: {
                        Id: datasetId
                    }
                }
            }
        });
    }

    async getUserCurrentTarget(userId, datasetId) {
        const where = {
            OwnerId: userId,
            DatasetId: datasetId
        };

        const userTargets = await this.client.findMany({
            where,
            include: {
                TargetDefinition: true
            },
            orderBy: {
                CreatedAt: 'desc'
            },
            take: 1
        });

        return userTargets.length ? userTargets[0] : null;
    }

    async finishUserTarget(targetId) {
        return await this.client.update({
            where: {
                Id: targetId,
            },
            data: {
                TargetEnded: true
            }
        });
    }
}

export default new UserTarget;
