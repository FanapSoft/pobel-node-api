//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
import chai from 'chai';
import chaiHttp  from 'chai-http';
import server from '../app.js';
// import { expect } from "chai";

let should = chai.should();
chai.use(chaiHttp);

describe('Answers', () => {
    it('GetAll', (done) => {
        chai.request(server)
            .get('/api/Answers/GetAll')
            .set('token', 'test')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');

                done();
            });
    });

    it('Submit batch answer', (done) => {
        chai.request(server)
            .post('/api/Answers/SubmitBatchAnswer')
            .set('token', 'test')
            .set('content-type', "application/x-www-form-urlencoded")
            .send({
                answers: [
                    {
                        Ignored: true,
                        IgnoreReason: 'No reason',
                        DatasetId: "10B16B1A-5945-422F-C83B-08D8695976C6",
                        DatasetItemId: "7C7A0255-18D5-4811-40A4-08D86959A6E2",
                        AnswerIndex: 0,
                        QuestionObject: {},
                        DurationToAnswerInSeconds: 2
                    },
                    {
                        Ignored: true,
                        IgnoreReason: 'No reason',
                        DatasetId: "10B16B1A-5945-422F-C83B-08D8695976C6",
                        DatasetItemId: "7C7A0255-18D5-4811-40A4-08D86959A6E2",
                        AnswerIndex: 0,
                        QuestionObject: {},
                        DurationToAnswerInSeconds: 4
                    },
                    {
                        Ignored: true,
                        IgnoreReason: 'No reason',
                        DatasetId: "10B16B1A-5945-422F-C83B-08D8695976C6",
                        DatasetItemId: "7C7A0255-18D5-4811-40A4-08D86959A6E2",
                        AnswerIndex: 0,
                        QuestionObject: {},
                        DurationToAnswerInSeconds: 6
                    },
                ]
            })
            .end((err, res) => {
                if(err)
                    console.log(err);

                res.should.have.status(200);
                res.body.should.be.a('array');
                done();
            });
    });
    it('Stats', (done) => {
        chai.request(server)
            .get('/api/Answers/Stats')
            .set('token', 'test')
            .end((err, res) => {
                if(err)
                    console.log(err);

                res.should.have.status(200);
                res.body.should.be.an('object');
                let totalCount = res.body.totalCount;

                chai.request(server)
                    .get('/api/Answers/Stats?UserId=b1d179a0-9c49-48c1-a674-6aaf0803e86a&DatasetId=10B16B1A-5945-422F-C83B-08D8695976C6')
                    .set('token', 'test')
                    .end((err, res) => {
                        console.log("Total results: ", totalCount, "Limited to user and dataset: ", res.body.totalCount)
                        done();
                    });



            });
    });
});
