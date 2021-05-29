const Note = require('../model/Note');

function addNote(req,callback){
    Note.insertNote(req.body.username,req.body.password,req.body.avatar,callback);
}

function addGroup(user, namegroup, callback){
    Note.insertGroup(user, namegroup, callback);
}

//unused
function leaveGroup(user, room, callback){
    Note.removeGroup(user, room,callback);
}

function insertMessage(mes,room,id,callback){
    Note.addMessage(mes,room,id,callback);
}

function sendInvite(receiver, roomname, callback){
    Note.addInvite(receiver, roomname, callback);
}

function denyInvite(receiver, roomname, callback){
    Note.removeInvite(receiver, roomname, callback);
}

function acceInvite(receiver, roomname, callback){
    Note.acceptInvite(receiver, roomname, callback);
}

function getUsers(roomname,callback){
    //console.log(Note.receiveUsers(roomname));
    return Note.receiveUsers(roomname, callback);
}

function changeName(newname, oldname){
    Note.nameChanger(newname, oldname);
}

function addComment(room, mensid, comentario, comentid){
    Note.insertComment(room, mensid, comentario, comentid);
}

module.exports = {
    addNote,
    addGroup,
    leaveGroup,
    insertMessage,
    sendInvite,
    denyInvite,
    acceInvite,
    getUsers,
    changeName,
    addComment,
};