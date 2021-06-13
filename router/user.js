/**
 * @swagger
 *  components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - Name
 *         - PodContactId
 *         - Email
 *       properties:
 *         Id:
 *           type: number
 *           format: BigInt
 *         UserName:
 *           type: string
 *         Name:
 *           type: string
 *         Surename:
 *           type: string
 *         Email:
 *           type: string
 *         IsActive:
 *           type: string
 *         FullName:
 *           type: string
 *         PodUserId:
 *           type: integer
 *         PodContactId:
 *           type: integer
 *     UsersPaged:
 *       type: object
 *       properties:
 *         totalCount:
 *           type: integer
 *         items:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/User"
 */

import express from "express";

import {asyncWrapper} from "../utils/asyncWrapper.js";
import userController from "../Controllers/api/User.js";

const ROUTER = express.Router();

export default function (router) {
    /**
     * @swagger
     * /api/User/GetAll:
     *   get:
     *     tags:
     *       - User
     *     description: Get a list of Users
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: Keyword
     *         in: query
     *         schema:
     *           type: string
     *       - name: IsActive
     *         in: query
     *       - name: Skip
     *         in: query
     *       - name: Limit
     *         in: query
     *     responses:
     *       200:
     *         description: An array of Users
     *         type: array
     *         content:
     *           application/json:
     *             schema:
     *               $ref: "#/components/schemas/UsersPaged"
     *
     *
     */
    router.get("/api/User/GetAll", asyncWrapper(userController.findAll));
    /**
     * @swagger
     * /api/User/Get/{id}:
     *   get:
     *     tags:
     *       - User
     *     description: Get a User
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: An object
     *         type: object
     *         content:
     *           application/json:
     *             schema:
     *               $ref: "#/components/schemas/User"
     *
     */
    router.get("/api/User/Get/:id", asyncWrapper(userController.findOne));
    /**
     * @swagger
     * /api/User/Update/{id}:
     *   put:
     *     tags:
     *       - User
     *     description: Update a User
     *     produces:
     *       - application/json
     *
     *     requestBody:
     *      content:
     *       application/json:
     *        schema:
     *          $ref: "#/components/schemas/User"
     *     responses:
     *       200:
     *         description: Returns the created dataset
     *         type: object
     *         content:
     *           application/json:
     *             schema:
     *               $ref: "#/components/schemas/User"
     *
     */
    router.put("/api/User/Update/:id", asyncWrapper(userController.update));
    /**
     * @swagger
     * /api/User/Delete/{id}:
     *   delete:
     *     tags:
     *       - User
     *     description: Get a dataset
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Returns the deleted dataset
     *         type: object
     *         content:
     *           application/json:
     *             schema:
     *               $ref: "#/components/schemas/User"
     *
     *
     */
    router.delete("/api/User/Delete/:id", asyncWrapper(userController.delete));
}
