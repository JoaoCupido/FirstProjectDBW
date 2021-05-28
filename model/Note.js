var mongoConfigs = require('./mongoConfigs');

//new account
function insertNote(un,pw,ava,callback){
    var db = mongoConfigs.getDB();
    var initialGroups = ["Global Chat"];
    var invitations = [];
    db.collection('G14').insertOne({username:un,password:pw,avatar:ava,groups:initialGroups,invites:invitations},function(err,result){
        callback(err,result);
    });
    db.collection('chats').findOneAndUpdate({name:"Global Chat"},{$push: {users: un}},function(err,result){
        callback(err,result);
    });
}

//new group
function insertGroup(creator, namegroupe, callback){
    var db = mongoConfigs.getDB();
    var namegroup = [namegroupe];
    var people = [creator];
    var messages = [];
    db.collection('chats').insertOne({name:namegroup,admin:creator,users:people,messages:messages,roomname: namegroupe},function(err,result){
        callback(err,result);
    });
    db.collection('G14').findOneAndUpdate({username: creator},{$push: {groups: namegroupe}},function(err,result){
        callback(err,result);
    });
}

//delete group
function removeGroup(participant, roomname, callback){
    var db = mongoConfigs.getDB();
    db.collection('G14').findOneAndUpdate({username: participant},{$pull: {groups: roomname}},function(err,result){
        callback(err,result);
    });
    //isto nao elimina o grupo inteiro
    db.collection('chats').findOneAndUpdate({roomname: roomname},{$pull: {users: participant}},function(err,result){
        callback(err,result);
    });
}

//send message
function addMessage(mes, roomname, callback){
    var db = mongoConfigs.getDB();
    db.collection('chats').findOneAndUpdate({roomname: roomname},{$push: {messages: {text: mes, replies: []}}},function(err, result){
        callback(err,result);
    });
}

//sending invite
function addInvite(receiver, room, callback){
    var db = mongoConfigs.getDB();
    db.collection("G14").findOneAndUpdate({username: receiver}, {$push: {invites: room}},function(err, result){
        callback(err, result);
    })
}

//negating invite
function removeInvite(receiver, room, callback){
    var db = mongoConfigs.getDB();

    db.collection("G14").update({username: receiver}, {$pull: {invites: room}},function(err, result){
        callback(err, result);
    })
}

//accepting invite
function acceptInvite(receiver, room, callback){
    var db = mongoConfigs.getDB();
    db.collection("G14").update({username: receiver}, {$pull: {invites: room}},function(err, result){
        callback(err, result);
    })
    db.collection("G14").findOneAndUpdate({username: receiver},{$push: {groups: room}}, function(err, result){
        callback(err, result);
    });
    db.collection("chats").findOneAndUpdate({roomname: room},{$push: {users: receiver}},function(err, result){
        callback(err,result);
    })
}

//give list of avaiable users in certain roomchat
function receiveUsers(room, callback){
    var db = mongoConfigs.getDB();

    var resultado;

    // array de pessoas no roomchat
    db.collection("chats").find({roomname: room},{ projection: { _id: 0, users: 1 } }).toArray(function(err, result) {
        if (err) throw err;
        //console.log(result[0].users);
        //array de pessoas no G14 (todos os users)
        db.collection("G14").find({},{ projection: { _id: 0, username: 1 } }).toArray(function(er, res) {
            if (er) throw er;
            var allUsers = [];
            var i = 0;
            //contar numero de pessoas no G14 (todos os users)
            db.collection("G14").countDocuments({},function(errr, count){
                if (errr) throw errr;
                while(i < count){
                    allUsers.push(res[i].username);
                    i++;
                }
                //console.log(allUsers);
                //console.log(allUsers.filter(function(obj) { return (result[0].users).indexOf(obj) == -1; }));
                resultado = allUsers.filter(function(obj) { return (result[0].users).indexOf(obj) == -1; });
                //fonte: https://stackoverflow.com/a/15912608
                //console.log('resultado: ' + resultado);
                return callback(resultado);
            });
        });
    });
}

module.exports = {
    insertNote,
    insertGroup,
    removeGroup,
    addMessage,
    addInvite,
    removeInvite,
    acceptInvite,
    receiveUsers,
};