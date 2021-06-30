//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
import chai from 'chai';
import chaiHttp  from 'chai-http';
import server from '../src/app.js';

let should = chai.should();
chai.use(chaiHttp);

describe('Users', () => {
    it('GetAll / Get/:id', (done) => {
        chai.request(server)
            .get('/api/User/GetAll')
            .set('token', 'test')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                //res.body.length.should.be.eql(0);
                if(res.body.items.length > 0) {
                    chai.request(server)
                        .get('/api/User/Get/' + res.body.items[0].Id)
                        .set('token', 'test')
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('object');

                            done();
                        });
                }
            });
    });


});
