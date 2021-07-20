/**
 * @swagger
 *  components:
 *   schemas:
 */
import {asyncWrapper} from "../utils/asyncWrapper.js";
import walletController from "../controllers/api/Wallet.js";
import {body, check, validationResult} from 'express-validator';

export default function (router) {
    /**
     * @swagger
     * /api/Wallet/TransferCreditToPodWallet:
     *   post:
     *     tags:
     *       - Wallet
     *     description:
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: UserId
     *         in: body
     *         type: string
     *         format: uuid
     *       - name: PhoneNumber
     *         in: body
     *         type: number
     *     responses:
     *       200:
     *         description: transfer result
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 debitAmount:
     *                   type: number
     *                   format: float
     */
    router.post("/api/Wallet/TransferCreditToPodWallet", [
        check('UserId').optional({checkFalsy: true}).notEmpty().isUUID(),
        check('PhoneNumber').optional({checkFalsy: true}).notEmpty().isLength({max: 15}).isNumeric(),
    ], asyncWrapper(walletController.transferCreditToPodWallet));
}
