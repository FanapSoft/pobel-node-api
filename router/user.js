import express from "express";

import {asyncWrapper} from "../utils/asyncWrapper";
import userController from "../Controllers/api/User";

const ROUTER = express.Router();

export default function (router) {
    router.get("/api/User/GetAll", asyncWrapper(userController.findAll));
    router.get("/api/User/Get/:id", asyncWrapper(userController.findOne));
    router.put("/api/User/Update/:id", asyncWrapper(userController.update));
    router.delete("/api/User/Delete/:id", asyncWrapper(userController.delete));
}
