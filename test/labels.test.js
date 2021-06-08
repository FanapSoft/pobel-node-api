//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
import chai from 'chai';
import chaiHttp  from 'chai-http';
import server from '../app.js';
import { expect } from "chai";

let should = chai.should();
chai.use(chaiHttp);

describe('Labels(s)', () => {
    it('GetAll and Get/:id passed', (done) => {
        chai.request(server)
            .get('/api/Labels/GetAll')
            .set('token', 'test')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                //res.body.length.should.be.eql(0);
                if(res.body.length > 0) {
                    chai.request(server)
                        .get('/api/Datasets/Get/' + res.body[0].Id)
                        .set('token', 'test')
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                        });
                }

                done();
            });
    });
});
