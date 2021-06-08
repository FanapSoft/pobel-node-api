import DBModelBase from "./DBModelBase.Class.js";
import prisma from "../prisma.module.js";

class DatasetItems extends DBModelBase {
    constructor() {
        super();
        this.table = 'datasetItems';
        this.client = prisma.datasetItems
        this.modelPublicFields = {Id: true, Name: true, Type: true, FileName: true, FileExtension: true};
    }
}

export default new DatasetItems;
