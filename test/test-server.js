global.DATABASE_URL = 'mongodb://localhost/shopping-list-test';

var chai = require('chai');
var chaiHttp = require('chai-http');

var server = require('../server.js');
var Item = require('../models/item');

var should = chai.should();
var app = server.app;

chai.use(chaiHttp);

describe('Shopping List', function() {
    before(function(done) {
        server.runServer(function() {
            Item.create({name: 'Broad beans'},
                        {name: 'Tomatoes'},
                        {name: 'Peppers'}, function() {
                done();
            });
        });
    });

    after(function(done) {
        Item.remove(function() {
            done();
        });
    });
    
// Successes
    it('should list items on GET', function(done) {
        chai.request(app)
            .get('/items')
            .end(function(err, res) {
                should.equal(err, null);
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                res.body.should.have.length(3);
                res.body[0].should.be.a('object');
                res.body[0].should.have.property('_id');
                res.body[0].should.have.property('name');
                res.body[0].name.should.be.a('string');
                res.body[0].name.should.equal('Broad beans');
                res.body[1].name.should.equal('Tomatoes');
                res.body[2].name.should.equal('Peppers');
                done();
            });
    });

    it('should add an item on POST', function(done) {
        chai.request(app)
            .post('/items')
            .send({'name': 'Kale'})
            .end(function(err, res) {
                should.equal(err, null);
                res.should.have.status(201);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('name');
                res.body.should.have.property('_id');
                res.body.name.should.be.a('string');
                res.body.name.should.equal('Kale');
                done();
            });
    });
    
    it('should edit an item on PUT', function(done) {
        chai.request(app)
            .get('/items')
            .end(function(err, res) {
                chai.request(app)
                .put('/items/' + res.body[0]._id)
                .send({'name': 'Changed'})
                .end(function(err, res){
                    should.equal(err, null);
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    res.body.should.have.property('name');
                    res.body.should.have.property('_id');
                    res.body.name.should.be.a('string');
                    res.body.name.should.equal('Changed');
                    done();
                })
        });
    });
    
    
    it('should delete an item on DELETE', function(done) {
        chai.request(app)
            .get('/items')
            .end(function(err, res) {    
                chai.request(app)
                .delete('/items/' + res.body[2]._id)
                .end(function(err, res) {
                    should.equal(err, null);
                    res.should.have.status(200);
                    res.should.be.json;
                    done();
                })
            });
    });
    
// Failures
    
    it('should FAIL POST without body data', function(done) {
        chai.request(app)
            .post('/items')
            .send({})
            .end(function(err, res) {
                res.should.have.status(500);
                done();
        })
    })
    
    it('should FAIL PUT if you send an empty body without name', function(done) {
        chai.request(app)
            .get('/items')
            .end(function(err, res) {
                chai.request(app)
                .put('/items/' + res.body[0]._id)
                .send({})
                .end(function(err, res){
                    res.should.have.status(500);
                    done();
                })
        });
    })
    
    it('should FAIL PUT to an ID that does not exist', function(done) {
        chai.request(app)
            .put('/items/jkhdsfgghjkdf')
            .send({'name': 'Does Not Exist'})
            .end(function(err, res) {
                res.should.be.json;
                res.should.have.status(500);
                done();
        })
    })
    
    it('should FAIL PUT if you try to edit item without an ID as endpoint', function(done) {
        chai.request(app)
            .put('/items/')
            .send({'name': 'Changed'})
            .end(function(err, res) {
                res.should.be.json;
                res.body.message.should.equal('Not Found');
                res.should.have.status(404);
                done();
        });
    })
    
    it('should FAIL PUT without valid JSON', function(done) {
        chai.request(app)
            .get('/items')
            .end(function(err, res) {
                chai.request(app)
                .put('/items/' + res.body[1]._id)
                .send("This is not valid JSON")
                .end(function(err, res) {
                    res.should.be.json;
                    res.body.message.should.equal("Internal Server Error");
                    res.should.have.status(500);
                    done();
                });
            })
            
    })
    
    it('should FAIL DELETE if you try to delete an ID that does not exist', function(done) {
        chai.request(app)
            .delete('/items/m23doesnotexist345345')
            .end(function(err, res) {      
                res.should.be.json;
                res.body.message.should.equal("Not Found");
                res.should.have.status(404);
                done();
            });
    })
    
    it('should FAIL DELETE if you try to delete without an ID as endpoint', function(done) {
        chai.request(app)
            .delete('/items/')
            .end(function(err, res) {
                res.should.be.json;
                res.body.message.should.equal("Not Found");
                res.should.have.status(404);
                done();
        });
    })
});