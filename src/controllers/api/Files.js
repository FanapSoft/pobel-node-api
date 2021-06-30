import httpStatus from "http-status";
import {handleError} from "../../imports/errors.js";
import DatasetItem from "../../prisma/models/DatasetItem.js";
import {validationResult} from "express-validator";
import fs from 'fs'
import jimp from 'jimp';

const filesController = {};

filesController.streamDatasetImages = async (req, res) => {
    const {
        id
    } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const item = await DatasetItem.findById(id, 'admin');
        if(!item)
            return handleError(res, {status: httpStatus.EXPECTATION_FAILED, error: {code: 3002, message: 'Invalid item id'}});
        if (fs.existsSync(item.FilePath)) {
            const image = await jimp.read(item.FilePath);

            // Resize the image to width 150 and auto height.
            image.resize(150, jimp.AUTO).quality(60).getBuffer(jimp.MIME_JPEG, function(err, buffer){
                res.set("Content-Type", jimp.MIME_JPEG);
                res.send(buffer);
            });

        } else {
            return handleError(res, {status: httpStatus.NOT_FOUND, error: {code: 1000, message: 'Unable to find the item file'}});
        }
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
};

filesController.streamDatasetImagesOriginal = async (req, res) => {
    const {
        id
    } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const item = await DatasetItem.findById(id, 'admin');
        if(!item)
            return handleError(res, {status: httpStatus.EXPECTATION_FAILED, error: {code: 3002, message: 'Invalid item id'}});
        if (fs.existsSync(item.FilePath)) {
            res.sendFile(item.FilePath)
        } else {
            return handleError(res, {status: httpStatus.NOT_FOUND, error: {code: 1000, message: 'Unable to find the item file'}});
        }
    } catch (error) {
        console.log(error);
        return handleError(res, {});
    }
};

export default filesController;
