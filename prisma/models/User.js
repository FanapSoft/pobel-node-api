import prisma from '../prisma.module'
import DBModelBase from "./DBModelBase.Class";

class User extends DBModelBase {
    constructor() {
        super();
        this.table = 'user';
        this.modelPublicFields = {Id: true, UserName: true, Name: true, Email: true};
    }
}

export default new User;
