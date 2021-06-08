import {asyncWrapper} from "../utils/asyncWrapper.js";
import datasetController from "../Controllers/api/Datasets.js";

export default function (router) {
    router.get("/api/Datasets/GetAll", asyncWrapper(datasetController.findAll));
    router.get("/api/Datasets/Get/:id", asyncWrapper(datasetController.findOne));
    router.post("/api/Datasets/Create", asyncWrapper(datasetController.create));
    router.put("/api/Datasets/Update/:id", asyncWrapper(datasetController.update));
    router.delete("/api/Datasets/Delete/:id", asyncWrapper(datasetController.delete));
}
