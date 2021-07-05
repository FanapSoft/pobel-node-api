import prisma from '../prisma.module.js'
import DBModelBase from "./DBModelBase.Class.js";

class User extends DBModelBase {
    constructor() {
        super();

        this.table = 'user';
        //TODO: move this to DBModelBase Class
        this.client = prisma.user;

        this.modelPublicFields = {Id: true, UserName: true, Name: true, Surname: true, Email: true, IsActive: true};
        this.modelAdminFields = {Id: true, UserName: true, Name: true, Surname: true, Email: true, IsActive: true, PodUserId: true, PodContactId: true, Role: true};
    }
}

export default new User;
