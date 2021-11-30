import prisma from '../prisma.module.js'
import DBModelBase from "./DBModelBase.Class.js";
import Dataset from "./Dataset";

class Answer extends DBModelBase {
    constructor() {
        super();
        this.table = 'answerLogs';
        this.client = prisma.answerLogs
        this.modelAdminFields = {Id: true, Ignored: true, Answer: true, DatasetId: true, DatasetItemId: true, CreditCalculated: true, CreatedAt: true, AnswerType: true, GoldenType: true};
        this.modelPublicFields = this.modelUserFields = {Id: true, Ignored: true, Answer: true, DatasetId: true, DatasetItemId: true, CreditCalculated: true, CreatedAt: true};

        this.answerTypes = {
            GOLDEN: 0,
            NORMAL: 1,
            SKIP: 2,
            REPORT: 3
        };
        this.goldenTypes = {
            ISNOTGOLDEN: 0,
            POSITIVE: 1,
            NEGATIVE: 2
        };
    }

    async calculateCredit(userId, dataset, target) {
        let credit = 0;

        let conf = null, results = null;

        if(dataset.Type === Dataset.datasetTypes.FILE) {
            conf = [
                {a: dataset.AnswerPack.AnswerOptions[1].Index, at: 0, gt: 1},
                {a: dataset.AnswerPack.AnswerOptions[0].Index, at: 0, gt: 2},
            ];

            results = await prisma.$queryRaw`SELECT Count(*) AS Total,
                 sum(CASE WHEN "Answer" = ${conf[0].a} AND "AnswerType" = ${conf[0].at}  AND "GoldenType" = ${conf[0].gt}   then 1 else 0 end) AS CorrectPositiveGoldens, 
                 sum(CASE WHEN "Answer" <> ${conf[0].a}  AND "AnswerType" = ${conf[0].at}  AND "GoldenType"= ${conf[0].gt}   then 1 else 0 end) AS IncorrectPositiveGoldens, 
                 sum(CASE WHEN "Answer" = ${conf[1].a}  AND "AnswerType"= ${conf[1].at}  AND "GoldenType"= ${conf[1].gt}   then 1 else 0 end) AS CorrectNegativeGoldens, 
                 sum(CASE WHEN "Answer" <>  ${conf[1].a}  AND "AnswerType"=  ${conf[1].at}  AND "GoldenType"= ${conf[1].gt}  then 1 else 0 end) AS IncorrectNegativeGoldens 
                 FROM "AnswerLogs"
                 WHERE "UserId" = ${userId} AND "DatasetId" = ${dataset.Id} AND "CreditCalculated" = false`;

            let totalCorrectGoldens = results[0].correctpositivegoldens + results[0].correctnegativegoldens
            if(totalCorrectGoldens > 0) {
                let config = {
                    bonusTruePositive: target.BonusTruePositive,
                    bonusTrueNegative: target.BonusTrueNegative,
                };
                //Fixes formula incorrect value when user answers more goldens than what is specified in the target
                credit = (target.UMax - target.UMin) * Math.pow(target.T, target.GoldenCount) * Math.pow(config.bonusTruePositive, results[0].correctpositivegoldens) * Math.pow(target.BonusFalsePositive, results[0].incorrectpositivegoldens) * Math.pow(config.bonusTrueNegative, results[0].correctnegativegoldens) * Math.pow(target.BonusFalseNegative, results[0].incorrectnegativegoldens);

                if(credit > target.UMax || totalCorrectGoldens > target.GoldenCount) {
                    credit = (target.UMax - target.UMin) * Math.pow(target.BonusFalsePositive, results[0].incorrectpositivegoldens) * Math.pow(target.BonusFalseNegative, results[0].incorrectnegativegoldens) + target.UMin
                }
            }
        } else if(dataset.Type === Dataset.datasetTypes.TEXT) {
            conf = [
                {a: dataset.AnswerPack.AnswerOptions[0].Index, at: this.answerTypes.GOLDEN, gt: this.goldenTypes.POSITIVE},
            ];

            results = await prisma.$queryRaw`SELECT Count(*) AS Total, 
                 sum(CASE WHEN "IsCorrect" =  true  AND "AnswerType" = ${conf[0].at}  AND "GoldenType" =  ${conf[0].gt}  then 1 else 0 end) AS CorrectPositiveGoldens, 
                 sum(CASE WHEN "IsCorrect" = false  AND "AnswerType" = ${conf[0].at} AND "GoldenType" = ${conf[0].gt}  then 1 else 0 end) AS IncorrectPositiveGoldens 
                 FROM "AnswerLogs"
                 WHERE "UserId" = ${userId}  AND "DatasetId" =  ${dataset.Id} AND "CreditCalculated" = false`;

            let totalCorrectGoldens = results[0].correctpositivegoldens
            if(totalCorrectGoldens > 0) {
                let config = {
                    bonusTruePositive: target.BonusTruePositive,
                };
                //Fixes formula incorrect value when user answers more goldens than what is specified in the target
                credit = (target.UMax - target.UMin) * Math.pow(target.T, target.GoldenCount) * Math.pow(config.bonusTruePositive, results[0].correctpositivegoldens) * Math.pow(target.BonusFalsePositive, results[0].incorrectpositivegoldens);

                if(credit > target.UMax || totalCorrectGoldens > target.GoldenCount) {
                    credit = (target.UMax - target.UMin) * Math.pow(target.BonusFalsePositive, results[0].incorrectpositivegoldens) + target.UMin;
                }
            }
        }

        if(!credit || credit < 0) {
            credit = 0;
        }

        // if(credit > target.UMax)
        //     credit = target.UMax;

        return credit;
    }
}

export default new Answer;
