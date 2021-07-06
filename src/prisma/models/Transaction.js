import prisma from '../prisma.module.js'
import DBModelBase from "./DBModelBase.Class.js";

class Transaction extends DBModelBase {
    constructor() {
        super();
        this.table = 'transactions';
        this.client = prisma.transactions;
        this.modelPublicFields = {Id: true, CreatedAt: true, CreditAmount: true, DebitAmount: true, Reason: true, ReasonDescription: true, };
    }
}

export default new Transaction;
