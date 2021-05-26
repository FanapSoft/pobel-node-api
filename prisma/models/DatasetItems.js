import prisma from '../prisma.module'
import DBModelBase from "./DBModelBase.Class";

class Dataset extends DBModelBase {
    constructor() {
        super();
        this.table = 'datasetItems';
        this.modelPublicFields = {Id: true, Name: true, Type: true, FileName: true, FileExtension: true};
    }
}

export default new Dataset;
