import prisma from '../prisma.module.js'
import DBModelBase from "./DBModelBase.Class.js";

class User extends DBModelBase {
    constructor() {
        super();

        this.table = 'user';
        //TODO: imprive this move to DBModelBase Class
        this.client = prisma.user;

        this.modelPublicFields = {Id: true, UserName: true, Name: true, Email: true};
    }
}

export default new User;
