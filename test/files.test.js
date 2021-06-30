//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
import chai from 'chai';
import chaiHttp  from 'chai-http';
import server from '../app.js';
// import { expect } from "chai";

let should = chai.should();
chai.use(chaiHttp);

describe('Files', () => {
    it('Get small item', (done) => {
        chai.request(server)
            .get('/api/File/Dataset/Item/8E565259-F5F0-459E-3102-08D86959A6E2')
            .set('token', 'test')
            .end((err, res) => {
                res.should.have.status(200);
                //res.body.should.be.a('object');
                //res.body.length.should.be.eql(0);
                done();
            });
    });
    it('Get original item', (done) => {
        chai.request(server)
            .get('/api/File/Dataset/Item/8E565259-F5F0-459E-3102-08D86959A6E2/original')
            .set('token', 'test')
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
    });


});
