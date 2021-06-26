import prisma from '../prisma.module.js'
import DBModelBase from "./DBModelBase.Class.js";

/**
 * LabelingStatus: Enum: [0,1]
 *   0-labeling is done
 *   1-labeling is possible
 */
class Dataset extends DBModelBase {
    constructor() {
        super();
        this.table = 'datasets';
        this.client = prisma.datasets
        this.modelPublicFields = {Id: true, Name: true, Description: true, Type: true, AnswerType: true, IsActive: true,  LabelingStatus: true};
    }
}

export default new Dataset;
