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

//delete user from group
function removeGroup(participant, roomname, callback){
    var db = mongoConfigs.getDB();
    db.collection('G14').findOneAndUpdate({username: participant},{$pull: {groups: roomname}},function(err,result){
        callback(err,result);
    });

    db.collection('chats').findOneAndUpdate({roomname: roomname},{$pull: {users: participant}},function(err,result){
        callback(err,result);
    });
}

//send message
function addMessage(mes, roomname, id, callback){
    var db = mongoConfigs.getDB();
    db.collection('chats').findOneAndUpdate({roomname: roomname},{$push: {messages: {_id: id, text: mes, replies: []}}},function(err, result){
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
    db.collection("G14").findOneAndUpdate({username: receiver}, {$pull: {invites: room}},function(err, result){
        callback(err, result);
    })
    db.collection("G14").findOneAndUpdate({username: receiver}, {$push: {groups: room}}, function(err, result){
        callback(err, result);
    });
    db.collection("chats").findOneAndUpdate({roomname: room},{$push: {users: receiver}},function(err, result){
        callback(err,result);
    })
}

//give list of available users in certain roomchat
function receiveUsers(room, callback){
    var db = mongoConfigs.getDB();

    var resultado;

    // array de pessoas no roomchat
    db.collection("chats").find({roomname: room},{ projection: { _id: 0, users: 1 } }).toArray(function(err, result) {
        if (err) throw err;
        //console.log(result[0].users);
        //array de pessoas no G14 (todos os users que ainda não tenham o convite)
        db.collection("G14").find({invites: {$nin: [room]}},{ projection: { _id: 0, username: 1 } }).toArray(function(er, res) {
            if (er) throw er;
            var allUsers = [];
            var i = 0;
            //contar numero de pessoas no G14 (todos os users)
            db.collection("G14").countDocuments({invites: {$nin: [room]}},{},function(errr, count){
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

//change room name if possible
function nameChanger(newname, oldname){
    var db = mongoConfigs.getDB();

    db.collection("chats").find({name:{$in:[newname]}},{ projection: { _id: 0, roomname: 1 } }).toArray(function(err, result) {
        if (err) throw err;
        if(result.length === 0){
            //change name of the room on mongodb
            db.collection("chats").findOneAndUpdate({roomname: oldname},{$push: {name: newname }});
            db.collection("chats").findOneAndUpdate({roomname: oldname},{$set: {roomname: newname}});
            //change string of groups in g14
            db.collection("G14").updateMany({groups: {$in: [oldname]}},{$push: {groups: newname}});
            db.collection("G14").updateMany({groups: {$in: [oldname]}},{$pull: {groups: oldname}});
            //change string of invites with oldname
            db.collection("G14").updateMany({invites: {$in: [oldname]}},{$push: {invites: newname}});
            db.collection("G14").updateMany({invites: {$in: [oldname]}},{$pull: {invites: oldname}});
        }
    });
}

function insertComment(room, mensid, comentario, comentarioid){
    var db = mongoConfigs.getDB();

    db.collection("chats").find({roomname: room},{ projection: { _id: 0, messages: 1 } }).toArray(function(err,result){
        if(err) throw err;
        var arrayindices = findElement(result[0].messages, room, mensid,comentario,comentarioid,[]);
        var stringfield = 'messages';
        for(var i = 0; i < arrayindices.length; i++){
            if(i+1 === arrayindices.length){
                stringfield += '.'+arrayindices[i];
                stringfield += '.replies';
                db.collection("chats").findOneAndUpdate({roomname: room}, {$push: {[stringfield]: {_id: comentarioid, text: comentario, replies: []}}});
            }
            else{
                stringfield += '.'+arrayindices[i];
                stringfield += '.replies';
            }
        }
    })
}

function findElement(array, room, mensid,comentario,comentarioid,arrayindices){
    for(var i = 0; i < array.length; i++){
        var textobj = array[i];
        if(textobj._id == mensid){
            arrayindices.push(i);
            break;
        }
        else if(textobj._id != mensid && textobj.replies.length > 0){
            arrayindices.push(i);
            findElement(textobj.replies,room,mensid,comentario,comentarioid,arrayindices);
        }
    }
    return arrayindices;
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
    nameChanger,
    insertComment,
};