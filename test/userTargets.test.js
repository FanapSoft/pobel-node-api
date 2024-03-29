//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
import chai from 'chai';
import chaiHttp  from 'chai-http';
import server from '../src/app.js';
// let should = chai.should();
chai.use(chaiHttp);

describe('UserTargets', () => {
    it('ActivateTarget', (done) => {
        chai.request(server)
            .post('/api/Targets/ActivateTarget')
            // .type('form')
            .set('token', 'test')
            .set('content-type', "application/x-www-form-urlencoded")
            .send({
                TargetDefinitionId: "244cc335-521c-465b-b18c-ffa414b7caf6",
                //OwnerId: '027d23fb-f1e5-4dc0-8184-7c29dfaffaf4'
            })
            .end((err, res) => {
                if(err)
                    console.log('err: ',err);

                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
    });
        it('GetCurrentTargetStatus', (done) => {
        chai.request(server)
            .get('/api/Targets/GetCurrentTargetStatus?DatasetId=10B16B1A-5945-422F-C83B-08D8695976C6')
            .set('token', 'test')
            .end((err, res) => {
                if(err)
                    console.log('err: ',err);

                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
    });


});
