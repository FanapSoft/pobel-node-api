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
                TargetDefinitionId: '244cc335-521c-465b-b18c-ffa414b7caf6',
                OwnerId: 'b1d179a0-9c49-48c1-a674-6aaf0803e86a'
            })
            .end((err, res) => {
                if(err)
                    console.log('err: ',err);

                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
    });
});
