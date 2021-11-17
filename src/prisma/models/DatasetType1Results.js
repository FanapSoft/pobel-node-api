import prisma from '../prisma.module.js'
import DBModelBase from "./DBModelBase.Class.js";


class DatasetType1Results extends DBModelBase {
    constructor() {
        super();
        this.table = 'datasetType1Results';
        this.client = prisma.datasetType1Results
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

export default new DatasetType1Results;
