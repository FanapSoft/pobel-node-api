import {asyncWrapper} from "../utils/asyncWrapper.js";
import datasetItemsController from "../Controllers/api/DatasetItems.js";

export default function (router) {
    router.get("/api/Reports/AnswersCountsTrend", asyncWrapper(datasetItemsController.answersCountTrend));
}
