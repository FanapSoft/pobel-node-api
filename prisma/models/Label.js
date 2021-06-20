import prisma from '../prisma.module.js'
import DBModelBase from "./DBModelBase.Class.js";

class Label extends DBModelBase {
    constructor() {
        super();
        this.table = 'labels';
        this.client = prisma.labels
        this.modelPublicFields = ["Name", "DatasetId"];
    }
}

export default new Label;
