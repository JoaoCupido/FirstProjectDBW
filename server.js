var express = require('express');
var bodyParser = require('body-parser');
var mongoConfigs = require('./model/mongoConfigs');
var NotesController = require('./controller/NotesController');

var urlencodedParser = bodyParser.urlencoded({extended:false});
var app = express();

app.use(urlencodedParser);
app.set('views engine', 'ejs');

var http = require('http').Server(app);
var io   = require('socket.io')(http);

app.use(express.static(__dirname+ "/views"));
// FONTE: https://stackoverflow.com/a/56505942
// https://stackoverflow.com/questions/48248832/stylesheet-not-loaded-because-of-mime-type

io.on('connection',function(socket){

    socket.on('create', function (uname,namegroup) {
        NotesController.addGroup(uname,namegroup, function(){
            console.log("new room "+ namegroup + " with username: " + uname);
        })
        socket.join(uname);
        io.emit("update", uname + " is online in this server.", namegroup);
    });

    socket.on('join', function (uname,namegroup) {
        console.log("entered room "+ namegroup + " with username: " + uname);
        socket.join(uname);
        io.emit("update", uname + " is online in server " + namegroup + ".", namegroup);
    });

    socket.on("chat message", function(msg,titleroom,username){
        NotesController.insertMessage(msg,titleroom,function(){
            console.log('message: '+msg + " in room: " + titleroom);
        })
        io.emit('chat message', msg, username);
    })

    socket.on('remove invite', function(uname, invname){
        NotesController.denyInvite(uname,invname,function(){
            console.log('denied inv: '+ invname + " in user: " + uname);
        })
        io.emit('remove invite', uname, invname);
    })

    socket.on('accept invite', function(uname, invname){
        NotesController.acceInvite(uname, invname, function(){
            console.log('accepted invite ' + invname + ' of receiver: ' + uname);
        })
        io.emit('accept invite', uname, invname);
    })

    socket.on('isadmin',function(uname, roomname){
        var isAdmin = false;
        mongoConfigs.getDB().collection("chats").findOne({
            "roomname": roomname,
            "admin": uname
        }, function(error, unamee){
            if (unamee !== null){
                console.log("adminprop");
                io.emit('adminprop', uname, roomname);
            }
            else{
                console.log("removeadminprop");
                io.emit('removeadminprop', uname, roomname);
            }
        })
    })

    socket.on('send invite', function(receiver, roomname){
        NotesController.sendInvite(receiver,roomname,function(){
            console.log('sended invite ' + roomname + ' to receiver: ' + receiver);
        })
        io.emit('updateinvites',receiver,roomname);
    })
    /*
    socket.on('isroomnameunique', function(newroomname,oldroomname){
        mongoConfigs.getDB().collection("chats").findOne({
            ""
        }
    })
     */
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
                    var invites = uname.invites;
                    res.render( './profile.ejs', {userlogin: userlog, avatarlogin: image, rooms: userrooms, invites: invites} );
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