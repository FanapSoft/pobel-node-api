import prisma from '../prisma.module.js'
import DBModelBase from "./DBModelBase.Class.js";

class Transaction extends DBModelBase {
    constructor() {
        super();
        this.table = 'transactions';
        this.client = prisma.transactions;
        this.modelAdminFields = {Id: true, CreatedAt: true, CreditAmount: true, DebitAmount: true, Reason: true, ReasonDescription: true, ReferenceDatasetId: true };
        this.modelPublicFields = {Id: true, CreatedAt: true, CreditAmount: true, DebitAmount: true, Reason: true, ReasonDescription: true, ReferenceDatasetId: true };
    }

    async calculateBalance(userId) {
        let trans = await prisma.$queryRaw("Select\n" +
            " sum(CASE WHEN t.\"DebitAmount\" = 0 THEN t.\"CreditAmount\" ELSE 0 end) As CreditAmount,\n" +
            " sum(CASE WHEN t.\"CreditAmount\" = 0 THEN t.\"DebitAmount\" ELSE 0 end) As DebitAmount\n" +
            " From \"Transactions\" t\n" +
            " WHERE \"OwnerId\"='" + userId + "'")

        return trans[0];
    }
}

export default new Transaction;
