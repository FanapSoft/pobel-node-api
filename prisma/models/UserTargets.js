import prisma from '../prisma.module'
import DBModelBase from "./DBModelBase.Class";

class UserTargets extends DBModelBase {
    constructor() {
        super();
        this.table = 'userTargets';
        this.client = prisma.userTargets;
        this.modelPublicFields = {Id: true, Name: true, Description: true, Type: true, AnswerType: true, IsActive: true,  LabelingStatus: true};
    }
}

export default new UserTargets;
