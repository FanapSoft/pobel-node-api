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
        this.modelAdminFields = {Id: true, Name: true, Description: true, Type: true, AnswerType: true, IsActive: true,  LabelingStatus: true, CreatedAt: true, UpdatedAt: true, ProcessedItemsSourcePath: true, AnswerReplicationCount: true, AnswerBudgetCountPerUser: true, ItemsSourcePath: true, QuestionType: true, AnswerOptions: true};

        this.datasetTypes = {
            FILE: 1,
            TEXT: 2,
            FILE_AND_TEXT: 3
        };

        this.typesConfig = {
            1: {
                hasLabel: true,
            },
            2:{
                hasLabel: false,
            },
            3: {
                hasLabel: true,
            }
        };

        this.labelingStatuses = {
            LABELING_ALLOWED: 1,
            NO_ITEMS: 2,
            ITEMS_COMPLETED: 3,
            LABELING_PAUSED: 4,
            LABELING_ENDED: 5
        };
    }

    async findById(id, role = 'guest') {
        const select = this.getFieldsByRole(role);
        select.AnswerOptions = {
            orderBy: {
                Index: 'asc'
            }
        }
        return await prisma[this.table].findUnique({
            select,
            where: {
                Id: id
            }
        });
    }

    async changeDatasetLabelingStatus(id, status) {
        await this.client.update({
            where: {
                Id: id
            },
            data: {
                LabelingStatus: status
            }
        });
    }
}

export default new Dataset;
