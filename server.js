var express = require('express');
var app = express();

var server = app.listen(8888,function () {
    var port = server.address().port
    console.log('Server listening '+port);
})

app.get('/',function (req,res) {
    res.send('Hello DBW students');
})