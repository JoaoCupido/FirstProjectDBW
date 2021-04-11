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

//user route with route parameters
app.get('/user/:un/:pw/:av',function(req,res){
    res.send("<h3>"+req.params.un+" "+req.params.pw+" "+req.params.av+"</h3>");

});

//user route with potential query string parameters
app.get('/user',function (req, res){
    //Use the 'url' dependency to parse the querystring
    var queryObject = url.parse(req.url,true).query;

    //if (ternary operator) the query Object is undefined or an empty object ("{}" without any key, value pairings) print a string, else stringify the query Object
    res.send('User route' +
        ((queryObject === undefined || Object.keys(queryObject).length === 0) ? ' without a query string.' : JSON.stringify(queryObject)));
});

app.post('/signup/', function(req,res){
    console.log(req.body.username);
    console.log(req.body.password);
    console.log(req.body.avatar);

    res.redirect('/user/'+req.body.username+'/'+req.body.password+'/'+req.body.avatar);
});

app.use(express.static(__dirname+'/view/'));
// FONTE: https://stackoverflow.com/a/56505942