/**
 * Created by Alicia on 10/6/16.
 */

var fs = require("fs");
var d3 = require("d3");


var isochrones = JSON.parse(fs.readFileSync('data/composite-isochrones.geojson', 'utf8'));


var nestedData = d3.nest()
    .key(function (d) {
        return d.properties.STATION;
    })
    .sortValues(function (a, b) {
        return a.geometry.minutes - b.geometry.minutes;
    }).entries(isochrones.features);


// writeFile(nestedData);



function reduce(dataset) {
    dataset.forEach(function (d, i) {
        stationName = d.key;
        var station = {
            "type": "FeatureCollection",
            "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
            "features": []
        };
        d.values.forEach(function (e) {
            // console.log(e)
                isochrone = {
                    "type": "Feature",
                    "properties": {
                        "minutes": e.minutes
                    },
                    "geometry": {"type": "MultiPolygon", "coordinates": e.geometry.coordinates}
                }
                station.features.push(isochrone);
            })
        writeFile(stationName, station);
        })

}

function writeFile(name, data) {
    var path = "data/" + name + ".json";
    console.log(path);
    fs.writeFile(path, JSON.stringify(data));
}


reduce(nestedData);
