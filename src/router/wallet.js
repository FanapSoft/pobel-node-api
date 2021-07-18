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
     *           consumes
     *             - application/json
     *     parameters:
     *       - name: UserId
     *         in: body
     *       - name: PhoneNumber
     *         in: body
     *     responses:
     *       200:
     *         description: transfer result
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   Amount:
     *                     type: number
     *                     format: float
     *                   Result:
     *                     type: boolean
     */
    router.post("/api/Wallet/TransferCreditToPodWallet", [
        check('UserId').optional({checkFalsy: true}).notEmpty().isUUID(),
        check('PhoneNumber').optional({checkFalsy: true}).notEmpty().isLength({max: 15}).isNumeric(),
    ], asyncWrapper(walletController.transferCreditToPodWallet));
}
