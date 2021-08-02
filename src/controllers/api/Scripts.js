import httpStatus from "http-status";
import {handleError} from "../../imports/errors.js";
import {validationResult} from "express-validator";
import fs from 'fs'
import path from 'path'
import csv from 'csv'
import DatasetItem from "../../prisma/models/DatasetItem";
import Dataset from "../../prisma/models/Dataset";
import XlsxStreamReader from 'xlsx-stream-reader'


const scriptsController = {};

scriptsController.extractSentimentData = async (req, res) => {
    // const {} = req.query;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    if(req.decoded.Role !== 'admin') {
        return handleError(res, {status: httpStatus.FORBIDDEN, code: 2004})
    }

    let num = 10, i=0;

    let stream = fs.createReadStream(path.resolve("src/static/sentimentData/data.xlsx"));
    let opt  = {delimiter: ',', quote: '"', escape: '"', relax: true, skip_empty_lines: true};

    //let parser = csv.parse(opt);

/*    function done() {
        stream.unpipe(parser);
        parser.end();
        stream.destroy();
    }*/

    function done() {
        stream.unpipe(workBookReader);
        //parser.end();
        stream.destroy();
    }
    function onlyHasDigits(value) {
        return /^\d+$/.test(value);
    }
/*
    let transformer = csv.transform(data => {
        let dirty = data.toString();
        let replace = dirty
            .replace(/\r\n"/g, '\r\n')
            .replace(/"\r\n/g, '\r\n')
            .replace(/""/g, '"');

        return replace;
    });*/

    let datasetId = '203fdc58-2867-4ca4-aa36-8b80ffdb26dc';

    //let workbook = new Excel.Workbook();

   /* parser.on('readable', async function () {
        while(true) {
            if (i < num) {
                let r = parser.read();
                // console.log(i, r);
                let t = r[0].split("\t");
                if(t[0])
                r = r[0].split("\t");
                console.log(i, r);
                if(r[0] && r[0].length) {
                    let extract = {
                        id: JSON.parse(r[0]),
                        text: r[1],
                        field: r[3],
                        source: r[2],
                    };

                    await DatasetItem.client.upsert({
                        where: {
                            ExternalId_DatasetId: {
                                ExternalId: extract.id,
                                DatasetId: datasetId
                            },
                        },
                        create: {
                            ExternalId: extract.id,
                            Content: extract.text,
                            Source: extract.source,
                            Field: extract.field,
                            DatasetId: datasetId,
                            Type: DatasetItem.itemTypes.TEXT,
                            IsGoldenData: false
                        },
                        update: {
                            Content: extract.text,
                            Source: extract.source,
                            Field: extract.field,
                            DatasetId: datasetId,
                            Type: DatasetItem.itemTypes.TEXT,
                            IsGoldenData: false
                        }
                    });

                    console.log(extract);
                }
                i++;
            } else {
                done();
                break;
            }
        }
    });
*/
    /*parser.on('data', async (line) => {
        let r = line[0].split("\t");
        console.log( r);
        if(r[0] && r[0].length) {//&& onlyHasDigits(r[0])
            let extract = {
                id: JSON.parse(r[0]),
                text: r[1],
                field: r[3],
                source: r[2],
            };

            await DatasetItem.client.upsert({
                where: {
                    ExternalId_DatasetId: {
                        ExternalId: extract.id,
                        DatasetId: datasetId
                    },
                },
                create: {
                    ExternalId: extract.id,
                    Content: extract.text,
                    Source: extract.source,
                    Field: extract.field,
                    DatasetId: datasetId,
                    Type: DatasetItem.itemTypes.TEXT,
                    IsGoldenData: false
                },
                update: {
                    Content: extract.text,
                    Source: extract.source,
                    Field: extract.field,
                    DatasetId: datasetId,
                    Type: DatasetItem.itemTypes.TEXT,
                    IsGoldenData: false
                }
            });
        }
    })*/
    //parser.on('error', function() {console.log('Error');}); // TODO: Handle appropriately

    //parser.on('finish', done);
    //stream.pipe(stripBomStream())
    //stream.pipe(transformer)
    //stream.pipe(workbook.xlsx.createInputStream());

    //stream.pipe(parser);


    let workBookReader = new XlsxStreamReader ();
    workBookReader.on('error', function (error) {
        throw(error);
    });
    workBookReader.on('sharedStrings', function () {
        // do not need to do anything with these,
        // cached and used when processing worksheets
        console.log(workBookReader.workBookSharedStrings);
    });

    workBookReader.on('styles', function () {
        // do not need to do anything with these
        // but not currently handled in any other way
        console.log(workBookReader.workBookStyles);
    });

    workBookReader.on('worksheet', function (readedObject) {
        if (readedObject.id > 1){
            // we only want first sheet
            readedObject.skip();
            return;
        }
        // print worksheet name
        //console.log(workSheetReader.name);


        //console.log('>>>',readedObject)
        // if we do not listen for rows we will only get end event
        // and have infor about the sheet like row count
        let runner = readedObject.on('row', async function (row) {
            //console.log("row:", row);
            if (row.attributes.r == 1) {
                // do something with row 1 like save as column names
            } else {
                // second param to forEach colNum is very important as
                // null columns are not defined in the array, ie sparse array
                /*row.values.forEach(function(rowVal, colNum){
                    // do something with row values
                });*/
                // if(i > num) {
                //     done();
                // }
                // i++;

                let extract = {
                    id: JSON.parse(row.values[1]),
                    text: row.values[2],
                    field: row.values[4],
                    source: row.values[3],
                };
                console.log(extract.id);
                if(!extract.id){
                    return;
                    //throw new Error('No id');
                    //readedObject.remove(runner);
                }

                await DatasetItem.client.upsert({
                    where: {
                        ExternalId_DatasetId: {
                            ExternalId: extract.id,
                            DatasetId: datasetId
                        },
                    },
                    create: {
                        ExternalId: extract.id,
                        Content: extract.text,
                        Source: extract.source,
                        Field: extract.field,
                        DatasetId: datasetId,
                        Type: DatasetItem.itemTypes.TEXT,
                        IsGoldenData: false
                    },
                    update: {
                        Content: extract.text,
                        Source: extract.source,
                        Field: extract.field,
                        DatasetId: datasetId,
                        Type: DatasetItem.itemTypes.TEXT,
                        IsGoldenData: false
                    }
                });
            }
        });
        readedObject.on('end', function () {
            console.log(readedObject.rowCount);
        });

        // call process after registering handlers
        readedObject.process();
    });
    workBookReader.on('end', function () {
        // end of workbook reached
    });

    stream.pipe(workBookReader);

    return res.send({success: true});
};

scriptsController.importSentimentGoldens = async (req, res) => {
    // const {} = req.query;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    if (req.decoded.Role !== 'admin') {
        return handleError(res, {status: httpStatus.FORBIDDEN, code: 2004});
    }

    let num = 10, i = 0;

    let stream = fs.createReadStream(path.resolve("src/static/sentimentData/goldens.xlsx"));
    let opt = {delimiter: ',', quote: '"', escape: '"', relax: true, skip_empty_lines: true};

    let datasetId = '203fdc58-2867-4ca4-aa36-8b80ffdb26dc';

    let workBookReader = new XlsxStreamReader();
    workBookReader.on('error', function (error) {
        throw(error);
    });
    workBookReader.on('sharedStrings', function () {
        // do not need to do anything with these,
        // cached and used when processing worksheets
        console.log(workBookReader.workBookSharedStrings);
    });

    workBookReader.on('styles', function () {
        // do not need to do anything with these
        // but not currently handled in any other way
        console.log(workBookReader.workBookStyles);
    });

    workBookReader.on('worksheet', function (readedObject) {
        if (readedObject.id > 1){
            // we only want first sheet
            readedObject.skip();
            return;
        }
        let runner = readedObject.on('row', async function (row) {
            //console.log("row:", row);
            if (row.attributes.r == 1) {
                // do something with row 1 like save as column names
            } else {
                let extract = {
                    id: JSON.parse(row.values[1]),
                    text: row.values[2],
                    field: row.values[4],
                    source: row.values[3],
                    correctAnswer: row.values[5]
                };
                console.log(extract);
                if(!extract.id) {
                    return;
                    //throw new Error('No id');
                    //readedObject.remove(runner);
                }

                await DatasetItem.client.update({
                    where: {
                        ExternalId_DatasetId: {
                            ExternalId: extract.id,
                            DatasetId: datasetId
                        },
                    },
                    data: {
                        CorrectGoldenAnswerIndex: parseInt(extract.correctAnswer),
                        IsGoldenData: true,
                    }
                });
            }
        });
        readedObject.on('end', function () {
            console.log(readedObject.rowCount);
        });

        // call process after registering handlers
        readedObject.process();
    });
    workBookReader.on('end', function () {
        // end of workbook reached
    });

    stream.pipe(workBookReader);

    return res.send({success: true});
};

export default scriptsController;
