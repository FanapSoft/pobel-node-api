import {asyncWrapper} from "../utils/asyncWrapper.js";
import targetController from "../Controllers/api/TargetDefinitions.js";

export default function (router) {
    router.get("/api/TargetDefinitions/GetAll", asyncWrapper(targetController.findAll));
    router.get("/api/TargetDefinitions/Get/:id", asyncWrapper(targetController.findOne));
    router.post("/api/TargetDefinitions/create", asyncWrapper(targetController.create));
    router.put("/api/TargetDefinitions/Update/:id", asyncWrapper(targetController.update));
    router.delete("/api/TargetDefinitions/Delete/:id", asyncWrapper(targetController.delete));
}
