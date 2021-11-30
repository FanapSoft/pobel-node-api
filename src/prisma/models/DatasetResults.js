import prisma from '../prisma.module.js'
import DBModelBase from "./DBModelBase.Class.js";


class DatasetResults extends DBModelBase {
    constructor() {
        super();
        this.table = 'datasetResults';
        this.client = prisma.datasetResults
        this.modelPublicFields = null;
        this.modelAdminFields = {
            Id: true,
            CreatedAt: true,
            DatasetId: true,
            DatasetItemId: true,
            IsReplicationDone: true,
            TotalAnswers: true,
            TotalYesAnswers: true,
            TotalNoAnswers: true,
            OverAllResult: true,
            OverAllResultPercent: true,
            RequiredReplication: true
        };

    }
}

export default new DatasetResults;
