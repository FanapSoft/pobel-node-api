import prisma from '../prisma.module.js'
import DBModelBase from "./DBModelBase.Class.js";

class Answer extends DBModelBase {
    constructor() {
        super();
        this.table = 'answerLogs';
        this.client = prisma.answerLogs
        this.modelPublicFields = null;

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

        const conf = [
            {a: 0, at: 0, gt: 1},
            {a: 1, at: 0, gt: 2},
        ];

        const results = await prisma.$queryRaw("SELECT Count(*) AS Total, \n" +
            " sum(CASE WHEN \"Answer\" = " + conf[0].a + " AND \"AnswerType\" = " + conf[0].at + " AND \"GoldenType\" = " + conf[0].gt + "  then 1 else 0 end) AS CorrectPositiveGoldens, " +
            " sum(CASE WHEN \"Answer\" <> " + conf[0].a + " AND \"AnswerType\" = " + conf[0].at + " AND \"GoldenType\" = " + conf[0].gt + "  then 1 else 0 end) AS IncorrectPositiveGoldens, " +
            " sum(CASE WHEN \"Answer\" = " + conf[1].a + " AND \"AnswerType\" = " + conf[1].at + " AND \"GoldenType\" = " + conf[1].gt + "  then 1 else 0 end) AS CorrectNegativeGoldens, " +
            " sum(CASE WHEN \"Answer\" <> " + conf[1].a + " AND \"AnswerType\" = " + conf[1].at + " AND \"GoldenType\" = " + conf[1].gt + "  then 1 else 0 end) AS IncorrectNegativeGoldens " +
            " FROM \"AnswerLogs\"" +
            " WHERE \"UserId\" = '"+ userId +"' AND \"DatasetId\" = '"+ dataset.Id +"'");

        if(results[0].correctpositivegoldens > 0)
            credit += (target.UMax - target.UMin) * Math.pow(target.T, target.GoldenCount) * Math.pow(target.BonusTruePositive, results[0].correctpositivegoldens) * Math.pow(target.BonusFalsePositive, results[0].incorrectpositivegoldens);
        if(results[0].correctnegativegoldens > 0)
            credit += (target.UMax - target.UMin) * Math.pow(target.T, target.GoldenCount) * Math.pow(target.BonusTrueNegative, results[0].correctnegativegoldens) * Math.pow(target.BonusFalseNegative, results[0].incorrectnegativegoldens);
        // credit += (target.UMax - target.UMin) * Math.pow(target.T, target.GoldenCount) * results[0].correctpositivegoldens * target.BonusTruePositive + target.UMin;
        // credit += (target.UMax - target.UMin) * Math.pow(target.T, target.GoldenCount) * results[0].correctnegativegoldens * target.BonusTrueNegative + target.UMin;
        // credit -= (target.UMax - target.UMin) * Math.pow(target.T, target.GoldenCount) * results[0].incorrectpositivegoldens * target.BonusFalsePositive + target.UMin;
        // credit -= (target.UMax - target.UMin) * Math.pow(target.T, target.GoldenCount) * results[0].incorrectnegativegoldens * target.BonusFalseNegative + target.UMin;

        if(!credit || credit < 0) {
            credit = 0;
        }

        return credit;
    }
}

export default new Answer;
