import prisma from "../prisma.module.js";

class DBModelBase {
    constructor() {
        this.table = '';
        this.modelPublicFields = null;
        this.modelUserFields = null;
        this.modelAdminFields = null;

    }
    async findById(id, role = 'guest') {
        const select = this.getFieldsByRole(role);
        return await prisma[this.table].findUnique({
            select,
            where: {
                Id: id
            }
        });
    }
    async findByObject(data, role = 'guest') {
        const select = this.getFieldsByRole(role);
        return await prisma[this.table].findFirst({
            select,
            where: data
        });
    }

    getFieldsByRole(role) {
        switch (role) {
            case 'admin':
                return this.modelAdminFields;
            case 'user':
                return (this.modelAdminFields ? this.modelAdminFields : this.modelPublicFields);
            case 'guest':
            default:
                return this.modelPublicFields;
        }
    }
}

export default DBModelBase
