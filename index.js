/**
 * Created by bbarnett on 8/23/2016.
 */
var express = require('express'),
    app = express();

app.use('/',express.static(__dirname));
app.use('/bootstrap',express.static(__dirname+'/node_modules/bootstrap'));
app.use('/d3',express.static(__dirname+'/node_modules/d3'));
app.use('/d3-queue',express.static(__dirname+'/node_modules/d3-queue/build'));
app.use('/jquery',express.static(__dirname+'/node_modules/jquery/dist'));
app.use('/leaflet',express.static(__dirname+'/node_modules/leaflet/dist'));
app.use('/turf',express.static(__dirname+'/node_modules/turf'));

app.listen(8080);
console.log('App listening on port 8080');