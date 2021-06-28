import prisma from '../prisma.module.js'
import DBModelBase from "./DBModelBase.Class.js";

class Transaction extends DBModelBase {
    constructor() {
        super();
        this.table = 'transactions';
        this.client = prisma.transactions
        this.modelPublicFields = null;

    }
}

export default new Transaction;
