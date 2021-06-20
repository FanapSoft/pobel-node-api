import prisma from '../prisma.module.js'
import DBModelBase from "./DBModelBase.Class.js";

class Answer extends DBModelBase {
    constructor() {
        super();
        this.table = 'answerOptions';
        this.client = prisma.answerOptions
        this.modelPublicFields = null;
    }
}

export default new Answer;
