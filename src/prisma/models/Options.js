import prisma from '../prisma.module.js'
import DBModelBase from "./DBModelBase.Class.js";
import Dataset from "./Dataset";

class Option extends DBModelBase {
    constructor() {
        super();
        this.table = 'options';
        this.client = prisma.options
        this.modelAdminFields = {Key: true, Value: true, };
        this.modelPublicFields = {Key: true, Value: true, };
    }

    async getOption(name) {
        const result = await this.client.findUnique({
            where: {
                Key: name
            }
        });

        if(result) {
            if(result.Value){
                try {
                    result.Value = JSON.parse(result.Value)
                } catch (err) {
                    //Do nothing
                }
            }
            return result
        } else {
            return false
        }
    }

    async updateOption(name, value) {
        let val = value;
        if(value && typeof value !== "string") {
            val = JSON.stringify(value);
        }

        const result = await this.client.upsert({
            where: {
                Key: name
            },
            update: {Key: name, Value: val},
            create: {Key: name, Value: val},
        });

        if(result) {
            return result
        } else {
            return false
        }
    }
}

export default new Option;
