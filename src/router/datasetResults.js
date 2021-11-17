import {asyncWrapper} from "../utils/asyncWrapper.js";
import reportsController from "../controllers/api/Reports.js";
import {check} from "express-validator";
import resultsController from "../controllers/api/Results";

export default function (router) {
    router.get("/api/DatasetsResults/GetAll", [
        check('DatasetId').optional({checkFalsy: true}).isLength({max: 80}),
        check('From').optional({checkFalsy: true}).matches(/^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/),
        check('To').optional({checkFalsy: true}).matches(/^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/),
        check('Limit').optional({checkFalsy: true}).isInt({max: 50}),
        check('Skip').optional({checkFalsy: true}).isInt(),
    ], asyncWrapper(resultsController.GetAll));

    router.get("/api/DatasetsResults/StartCalculatingResults", [
        check('DatasetId').optional({checkFalsy: true}).isLength({max: 80}).escape()
    ], asyncWrapper(resultsController.startCalculatingResults));

    router.get("/api/DatasetsResults/StopCalculatingResults", [
        check('DatasetId').optional({checkFalsy: true}).isLength({max: 80}).escape()
    ], asyncWrapper(resultsController.stopCalculatingResults));

    router.get("/api/DatasetsResults/GetState", [
        check('DatasetId').optional({checkFalsy: true}).isLength({max: 80}).escape()
    ], asyncWrapper(resultsController.getState));

    router.get("/api/DatasetsResults/Reset", [
        check('DatasetId').optional({checkFalsy: true}).isLength({max: 80}).escape()
    ], asyncWrapper(resultsController.resetResults));
}
