import prisma from '../prisma.module.js'
import DBModelBase from "./DBModelBase.Class.js";

class Dataset extends DBModelBase {
    constructor() {
        super();
        this.table = 'datasets';
        this.client = prisma.datasets
        this.modelPublicFields = {Id: true, Name: true, Description: true, Type: true, AnswerType: true, IsActive: true,  LabelingStatus: true};
    }
}

export default new Dataset;
