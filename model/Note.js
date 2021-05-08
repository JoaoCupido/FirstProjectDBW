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
    db.collection('chats').insertOne({name:namegroup,admin:creator,users:people,messages:messages},function(err,result){
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
    db.collection('chats').findOneAndUpdate({name: roomname},{$pull: {users: participant}},function(err,result){
        callback(err,result);
    });
}

//send message
function addMessage(mes, roomname, callback){
    var db = mongoConfigs.getDB();
    db.collection('chats').findOneAndUpdate({name: roomname},{$push: {messages:mes}},function(err, result){
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

    //ERROR: does not the intended (remove invite from user) (precisa de teste)
    db.collection("G14").update({username: receiver}, {$pull: {invites: room}},function(err, result){
        callback(err, result);
    })
}

//accepting invite
function acceptInvite(receiver, room, callback){
    var db = mongoConfigs.getDB();
    //ERROR: does not the intended (remove invite from user) (precisa de teste)
    db.collection("G14").update({username: receiver}, {$pull: {invites: room}},function(err, result){
        callback(err, result);
    })
    //funciona
    db.collection("G14").findOneAndUpdate({username: receiver},{$push: {groups: room}}, function(err, result){
        callback(err, result);
    });
    //esta parte funciona
    db.collection("chats").findOneAndUpdate({name: room},{$push: {users: receiver}},function(err, result){
        callback(err,result);
    })
}

module.exports = {
    insertNote,
    insertGroup,
    removeGroup,
    addMessage,
    addInvite,
    removeInvite,
    acceptInvite,
};