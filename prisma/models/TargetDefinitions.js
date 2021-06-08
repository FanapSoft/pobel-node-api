import prisma from '../prisma.module.js'
import DBModelBase from "./DBModelBase.Class.js";

class TargetDefinitions extends DBModelBase {
    constructor() {
        super();
        this.table = 'targetDefinitions';
        this.client = prisma.targetDefinitions
        this.modelPublicFields = {Id: true, Name: true, Description: true, Type: true, AnswerType: true, IsActive: true,  LabelingStatus: true};
    }
}

export default new TargetDefinitions;
