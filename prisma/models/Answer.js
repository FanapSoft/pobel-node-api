import prisma from '../prisma.module.js'
import DBModelBase from "./DBModelBase.Class.js";

class Answer extends DBModelBase {
    constructor() {
        super();
        this.table = 'answerLogs';
        this.client = prisma.answerLogs
        this.modelPublicFields = null;

        this.answerTypes = {
            GOLDEN: 0,
            NORMAL: 1,
            SKIP: 2,
            REPORT: 3
        };
        this.goldenTypes = {
            ISNOTGOLDEN: 0,
            POSITIVE: 1,
            NEGATIVE: 2
        };
    }
}

export default new Answer;
