var mongoConfigs = require('./mongoConfigs');

function insertNote(un,pw,ava,callback){
    var db = mongoConfigs.getDB();
    db.collection('G14').insertOne({username:un,password:pw,avatar:ava},function(err,result){
        callback(err,result);
    });
}

module.exports = {
    insertNote,
};