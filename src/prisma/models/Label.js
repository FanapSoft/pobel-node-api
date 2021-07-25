import prisma from '../prisma.module.js'
import DBModelBase from "./DBModelBase.Class.js";
import DatasetItem from "./DatasetItem";

class Label extends DBModelBase {
    constructor() {
        super();
        this.table = 'labels';
        this.client = prisma.labels
        this.modelPublicFields = ["Name", "DatasetId"];
    }

    getCleanLabelName(label) {
        let processedLabelName = label.Name.split('_');
        processedLabelName = processedLabelName.slice(1, processedLabelName.length).join(' ').trim();
        return label.Name.split('_').slice(1, processedLabelName.length).join(' ').trim()
    }

    async maybeDoneLabel(labelId, dataset) {
        let labelItemsCount = await DatasetItem.client.count({
            where: {
                LabelId: labelId,
                DatasetId: dataset.Id,
                AnswersCount: {
                    lt: dataset.AnswerReplicationCount
                }
            }
        });

        if(!labelItemsCount) {
            await this.client.update({
                where: {
                    Id: labelId
                },
                data: {
                    ItemsDone: true
                }
            });
        }
    }
}

export default new Label;
