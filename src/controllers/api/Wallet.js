import httpStatus from "http-status";
import {handleError} from "../../imports/errors.js";
import Answer from "../../prisma/models/Answer.js";
import Dataset from "../../prisma/models/Dataset.js";
import DatasetItem from "../../prisma/models/DatasetItem.js";
import QuestionRequestLog from "../../prisma/models/QuestionRequestLog.js";
import UserTarget from "../../prisma/models/UserTarget.js";
import {validationResult} from "express-validator";
import axios from "axios";
import User from "../../prisma/models/User";
import Transaction from "../../prisma/models/Transaction";
import { v4 as uuidv4 } from 'uuid';
import * as querystring from "querystring";

const walletController = {};

walletController.transferCreditToPodWallet = async (req, res, next) => {
    const {
        UserId,
        PhoneNumber
    } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let uId = UserId ? UserId : req.decoded.Id;
    if(req.decoded.Role !== 'admin') {
        uId = req.decoded.Id;
    }
    try {
        let user = await User.findById(uId, 'admin');
        if(!user)
            return handleError(res, {code: 3002, status: httpStatus.BAD_REQUEST});

        let config = {
            headers: {
                '_token_': '68b346f0c02a4e62880a2aa50ccc0303',
                '_token_issuer_': 1,
                'content-type': 'application/x-www-form-urlencoded'
            }
        };
        if(!user.PodContactId) {
            if(!user.PhoneNumber && !PhoneNumber) {
                return handleError(res, {code: 3502, status: httpStatus.BAD_REQUEST});
            }

            let data = {
                firstName: user.Name,
                lastName: user.Surname,
                username: user.UserName,
                uniqueId: uuidv4(),
                email: user.Email,
                cellphoneNumber: user.PhoneNumber ? user.PhoneNumber : PhoneNumber
            }

            let contactUserResult = await axios.post('https://api.pod.ir/srv/core/nzh/addContacts', querystring.stringify(data), config);

            if(contactUserResult.data.hasError)
                return handleError(res, {code: 3500});

            user = await User.client.update({
                where: {
                    Id: uId
                },
                data: {
                    PodContactId: contactUserResult.data.result[0].id,
                    PhoneNumber: PhoneNumber
                }
            });
        }

        let creditToTransfer = await Transaction.calculateBalance(uId);

        if(creditToTransfer >= 500000) {
            return handleError(res, {code: 3503});
        }

        let amount = creditToTransfer.creditamount * 10;
        config.params = {
            contactId: user.PodContactId,
            amount: amount,
            wallet: 'PODLAND_WALLET',
            currencyCode: 'IRR',
            uniqueId:  uuidv4()
        };

        let transferToUserResult = await axios.get('https://api.pod.ir/srv/core/nzh/transferToContactWithLimit', config);

        if(transferToUserResult.data.hasError) {
            console.log('transferToUserResult: ', transferToUserResult.data);
            return handleError(res, {code: 3501});
        }

        let transToUpdate = await Transaction.client.findMany({
            where: {
                OwnerId: uId,
                DebitAmount: 0
            }
        });

        //let totalDebitedAmount = creditToTransfer;

        for (const trans of transToUpdate) {
                await Transaction.client.update({
                    where: {
                        Id: trans.Id
                    },
                    data: {
                        DebitAmount: trans.CreditAmount
                    }
                });
            // if(trans.CreditAmount <= creditToTransfer) {
            //     await Transaction.client.update({
            //         where: {
            //             Id: trans.Id
            //         },
            //         data: {
            //             DebitAmount: trans.CreditAmount
            //         }
            //     });
            //     creditToTransfer -= trans.CreditAmount;
            // } else {
            //     trans.CreditAmount -= creditToTransfer;
            //
            //     await Transaction.client.update({
            //         where: {
            //             Id: trans.Id
            //         },
            //         data: {
            //             CreditAmount: trans.CreditAmount
            //         }
            //     });
            //     creditToTransfer = 0;
            // }
            //
            // if(!creditToTransfer)
            //     break;
        }

        res.send({debitAmount: creditToTransfer});
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
};
export default walletController;
