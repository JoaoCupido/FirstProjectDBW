const Note = require('../model/Note');

function addNote(req,callback){
    Note.insertNote(req.body.username,req.body.password,req.body.avatar,callback);
}

function addGroup(user, namegroup, callback){
    Note.insertGroup(user, namegroup, callback);
}

function leaveGroup(req,callback){
    Note.removeGroup(req.body.username, req.body.group,callback);
}

function insertMessage(mes,room,callback){
    Note.addMessage(mes,room,callback);
}

module.exports = {
    addNote,
    addGroup,
    leaveGroup,
    insertMessage,
};