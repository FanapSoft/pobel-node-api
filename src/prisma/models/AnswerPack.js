import prisma from '../prisma.module.js'
import DBModelBase from "./DBModelBase.Class.js";
import Dataset from "./Dataset";

class AnswerPack extends DBModelBase {
    constructor() {
        super();
        this.table = 'answerPacks';
        this.client = prisma.answerPacks
        this.modelAdminFields = {
            Id: true, Title: true,
            AnswerOptions: {
                orderBy: {
                    Index: 'asc'
                }
            }
        };
        this.modelPublicFields = this.modelUserFields = {
            Id: true, Title: true,
            AnswerOptions: {
                orderBy: {
                    Index: 'asc'
                }
            }
        };
    }

}

export default new AnswerPack;
