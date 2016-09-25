/**
 * Created by bbarnett on 8/23/2016.
 */
console.log(d3);

var width = window.innerWidth;
var height = 500;

var map = L.map('map')
    .setView([42.345706, -71.045908], 14);

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var _polygon,
    _points,
    _pointsInside;

map._initPathRoot();

var svg = d3.select(map.getPanes().overlayPane).append("svg").attr("width", width).attr("height", height),
    g = svg.append("g").attr("class", "leaflet-zoom-hide");


queue()
    .defer(d3.json, "data/yelp-locations.geojson")
    .defer(d3.json, "data/five-min.geojson")
    .defer(d3.json, "data/ten-min.geojson")
    .await(runViz);

var _prepareData = function () {
    prepData1(function (points) {
        prepData2(function (tenMin) {
            setFeatures(points, tenMin);
            drawData(_points, _polygon, "first");
            // comparePoints(_points,_polygon);
        });
    });
};

var prepData1 = function (callback) {
    d3.json("data/yelp-locations.geojson", function (error, collection) {
        if (error) throw error;
        var features = collection.features;
        features.forEach(function (d) {
            d.LatLng = new L.LatLng(d.geometry.coordinates[1],
                d.geometry.coordinates[0])
        })
        console.log(features);


        // var feature = g.selectAll("circle")
        //     .data(features)
        //     .enter()
        //     .append("circle")
        //     .attr("class", "unselected")
        //     .attr("r", 5);
        //
        // map.on("viewreset", update);
        // update();
        //
        // function update() {
        //     feature.attr("transform",
        //         function (d) {
        //             return "translate(" +
        //                 map.latLngToLayerPoint(d.LatLng).x + "," +
        //                 map.latLngToLayerPoint(d.LatLng).y + ")";
        //         }
        //     )
        // }
        var points = features;
        if (callback) callback(features);

    });


}

var prepData2 = function (callback) {
    d3.json("data/ten-min.geojson", function (error, collection) {
        if (error) throw error;
        var features = collection.features[0];

        var transform = d3.geo.transform({point: projectPoint}),
            path = d3.geo.path().projection(transform);

        var feature = g.selectAll("path")
            .data(collection.features)
            .enter().append("path").attr("class", "ten-min");

        map.on("viewreset", reset);
        reset();

        // Reposition the SVG to cover the features.
        function reset() {
            var bounds = path.bounds(collection),
                topLeft = bounds[0],
                bottomRight = bounds[1];

            svg.attr("width", width).attr("height", height);
            feature.attr("d", path);
        }

        // Use Leaflet to implement a D3 geometric transformation.
        function projectPoint(x, y) {
            var point = map.latLngToLayerPoint(new L.LatLng(y, x));
            this.stream.point(point.x, point.y);
        }

        var polygon = features;
        if (callback) callback(features);

    });
};

var prepData3 = function (callback) {
    d3.json("data/five-min.geojson", function (error, collection) {
        if (error) throw error;
        var features = collection.features[0];

        var transform = d3.geo.transform({point: projectPoint}),
            path = d3.geo.path().projection(transform);

        var feature = g.selectAll("path")
            .data(collection.features)
            .enter().append("path").attr("class", "ten-min");

        map.on("viewreset", reset);
        reset();

        // Reposition the SVG to cover the features.
        function reset() {
            var bounds = path.bounds(collection),
                topLeft = bounds[0],
                bottomRight = bounds[1];

            svg.attr("width", width).attr("height", height);
            feature.attr("d", path);
        }

        // Use Leaflet to implement a D3 geometric transformation.
        function projectPoint(x, y) {
            var point = map.latLngToLayerPoint(new L.LatLng(y, x));
            this.stream.point(point.x, point.y);
        }

        var polygon = features;
        if (callback) callback(features);

    });
};

function drawData(_points, _polygons, arg) {

    var feature = g.selectAll("circle")
        .data(_points);

    feature.enter()
        .append("circle")
        // .attr("class", function(d,i){
        //     if (turf.inside(d, _polygon)) {
        //         console.log("inside!");
        //         return "selected";
        //     }
        //     else {
        //         console.log("FALSE");
        //     }
        // })
        .attr("r", 5);

    // compareData();
    map.on("viewreset", update);
    update();

    function update() {
        feature.attr("transform",
            function (d) {
                return "translate(" +
                    map.latLngToLayerPoint(d.LatLng).x + "," +
                    map.latLngToLayerPoint(d.LatLng).y + ")";
            }
        )
    }

    function compareData() {
        feature.attr("class", function (d, i) {
            if (turf.inside(d, _polygon)) {
                console.log("inside!");
                return "selected";
            }
            else {
                console.log("FALSE");
            }
        })
    }

    if (arg !== "first") {
        compareData();
    }
    else {
        console.log("nope");
    }

}


function comparePoints(_points, _polygon) {
    pointsInside = [];
    for (i = 0; i < _points.length; i++) {
        if (turf.inside(_points[i], _polygon)) {

            // d3.selectAll(".unselected").attr("class","selected")
        }
        else {
            // console.log("FALSE");
            // console.log(turf.inside(_points[i], _polygon));
        }

    }
    _pointsInside = pointsInside;
}

_prepareData();


function setFeatures(points, polygon) {
    _points = points;
    _polygon = polygon;
}


$('#button').click(function () {
    drawData(_points, _polygon, "run");

})