//using "mocha -w traderTest.js"

const chai = require('chai'),
chaiHttp = require('chai-http'),
sinon = require('sinon'),
expect = chai.expect, // we are using the "expect" style of Chai
restifyWithBatteries = require('./index.js');
	
chai.use(chaiHttp);

describe('Restify with batteries', function() {
	var server = null;

	beforeEach(function() {
		server = restifyWithBatteries.create();
	});
	
	it('should contains a chain.', async function() {
		let chainable = server.prepare(() => {});
		expect('prepare' in chainable).to.be.true;
		expect('listen' in chainable).to.be.true;
	});
	
	it('should up a server', async function() {
		chai
			.request(server)
			.get('/');
	});
	
	
});