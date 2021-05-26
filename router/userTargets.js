import {asyncWrapper} from "../utils/asyncWrapper";
import targetController from "../Controllers/api/UserTargets";

export default function (router) {
    //router.get("/api/Targets/GetAll", asyncWrapper(targetController.findAll));
    //router.get("/api/Targets/Get/:id", asyncWrapper(targetController.findOne));
    router.post("/api/Targets/create", asyncWrapper(targetController.create));
    router.put("/api/Targets/Update/:id", asyncWrapper(targetController.update));
    router.delete("/api/Targets/Delete/:id", asyncWrapper(targetController.delete));
}
