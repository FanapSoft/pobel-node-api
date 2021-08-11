// import prisma from "../../prisma/prisma.module.js";
// import httpStatus from "http-status";
import {handleError} from "../../imports/errors.js";
// import acl from "../../imports/acl.js";
import Dataset from "../../prisma/models/Dataset.js";
import prisma from "../../prisma/prisma.module.js";
import {validationResult} from "express-validator";
import moment from 'jalali-moment'

const reportController = {};

reportController.answersCountTrend = async (req, res) => {
    let {
        UserId,
        From,
        To,
        DatasetId
    } = req.query;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    if(!From)
        From = moment().utc(false).add(-30, "days").toISOString(); //30 days ago
   if(!To)
       To = new Date().toISOString();

   const dif = {
       from: moment(From),
       to: moment(To)
   }
   const range = dif.to.diff(dif.from, 'days');
    if(range > 30 || range < 0) {
        return handleError(res, {error: {code: 3002, message: 'Invalid from and(or) to dates, Invalid range'}});
    }

    let userIdString = '', datasetIdString = '';
    if(DatasetId)
        datasetIdString = " AND \"AnswerLogs\".\"DatasetId\" = '" + DatasetId + "' "
    if(UserId) {
        if(UserId !== req.decoded.Id && req.decoded.role !== 'admin') {
            return handleError(res, {error: {code: 3002, message: 'You can not view results for others!'}});
        }
        userIdString = " AND \"AnswerLogs\".\"UserId\" = '" + UserId + "' "
    }

    try {
        let result = await prisma.$queryRaw("select date(d) as day, count(\"AnswerLogs\".\"Id\") \n" +
            "from generate_series(\n" +
            "  date('"+ From +"'), \n" +
            "  date('"+ To +"'), \n" +
            "  '1 day'\n" +
            ") d \n" +
            "\n" +
            "left join \"AnswerLogs\" on date(\"AnswerLogs\".\"CreatedAt\") = d " + userIdString +  datasetIdString + " \n" +
            "group by day order by day;\n");
        return res.send(result);
    } catch (error) {
        console.log(error)
        return handleError(res, {});
    }
};

reportController.scoreboard = async (req, res) => {
    let {
        From,
        DatasetId,
        Skip = 0,
        Limit = process.env.API_PAGED_RESULTS_DEFAULT_LIMIT,
    } = req.query;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    if(!From)
        From = moment().utc(false).add(-30, "days").toISOString(); //30 days ago

   if(new Date() < new Date(From)) {
       return handleError(res, {error: {code: 3002, message: 'Invalid from date'}});
   }

    let datasetIdString = '';
    if(DatasetId)
        datasetIdString = " AND AL.\"DatasetId\" = '" + DatasetId + "' ";

    try {
        let result = await prisma.$queryRaw("SELECT AL.\"UserId\" , U.\"Name\", U.\"Surname\", COUNT(AL.\"Id\") AS Count, \'" + From + "\' AS From\n" +
            "FROM \"AnswerLogs\" AL\n" +
            "JOIN \"User\" U ON  U.\"Id\" = AL.\"UserId\" AND date(AL.\"CreatedAt\") > date('"+ From +"')  " + datasetIdString + " \n" +
            "GROUP BY AL.\"UserId\", U.\"Name\", U.\"Surname\"\n" +
            "ORDER BY Count DESC " +
            " OFFSET " + Skip + "\n" +
            " LIMIT " + Limit + "");
        return res.send(result);
    } catch (error) {
        console.log(error)
        return handleError(res, {});
    }
};

reportController.dashboard = async  (req, res) => {
    try {
        let result = await prisma.$queryRaw("SELECT \n" +
            "(select count(*) as answers from \"AnswerLogs\"  ),\n" +
            "(select count(*) as correctgoldenanswers from \"AnswerLogs\" where \"IsCorrect\" = true ),\n" +
            "(select count(*) as datasetItems from \"DatasetItems\" ),\n" +
            "(select count(*) as users from \"User\" ),\n" +
            "(select count(*) as generatedQuestions from \"QuestionRequestLogs\"),\n" +
            "(select count(*) as transactions from \"Transactions\"),\n" +
            "\n" +
            "(select count(*) as datasets from \"Datasets\"  )");

        res.send(result[0]);
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
}

export default reportController;
