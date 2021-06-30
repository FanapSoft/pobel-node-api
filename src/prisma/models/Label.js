import prisma from '../prisma.module.js'
import DBModelBase from "./DBModelBase.Class.js";

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
}

export default new Label;
