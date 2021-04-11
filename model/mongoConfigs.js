const mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var db;

module.exports = {
    connect: function (callback) {
        //Insert the connection string which was shared with you in moodle
        MongoClient.connect('mongodb+srv://G14:1qL9mfRg4XMZBo6g@clusterdbw.1dbjr.mongodb.net/G14?authSource=admin&replicaSet=atlas-bek8xj-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true', { useNewUrlParser: true, useUnifiedTopology: true },function (err, database) {
            console.log('Connected the database on port 27017');
            //Insert DB name as the group id - G14
            db = database.db('G14');
            callback(err);
        })},
    getDB:function(){
        return db;
    }

}