var express = require('express');
var bodyParser = require('body-parser');
var mongoConfigs = require('./model/mongoConfigs');
var NotesController = require('./controller/NotesController');
var url = require('url');

var urlencodedParser = bodyParser.urlencoded({extended:false});
var app = express();

app.use(urlencodedParser);
app.set('views engine', 'ejs');

var http = require('http').Server(app);
var io   = require('socket.io')(http);

var people = {};

//var rooms= {};

app.use(express.static(__dirname+ "/views"));
// FONTE: https://stackoverflow.com/a/56505942
// https://stackoverflow.com/questions/48248832/stylesheet-not-loaded-because-of-mime-type

io.on('connection',function(socket){

    socket.on('create', function (uname,namegroup) {
        NotesController.addGroup(uname,namegroup, function(){
            console.log("new room "+ namegroup + " with username: " + uname);
        })
        socket.join(uname);
        io.emit("update", uname + " is online in this server.");
    });

    socket.on('join', function (uname,namegroup) {
        console.log("entered room "+ namegroup + " with username: " + uname);
        socket.join(uname);
        io.emit("update", uname + " is online in this server.");
    });

    socket.on("chat message", function(msg,titleroom,username){
        //console.log('message: '+msg);
        NotesController.insertMessage(msg,titleroom,function(){
            console.log('message: '+msg + " in room: " + titleroom);
        })
        io.emit('chat message', msg, username);
    })

});

mongoConfigs.connect(function(err){
    if(!err){
        http.listen(3000,function(){
            console.log("Express web server listening on port 3000");
        });
    }
});

app.get('/', function (req, res) {
    res.sendFile( __dirname + "/views/" + "home.html" );
})

app.get('/signup/', function (req, res) {
    res.sendFile( __dirname + "/views/" + "signup.html" );
})

app.post('/signup/', function(req,res){
    console.log(req.body.username);
    console.log(req.body.password);
    console.log(req.body.avatar);

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
                    "message": "Signed up successfully!"
                });
            })
        }
    })

});

app.get('/signin/', function (req, res) {
    res.sendFile( __dirname + "/views/" + "signin.html" );
})

app.post('/signin/', function (req, res) {
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
                var userlog = req.body.username;
                mongoConfigs.getDB().collection("G14").findOne({
                    "username": userlog
                }, function(error, uname){
                    var image = uname.avatar;
                    var userrooms = uname.groups;
                    res.render( './profile.ejs', {userlogin: userlog, avatarlogin: image, rooms: userrooms} );
                })
                //res.redirect( '/profile/');
                console.log("Login success!");
                //res.sendFile( __dirname + "/views/" + "profile.ejs" );
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



app.get('/logout', function (req, res) {
    res.sendFile( __dirname + "/views/" + "home.html" );
})