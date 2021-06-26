//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
import chai from 'chai';
import chaiHttp  from 'chai-http';
import server from '../app.js';
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
                TargetDefinitionId: '81e1e92e-0d8f-4261-8e5f-abdd728def2c',
                OwnerId: '027d23fb-f1e5-4dc0-8184-7c29dfaffaf4'
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
