var mongoConfigs = require('./mongoConfigs');

function insertNote(un,pw,ava,callback){
    var db = mongoConfigs.getDB();
    var initialGroups = ["Global Chat"];
    db.collection('G14').insertOne({username:un,password:pw,avatar:ava,groups:initialGroups},function(err,result){
        callback(err,result);
    });
}

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

function removeGroup(participant, roomname, callback){
    var db = mongoConfigs.getDB();
    db.collection('G14').findOneAndUpdate({username: participant},{$pull: {groups: roomname}},function(err,result){
        callback(err,result);
    });
    db.collection('chats').findOneAndUpdate({name: roomname},{$pull: {users: participant}},function(err,result){
        callback(err,result);
    });
}

function addMessage(mes, roomname, callback){
    var db = mongoConfigs.getDB();
    db.collection('chats').findOneAndUpdate({name: roomname},{$push: {messages:mes}},function(err, result){
        callback(err,result);
    });
}

module.exports = {
    insertNote,
    insertGroup,
    removeGroup,
    addMessage,
};