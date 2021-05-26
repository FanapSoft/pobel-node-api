import prisma from '../prisma.module'
import DBModelBase from "./DBModelBase.Class";

class TargetDefinitions extends DBModelBase {
    constructor() {
        super();
        this.table = 'targetDefinitions';
        this.modelPublicFields = {Id: true, Name: true, Description: true, Type: true, AnswerType: true, IsActive: true,  LabelingStatus: true};
    }
}

export default new TargetDefinitions;
