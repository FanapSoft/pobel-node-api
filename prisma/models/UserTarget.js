import prisma from '../prisma.module.js'
import DBModelBase from "./DBModelBase.Class.js";

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
}

export default new UserTarget;
