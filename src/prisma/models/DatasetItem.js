import DBModelBase from "./DBModelBase.Class.js";
import prisma from "../prisma.module.js";
import Label from "./Label.js";

class DatasetItems extends DBModelBase {
    constructor() {
        super();
        this.table = 'datasetItems';
        this.client = prisma.datasetItems;
        this.modelPublicFields = {Id: true, Name: true, Type: true, FileName: true, FileExtension: true, LabelId: true, AnswersCount: true, Field: true, Source: true, Content: true};

        this.itemTypes = {
            IMAGE: 0,
            TEXT: 1,
            VIDEO: 2,
            VOICE: 3,
        }
    }

    processItem(datasetItem, label = null, goldensPath) {
        let itemJob = goldensPath ? goldensPath : datasetItem.FilePath;
        itemJob = itemJob.split('\\')[4];

        switch (itemJob) {
            case 'Actors':
                itemJob = "بازیگر";
                break;

            case 'Singers':
                itemJob = "خواننده";
                break;

            case 'Politicians':
                itemJob = "سیاست مدار";
                break;
        }

        let title, processedLabelName;

        if(label) {
            title = " آیا تصاویر متعلق به {{label.title}} (" + itemJob + ") است؟";
            processedLabelName = Label.getCleanLabelName(label);
        }
        else
            title = " آیا تصویر متعلق به {{label.title}} (" + itemJob + ") است؟";

        title = title.replace("{{label.title}}", label ? processedLabelName : datasetItem.Name);
        return {
            title,
            itemJob
        };
    }
}

export default new DatasetItems;
