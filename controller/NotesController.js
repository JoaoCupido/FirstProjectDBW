const Note = require('../model/Note');

function addNote(req,callback){
    Note.insertNote(req.body.username,req.body.password,req.body.avatar,callback);
}

function getAllNotes(callback, username, password, avatar){
    Note.getAllNotes(callback, username, password, avatar);
}
module.exports = {
    addNote,
    getAllNotes
};