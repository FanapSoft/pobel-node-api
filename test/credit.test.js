process.env.NODE_ENV = 'test';

require("./datasets.test");
require("./targetDefinitions.test");
require("./questions.test");
require("./userTargets.test");

import chai from 'chai';
import chaiHttp  from 'chai-http';
import server from '../src/app.js';
// import { expect } from "chai";

let should = chai.should();
chai.use(chaiHttp);

describe('Credit', () => {
    it('GetCredit', (done) => {
        chai.request(server)
            .get('/api/Credit/GetCredit?DatasetId=10B16B1A-5945-422F-C83B-08D8695976C6&UserId=027d23fb-f1e5-4dc0-8184-7c29dfaffaf4')
            .set('token', 'test')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                //res.body.length.should.be.eql(0);
                done();
                console.log(res.body.credit);
            });
    });

});
