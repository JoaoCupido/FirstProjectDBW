var express = require('express');
var bodyParser = require('body-parser');
var mongoConfigs = require('./model/mongoConfigs');
var NotesController = require('./controller/NotesController');
var url = require('url');

var urlencodedParser = bodyParser.urlencoded({extended:false});
var app = express();

app.use(urlencodedParser);

//var socketIO = require("socket.io")(mongoConfigs.getDB());
//var socketID = "";
//var app  = require('express')();
var http = require('http').createServer(app); //https://www.scaleway.com/en/docs/how-to-install-and-configure-socket-io/
var io   = require('socket.io')(http);
var users = {};

app.use(express.static(__dirname+ "/view"));
// FONTE: https://stackoverflow.com/a/56505942
// https://stackoverflow.com/questions/48248832/stylesheet-not-loaded-because-of-mime-type

io.on('connection',function(socket){
    socket.on("join", function(name){
        console.log(name+" joined server");
        users[socket.id] = name;
        io.emit("update", name + " has joined the server.");
    });


    socket.on('chat message',function(msg){
        console.log('message: '+msg);
        var mensagem = {msg:msg, id:users[socket.id]};
        io.emit('chat message', mensagem);
    })
});

mongoConfigs.connect(function(err){
    if(!err){
        app.listen(3000,function(){
            console.log("Express web server listening on port 3000");
        });
    }
});

app.get('/', function (req, res) {
    res.sendFile( __dirname + "/view/" + "home.html" );
})

app.get('/signin/', function (req, res) {
    res.sendFile( __dirname + "/view/" + "signin.html" );
})

app.post('/signin/', function (req, res) {
    // ERROR: db not found
    mongoConfigs.getDB().collection("G14").findOne({
        "username": req.body.username
    }, function(error, uname){
        if (uname == null){
            res.json({
                "status": "error",
                "message": "Account does not exist!"
            });
        }
        else{
            if(req.body.password === uname.password){
                //res.redirect( '/' );
                console.log("ur in");
                res.sendFile( __dirname + "/view/" + "profile.html" );
            }
            else {
                res.json({
                    "status": "error",
                    "message": "Incorrect password!"
                });
            }
        }
    })
})

app.get('/signup/', function (req, res) {
    res.sendFile( __dirname + "/view/" + "signup.html" );
})

app.post('/signup/', function(req,res){
    console.log(req.body.username);
    console.log(req.body.password);
    console.log(req.body.avatar);

    /*
    //We are using the body-parser so req.body.[name in form will be available]
    NotesController.addNote(req, function () {
        //Let's return all activities once a new one is added
        NotesController.getAllNotes(function(result){
            res.redirect( '/' );
        });
    });
    */
    mongoConfigs.getDB().collection("G14").findOne({
        "username": req.body.username
    }, function(error, uname){
        if (uname !== null){
            res.json({
                "status": "error",
                "message": "Username already taken!"
            });
        }
        else{
            NotesController.addNote(req, function(){
                res.json({
                    "status": "success",
                    "message": "Signed up successfully!",
                    //"data": req
                });
            })
        }
    })

});