import {asyncWrapper} from "../utils/asyncWrapper.js";
import {check} from "express-validator";
import resultsController from "../controllers/api/Results.js";

export default function (router) {
    router.get("/api/DatasetsResults/GetAll", [
        check('DatasetId').optional({checkFalsy: true}).isLength({max: 80}),
        check('Limit').optional({checkFalsy: true}).isInt({max: 50}),
        check('Skip').optional({checkFalsy: true}).isInt(),
    ], asyncWrapper(resultsController.GetAll));

    router.get("/api/DatasetsResults/StartCalculatingResults", [
        check('DatasetId').optional({checkFalsy: true}).isLength({max: 80}).escape()
    ], asyncWrapper(resultsController.StartCalculatingResults));

    router.get("/api/DatasetsResults/StopCalculatingResults", [
        check('DatasetId').optional({checkFalsy: true}).isLength({max: 80}).escape()
    ], asyncWrapper(resultsController.StopCalculatingResults));

    router.get("/api/DatasetsResults/StartGenerateCSV", [
        check('DatasetId').optional({checkFalsy: true}).isLength({max: 80}).escape()
    ], asyncWrapper(resultsController.StartGenerateCSV));

    router.get("/api/DatasetsResults/GetState", [
        check('DatasetId').optional({checkFalsy: true}).isLength({max: 80}).escape()
    ], asyncWrapper(resultsController.GetState));

    router.get("/api/DatasetsResults/Reset", [
        check('DatasetId').optional({checkFalsy: true}).isLength({max: 80}).escape()
    ], asyncWrapper(resultsController.Reset));
}
