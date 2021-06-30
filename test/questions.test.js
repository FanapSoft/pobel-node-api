//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
import chai from 'chai';
import chaiHttp  from 'chai-http';
import server from '../src/app.js';
// import { expect } from "chai";

let should = chai.should();
chai.use(chaiHttp);

describe('Questions', () => {
    it('GetQuestions', (done) => {
        chai.request(server)
            .get('/api/Questions/GetQuestions?DatasetId=10B16B1A-5945-422F-C83B-08D8695976C6')
            .set('token', 'test')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');

                done();
            });
    });
});
