import prisma from '../prisma.module.js'
import DBModelBase from "./DBModelBase.Class.js";

class Answer extends DBModelBase {
    constructor() {
        super();
        this.table = 'answerLogs';
        this.client = prisma.answerLogs
        this.modelPublicFields = null;
    }
}

export default new Answer;
