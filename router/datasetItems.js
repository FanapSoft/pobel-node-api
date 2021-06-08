import {asyncWrapper} from "../utils/asyncWrapper.js";
import datasetItemsController from "../Controllers/api/DatasetItems.js";

export default function (router) {
    router.get("/api/DatasetItems/GetAll", asyncWrapper(datasetItemsController.findAll));
    router.get("/api/DatasetItems/Get/:id", asyncWrapper(datasetItemsController.findOne));
    //router.get("/api/DatasetsItems/Get", asyncWrapper(datasetItemsController.findOne));
    //router.post("/api/DatasetsItems/create", asyncWrapper(datasetItemsController.create));
    //router.put("/api/DatasetsItems/Update/:id", asyncWrapper(datasetItemsController.update));
    router.delete("/api/DatasetItems/Delete/:id", asyncWrapper(datasetItemsController.delete));
}
