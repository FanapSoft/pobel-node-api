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
        this.modelAdminFields = {Id: true, Name: true, Description: true, Type: true, AnswerType: true, IsActive: true,  LabelingStatus: true, CreatedAt: true, UpdatedAt: true, ProcessedItemsSourcePath: true, AnswerReplicationCount: true, ItemsSourcePath: true, QuestionType: true, AnswerOptions: true};

        this.labelingStatuses = {
            LABELING_ALLOWED: 1,
            NO_ITEMS: 2,
            ITEMS_COMPLETED: 3,
            LABELING_PAUSED: 4,
            LABELING_ENDED: 5
        };

    }
}

export default new Dataset;
