//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
import chai from 'chai';
import chaiHttp  from 'chai-http';
import server from '../src/app.js';
// import { expect } from "chai";

let should = chai.should();
chai.use(chaiHttp);

describe('Datasets', () => {
    it('GetAll / Get/:id', (done) => {
        chai.request(server)
            .get('/api/Datasets/GetAll')
            .set('token', 'test')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                //res.body.length.should.be.eql(0);
                if(res.body.items.length > 0) {
                    chai.request(server)
                        .get('/api/Datasets/Get/' + res.body.items[0].Id)
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
            .post('/api/Datasets/Create')
            // .type('form')
            .set('token', 'test')
            .set('content-type', "application/x-www-form-urlencoded")//application/x-www-form-urlencoded
            .send({
                Name: 'Test Dataset',
                Description: 'Test Dataset',
                Type: 1,
                AnswerType: 1,
                IsActive: true,
                LabelingStatus: 1,
                AnswerReplicationCount: 0,
                AnswerBudgetCountPerUser:1
            })
            .end((err, res) => {
                if(err) {
                    console.log('err: ',err);
                }

                res.should.have.status(200);
                res.body.should.be.a('object');
                //res.body.length.should.be.eql(0);
                chai.request(server)
                    .put('/api/Datasets/Update/' + res.body.Id)
                    .set('token', 'test')
                    .set('content-type', 'application/x-www-form-urlencoded')
                    .send({
                        Name: 'Test Dataset Test Dataset',
                        Description: 'Test Dataset',
                        Type: 1,
                        AnswerType: 1,
                        IsActive: true,
                        LabelingStatus: 2,
                        AnswerReplicationCount: 0,
                        AnswerBudgetCountPerUser:1
                    })
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        chai.request(server)
                            .delete('/api/Datasets/Delete/' + res.body.Id)
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
