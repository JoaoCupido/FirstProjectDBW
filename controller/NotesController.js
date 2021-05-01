const Note = require('../model/Note');

function addNote(req,callback){
    Note.insertNote(req.body.username,req.body.password,req.body.avatar,callback);
}

module.exports = {
    addNote,
};