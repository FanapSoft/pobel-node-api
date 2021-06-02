import DBModelBase from "./DBModelBase.Class";
import prisma from "../prisma.module";

class Dataset extends DBModelBase {
    constructor() {
        super();
        this.table = 'datasetItems';
        this.client = prisma.datasetItems
        this.modelPublicFields = {Id: true, Name: true, Type: true, FileName: true, FileExtension: true};
    }
}

export default new Dataset;
