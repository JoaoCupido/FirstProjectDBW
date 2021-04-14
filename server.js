var express = require('express');
var bodyParser = require('body-parser');
var mongoConfigs = require('./model/mongoConfigs');
var NotesController = require('./controller/NotesController');
var url = require('url');

var urlencodedParser = bodyParser.urlencoded({extended:false});
var app = express();

app.use(urlencodedParser);

mongoConfigs.connect(function(err){
    if(!err){
        app.listen(3000,function(){
            console.log("Express web server listening on port 3000");
        });
    }
});

var server = app.listen(8888,function () {
    var port = server.address().port
    console.log('Server listening '+port);
})

app.get('/', function (req, res) {
    res.sendFile( __dirname + "/view/" + "home.html" );
})

app.get('/signin/', function (req, res) {
    res.sendFile( __dirname + "/view/" + "signin.html" );
})

app.get('/signup/', function (req, res) {
    res.sendFile( __dirname + "/view/" + "signup.html" );
})

app.post('/signup/', function(req,res){
    console.log(req.body.username);
    console.log(req.body.password);
    console.log(req.body.avatar);


    //We are using the body-parser so req.body.[name in form will be available]
    NotesController.addNote(req, function () {
        //Let's return all activities once a new one is added
        NotesController.getAllNotes(function(result){
            res.json(result); // alterar isto??
        });
    });

});

app.use(express.static(__dirname+'/view/'));
// FONTE: https://stackoverflow.com/a/56505942