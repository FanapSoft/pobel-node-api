
import {asyncWrapper} from "../utils/asyncWrapper.js";
import filesController from "../Controllers/api/Files.js";
import {body, check, validationResult} from 'express-validator';

export default function (router) {
    router.get("/api/File/Dataset/Item/:id", [
        check('id').notEmpty().isLength({max:50}).escape()
    ], asyncWrapper(filesController.streamDatasetImages));
}
