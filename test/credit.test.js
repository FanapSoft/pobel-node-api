//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
import chai from 'chai';
import chaiHttp  from 'chai-http';
import server from '../app.js';
// import { expect } from "chai";

let should = chai.should();
chai.use(chaiHttp);

describe('Credit', () => {

});
