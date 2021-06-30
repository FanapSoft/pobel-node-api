//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
import chai from 'chai';
import chaiHttp  from 'chai-http';
import server from '../src/app.js';
// let should = chai.should();
chai.use(chaiHttp);

describe('TargetDefinitions', () => {
    it('GetAll / Get/:id', (done) => {
        chai.request(server)
            .get('/api/TargetDefinitions/GetAll')
            .set('token', 'test')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                //res.body.length.should.be.eql(0);
                res.body.items.should.be.a('array');
                if(res.body.items.length > 0) {
                    chai.request(server)
                        .get('/api/TargetDefinitions/Get/' + res.body.items[0].Id)
                        .set('token', 'test')
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('object');

                            done();
                        });
                }
            });
    });

    it('Create / Update / Delete', (done) => {
        chai.request(server)
            .post('/api/TargetDefinitions/Create')
            // .type('form')
            .set('token', 'test')
            .set('content-type', "application/x-www-form-urlencoded")//application/x-www-form-urlencoded
            .send({
                DatasetId: '10B16B1A-5945-422F-C83B-08D8695976C6',
                Type: 1,
                T: 1,
                UMin: 1.1,
                UMax: 2.1,
                AnswerCount: 0,
                GoldenCount: 0,
                BonusFalsePositive: 1.1,
                BonusTruePositive: 2.2,
                BonusFalseNegative: 1.1,
                BonusTrueNegative: 2.2,

            })
            .end((err, res) => {
                if(err) {
                    console.log('err: ',err);
                }

                res.should.have.status(200);
                res.body.should.be.a('object');
                //res.body.length.should.be.eql(0);
                chai.request(server)
                    .put('/api/TargetDefinitions/Update/' + res.body.Id)
                    .set('token', 'test')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .send({
                        Type: 2,
                    })
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');

                        chai.request(server)
                            .delete('/api/TargetDefinitions/Delete/' + res.body.Id)
                            .set('token', 'test')
                            .set('content-type', 'application/x-www-form-urlencoded')
                            .end((err, res) => {
                                res.should.have.status(200);
                                done();
                            })

                    });
            });
    });
});
