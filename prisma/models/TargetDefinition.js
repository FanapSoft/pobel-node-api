import prisma from '../prisma.module.js'
import DBModelBase from "./DBModelBase.Class.js";

class TargetDefinition extends DBModelBase {
    constructor() {
        super();
        this.table = 'targetDefinitions';
        this.client = prisma.targetDefinitions;
        this.modelPublicFields = {Id: true, Type: true, AnswerCount: true, GoldenCount: true, T: true, UMin: true, UMax: true, BonusFalse: true, BonusTrue: true};
    }
}

export default new TargetDefinition;
