import prisma from '../prisma.module.js'
import DBModelBase from "./DBModelBase.Class.js";


class QuestionRequestLog extends DBModelBase {
    constructor() {
        super();
        this.table = 'questionRequestLogs';
        this.client = prisma.questionRequestLogs;
        this.modelPublicFields = null;

        this.types = {
            SENTIMENT: 0,
            LINEAR: 1,
            GRID: 2
        };
    }
}

export default new QuestionRequestLog;
