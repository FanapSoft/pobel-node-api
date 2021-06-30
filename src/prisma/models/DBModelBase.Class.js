import prisma from "../prisma.module.js";

class DBModelBase {
    constructor() {
        this.table = '';
        this.modelPublicFields = {};

    }
    async findById(id, role = 'guest') {
        const select = role === 'admin' ? null : this.modelPublicFields;
        return await prisma[this.table].findUnique({
            select,
            where: {
                Id: id
            }
        });
    }
    async findByObject(data, role = 'guest') {
        const select = role === 'admin' ? null : this.modelPublicFields;
        return await prisma[this.table].findFirst({
            select,
            where: data
        });
    }
}

export default DBModelBase
