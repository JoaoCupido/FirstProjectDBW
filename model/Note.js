var mongoConfigs = require('./mongoConfigs');

function insertNote(un,pw,ava,callback){
    var db = mongoConfigs.getDB();
    db.collection('notes').insertOne({username:un,password:pw,avatar:ava},function(err,result){
        callback(err,result);
    });
}

function getAllNotes(callback, username, password, avatar){
    var db = mongoConfigs.getDB();

    var filters = { };

    if(username !== undefined) filters.username = username;
    if(password !== undefined) filters.password = password;
    if(avatar !== undefined) filters.avatar = avatar;

    db.collection('notes').find(filters).toArray(function(err,result){
        callback(result);
    });
}
module.exports = {
    insertNote,
    getAllNotes
};