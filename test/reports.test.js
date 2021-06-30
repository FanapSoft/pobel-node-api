//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
import chai from 'chai';
import chaiHttp  from 'chai-http';
import server from '../src/app.js';
// import { expect } from "chai";

let should = chai.should();
chai.use(chaiHttp);

describe('Reports', () => {
    it('AnswersCountsTrend', (done) => {
        chai.request(server)
            .get('/api/Reports/AnswersCountsTrend')
            .set('token', 'test')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');

                done();
            });
    });

    it('Scoreboard', (done) => {
        chai.request(server)
            .get('/api/Reports/Scoreboard')
            .set('token', 'test')
            .set('content-type', "application/x-www-form-urlencoded")
            .end((err, res) => {
                if(err)
                    console.log(err);

                res.should.have.status(200);
                res.body.should.be.a('array');
                done();
            });
    });
});
