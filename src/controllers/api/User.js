import prisma from "../../prisma/prisma.module.js";
import httpStatus from "http-status";
import User  from "../../prisma/models/User.js";
import acl from '../../imports/acl.js'
import {handleError} from "../../imports/errors.js";

const userController = {};

// Get All Users
userController.findAll = async (req, res) => {
    const {
        Keyword,
        UserName,
        IsActive,
        Limit = process.env.API_PAGED_RESULTS_DEFAULT_LIMIT,
        Skip = 0
    } = req.query;

    let where = {};
    if(Keyword) {
        where.OR = [
            {
                Name: {
                    contains: Keyword,
                    mode: "insensitive"
                }
            },
            {
                Surname: {
                    contains: Keyword,
                    mode: "insensitive"
                }
            },
            {
                UserName: {
                    contains: Keyword,
                    mode: "insensitive"
                }
            }
        ]
    }

    if(IsActive !== null && IsActive !== undefined)
        where.IsActive = IsActive;
    if(UserName)
        where.UserName = UserName;

    try {
        const items = await User.client.findMany({
            where,
            orderBy: {
                CreatedAt: 'desc'
            },
            skip: JSON.parse(Skip),
            take: parseInt(Limit),
        });
        const totalCount = await User.client.count({
            where,
        });
        return res.send({totalCount, items});
    } catch (error) {
        console.log(error)
        return handleError(res, {});
    }
};

userController.getAllAdvanced = async (req, res) => {
    const {
        Keyword,
        UserName,
        IsActive,
        Limit = process.env.API_PAGED_RESULTS_DEFAULT_LIMIT,
        Skip = 0
    } = req.query;

    let where2 = {
        IsActive: '',
        UserName: '',
        keyword: '',
        query: ''
    }, where = {};

    if(Keyword) {
        where2.keyword = '"Name" like ' + "'%" + Keyword + "%' OR " + '"UserName" like ' + "'%" + Keyword + "%' OR  " + '"Surname" like ' + "'%" + Keyword + "%' ";
        where.OR = [
            {
                Name: {
                    contains: Keyword,
                    mode: "insensitive"
                }
            },
            {
                Surname: {
                    contains: Keyword,
                    mode: "insensitive"
                }
            },
            {
                UserName: {
                    contains: Keyword,
                    mode: "insensitive"
                }
            }
        ]
    }

    if(IsActive !== null && IsActive !== undefined) {
        where2.IsActive = '"IsActive" = true'
        where.IsActive = IsActive;
    }

    if(UserName){
        where2.UserName = '"UserName" = ' + "'" +UserName + "'";
        where.UserName = UserName;
    }


    if(where2.UserName.length){
        where2.query = ' where ' + where2.UserName
    }
    if(where2.IsActive ) {
        if(where2.query)
            where2.query += ' AND ' + where2.IsActive
        else {
            where2.query = ' where ' + where2.IsActive
        }
    }
    if(where2.keyword ){
        if(where2.query)
            where2.query += ' AND (' + where2.keyword + ")"
        else {
            where2.query = ' where ' + where2.keyword
        }
    }

    try {

        /*const items = await User.client.findMany({
            select: {
                Id: true,
            },
            where,
            orderBy: {
                CreatedAt: 'desc'
            },
            skip: JSON.parse(Skip),
            take: parseInt(Limit),
        });*/

        /*if(items && items.length) {




        }*/

        let advancedResult = await prisma.$queryRawUnsafe("select subquery.\"Id\", subquery.\"Name\", subquery.\"Surname\", subquery.\"UserName\", subquery.\"CreatedAt\", subquery.debitAmount, subquery.CreditAmount, subquery.debitAmount + subquery.CreditAmount AS totalincome, subquery.totalanswers, subquery.totalcorrectgoldens, subquery.totalincorrectgoldens\n" +
            "\n" +
            "from (\n" +
            "select \"Id\", \"Name\", \"Surname\", \"UserName\", \"CreatedAt\", \n" +
            "\t(\n" +
            "\t\tselect sum(\"DebitAmount\"::FLOAT) as debitAmount FROM \"Transactions\" where \"OwnerId\" = \"User\".\"Id\"\n" +
            "\t),\n" +
            "\t(\n" +
            "\t\tselect sum(\"CreditAmount\"::FLOAT) as creditAmount FROM \"Transactions\" where \"OwnerId\" = \"User\".\"Id\" and \"DebitAmount\" = 0\n" +
            "\t),\n" +
            "\t(\n" +
            "\t\tselect Count(*) as totalanswers FROM \"AnswerLogs\" where \"UserId\" = \"User\".\"Id\"\n" +
            "\t),\n" +
            "\t(\n" +
            "\t\tselect Count(*) as totalcorrectgoldens FROM \"AnswerLogs\" where \"UserId\" = \"User\".\"Id\" and \"AnswerType\" = 0 and \"IsCorrect\" = true\n" +
            "\t),\n" +
            "\t(\n" +
            "\t\tselect Count(*) as totalincorrectgoldens FROM \"AnswerLogs\" where \"UserId\" = \"User\".\"Id\" and \"AnswerType\" = 0 and \"IsCorrect\" = false\n" +
            "\t)\n" +
            "\t\n" +
            "\tfrom \"User\" "+ where2.query +" ORDER BY \"CreatedAt\" DESC  LIMIT " + Limit + " OFFSET "+ Skip +"\n" +
            ") subquery ")

        const totalCount = await User.client.count({
            where,
        });
        return res.send({totalCount, items: advancedResult});
    } catch (error) {
        console.log(error)
        return handleError(res, {});
    }
};


// Get User By Id
userController.findOne = async (req, res) => {
    const {
        id
    } = req.params;
    try {
        let user = await User.findById(id, req.decoded.Role);

        if(!acl.currentUserCan(req.decoded, user, 'viewOne')) {
            return handleError(res, {code: 2004});
        }

        if (!user) {
            return handleError(res, {code: 3000, status: httpStatus.BAD_REQUEST});
        }

        return res.send(user);
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
};


// Update User By ID
userController.update = async (req, res) => {
    const {
        id
    } = req.params;
    const {
        Name,
        IsActive,
        Role
    } = req.body;
    try {
        let user = await User.findById(id)

        if (!user)
            return handleError(res, {code: 3000, status: httpStatus.BAD_REQUEST});

        if(!acl.currentUserCan(req.decoded, user, 'update')) {
            return handleError(res, {code: 2004, status: httpStatus.FORBIDDEN});
        }

        if(IsActive !== null)
            user.IsActive = IsActive;
        if(Name !== null)
            user.Name = Name;

        if(Role) {
            user.Role = Role;
        }

        const result = await prisma.user.update({
            where: { Id: user.Id },
            data: user,
        });

        return res.send(result);
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
};


// Delete User By ID
userController.delete = async (req, res) => {
    if(!acl.currentUserCan(req.decoded, null, 'delete')) {
        return handleError(res, {code: 2004});
    }
    const {
        id
    } = req.params;

    if (!id)
        return handleError(res, {code: 3000, status: httpStatus.BAD_REQUEST});

    try {
        let user = await prisma.user.delete({where: { Id: id }});

        return res.send(user);
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
};

export default userController;
