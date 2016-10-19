/**
 * Created by Alicia on 10/5/16.
 */

var fs = require("fs");
console.log("\n *START* \n");
var _results;

function loadData(callback,callback2) {
    var dataset = JSON.parse(fs.readFileSync('data/data2.json', 'utf8'));
    console.log(dataset.features.length);
    callback(dataset,callback2);
}

function dedup(dataset,callback2) {

    function hash(o) {
        return o.id;
    }

    var hashesFound = {};

    dataset.features.forEach(function (o) {
        hashesFound[hash(o)] = o;
    })

    var results = Object.keys(hashesFound).map(function (k) {
        return hashesFound[k];
    })
    var _results = results;
    console.log(results.length);
    fs.writeFile("data/reduced_data.json", JSON.stringify(results));
    stripFields(results);
}
function stripFields(_results) {
    console.log("results");
    var geojson = {
        "type": "FeatureCollection",
        "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},

        "features": []
    };
    _results.forEach(function (d) {
            result = {
                "type": "Feature",
                "properties": {
                    "rating": d.rating,
                    "review_count": d.review_count,
                    "name": d.name,
                    "price": function (d) {
                        if (d.price == "$") {
                            return 1;
                        }
                        else if (d.price == "$$") {
                            return 2;
                        }
                        else if (d.price == "$$$") {
                            return 3;
                        }
                        else if (d.price == "$$$$") {
                            return 4;
                        }
                    }  ,
                    "location": d.location,
                    "metacategory": d.metacategory,
                    "id": d.id
                },
                "geometry": {"type": "Point", "coordinates": [d.coordinates.longitude,d.coordinates.latitude]}
            }
            geojson.features.push(result);
        }
    )
    fs.writeFile("data/stripped_data2.geojson", JSON.stringify(geojson));

};


loadData(dedup);









