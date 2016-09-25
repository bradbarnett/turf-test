/**
 * Created by bbarnett on 8/23/2016.
 */
console.log(d3);

// Create leaflet map
var map = new L.Map("map", {
    center: new L.LatLng(42.345706, -71.045908),
    zoom: 15,
    zoomControl: true,
    opacity: .5,
    attributionControl: false
});

//Add base layer
L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
}).addTo(map);

//Add transit icons
var transitIcon = L.icon({
    iconUrl: 'tstop.png',
    iconSize: [20, 20]
});

//Add global variables
var width = window.innerWidth,
    height = window.innerHeight,
    _polygon,
    _polygonClass,
    _points,
    _pointsInside,
    _totalPlaces,
    _totalReviews,
    _totalGrocery,
    _totalBars,
    _totalRestaurants,
    _totalCivic,
    _totalActive,
    _totalShopping,
    _totalProfessionalServices;

//Initiate map and svg merge
map._initPathRoot();

//Load data, then call runViz
d3_queue.queue()
    .defer(d3.json, "data/isochrones.geojson")
    .defer(d3.json, "data/yelp-locations.geojson")
    .await(runViz);

//Set up map svg and annotation svg
var svg = d3.select(map.getPanes().overlayPane).select("svg"),
    g = svg.append("g").attr("class", "leaflet-zoom-hide");
var placeInfoSvg = d3.select("#places-info").append("svg").attr("width", 300).attr("height", 50).classed("places-info-svg", true);
var nameText = placeInfoSvg.append("text");
var reviewsText = placeInfoSvg.append("text");

//Create circles on map
function runViz(error, isochrones, points) {
    if (error) throw error;
    drawIsochrones();
    var pointData = points.features;

    pointData.forEach(function (d) {
        d.LatLng = new L.LatLng(d.geometry.coordinates[1],
            d.geometry.coordinates[0])
    })

    pointData.sort(function (a, b) {
        return b.Reviews - a.Reviews;
    });
    var circles = g.selectAll("circle")
        .data(pointData)
        .enter()
        .append("circle")
        .attr("class", "unselected")
        .attr("r", 5);
    pointsUpdate();
    map.on("viewreset", pointsUpdate);

    function pointsUpdate() {
        var max = d3.max(pointData, function (d) {
            return +d.properties.Reviews;
        });
        var min = d3.min(pointData, function (d) {
            return +d.properties.Reviews;
        });
        var oScale = d3.scale.linear()
            .domain([min, max])
            .range([0.8, 0.2]);
        circles.attr("cx", function (d) {
            return map.latLngToLayerPoint(d.LatLng).x
        });
        circles.attr("cy", function (d) {
            return map.latLngToLayerPoint(d.LatLng).y
        });
        circles.attr("r", function (d) {
            if (d.properties.Reviews > 10) {
                return Math.sqrt(parseInt(d.properties.Reviews) * 0.15);
            }
            else if (d.properties.Reviews > 50) {
                return Math.sqrt(parseInt(d.properties.Reviews) * .05);
            }
            else {
                return 5;
            }
        });
        circles.attr("callit", function (d) {
            return d.Name
        });
        circles.attr("id",0);
        //
        circles.style("fill", function (d) {
            if (d.properties.Category == "restaurants") {
                return "rgba(210, 84, 249," + (Math.sqrt(oScale(d.properties.Reviews) * 0.4)) + ")";
            }
            else if (d.properties.Category == "grocery") {
                return "rgba(252,255,0," + (Math.sqrt(oScale(d.properties.Reviews) * 0.4)) + ")";
            }
            else if (d.properties.Category == "active") {
                return "rgba(255, 160, 19," + (Math.sqrt(oScale(d.properties.Reviews) * 0.4)) + ")";
            }
            else if (d.properties.Category == "localservices,shopping") {
                return "rgba(255, 71, 25," + (Math.sqrt(oScale(d.properties.Reviews) * 0.4)) + ")";
            }
            else if (d.properties.Category == "nightlife") {
                return "rgba(0, 204, 102," + (Math.sqrt(oScale(d.properties.Reviews) * 0.4)) + ")";
            }
            else if (d.properties.Category == "financialservices,professional") {
                return "rgba(153, 153, 102," + (Math.sqrt(oScale(d.properties.Reviews) * 0.4)) + ")";
            }
            else if (d.properties.Category == "health") {
                return "rgba(153, 153, 102," + (Math.sqrt(oScale(d.properties.Reviews) * 0.4)) + ")";
            }
            else if (d.properties.Category == "civic") {
                return "rgba(0, 138, 230," + (Math.sqrt(oScale(d.properties.Reviews) * 0.4)) + ")";
            }
            else {
                return "rgba(0,0,0,0)";
            }
        })
        circles.style("stroke-width", 1);
        circles.style("stroke", function (d) {
            if (d.properties.Category == "restaurants") {
                return "rgba(210, 84, 249," + (Math.sqrt(oScale(d.properties.Reviews) * 0.4)) + ")";
            }
            else if (d.properties.Category == "grocery") {
                return "rgba(252,255,0," + (Math.sqrt(oScale(d.properties.Reviews) * 0.4)) + ")";
            }
            else if (d.properties.Category == "active") {
                return "rgba(255, 160, 19," + (Math.sqrt(oScale(d.properties.Reviews) * 0.4)) + ")";
            }
            else if (d.properties.Category == "localservices,shopping") {
                return "rgba(255, 71, 25," + (Math.sqrt(oScale(d.properties.Reviews) * 0.4)) + ")";
            }
            else if (d.properties.Category == "nightlife") {
                return "rgba(0, 204, 102," + (Math.sqrt(oScale(d.properties.Reviews) * 0.4)) + ")";
            }
            else if (d.properties.Category == "financialservices,professional") {
                return "rgba(153, 153, 102," + (Math.sqrt(oScale(d.properties.Reviews) * 0.4)) + ")";
            }
            else if (d.properties.Category == "health") {
                return "rgba(153, 153, 102," + (Math.sqrt(oScale(d.properties.Reviews) * 0.4)) + ")";
            }
            else if (d.properties.Category == "civic") {
                return "rgba(0, 138, 230," + (Math.sqrt(oScale(d.properties.Reviews) * 0.4)) + ")";
            }
            else {
                return "rgba(0,0,0,0)";
            }
        })
    }

    circles.on("mouseover", function (d) {


        $("#places-info").clearQueue();
        $("#places-info").stop();

        $("#places-info").animate({
            opacity: 1
        }, 500)
        var circle = d3.select(this);
        circle.transition()
            .duration(1000)
            .ease("elastic")
            .style("cursor", "pointer")
            .attr("r", function (d) {
                if (d.properties.Reviews > 10) {
                    return Math.sqrt(parseInt(d.properties.Reviews) * 2);
                }
                else if (d.properties.Reviews > 50) {
                    return Math.sqrt(parseInt(d.properties.Reviews) * .5);
                }
                else {
                    return 10;
                }

            });
        var data = circle.datum();
        nameText.text(data.properties.Name)
            .attr("class", "nameshow")
            .attr("x", 150)
            .attr("y", 25)
            .style("font-size", "120%");


        reviewsText
            .text(data.properties.Address)
            .attr("class", "nameshow")
            .attr("x", 150)
            .attr("y", 40)
            .style("font-size", "80%");


        var bbox = nameText[0][0].getBBox();
        placeInfoSvg.attr("width", function () {
            if (bbox.width < 300) {
                return 300;
            }
            else {
                nameText.attr("transform", "translate(" + ((bbox.width / 2) - 150) + ",0)");
                reviewsText.attr("transform", "translate(" + ((bbox.width / 2) - 150) + ",0)");
                return (bbox.width);
            }
        });


    });
    circles.on("mouseout", function () {

        $("#places-info").animate({
            opacity: 0
        }, 250)
        //Remove the tooltip
        nameText
            .attr("class", "tooltiphide");
        reviewsText
            .attr("class", "tooltiphide");
        d3.select(this)
            .transition()
            .duration(500)
            .attr("r", function (d) {
                if (d.properties.Reviews > 10) {
                    return Math.sqrt(parseInt(d.properties.Reviews) * 0.15);
                }
                else if (d.properties.Reviews > 50) {
                    return Math.sqrt(parseInt(d.properties.Reviews) * .05);
                }
                else {
                    return 5;
                }
            })
    });

    var _points = pointData;

    function compareData() {
        // circles
        //     .each(function(d) {
        //     var circle = d3.select(this);
        //     if (turf.inside(d, _polygon.features[0])) {
        //     circle
        //         .attr("class", function (d, i) {
        //                 calculateTotals(d);
        //                 return "selected";
        //             });
        //     circle.transition()
        //             .duration(1000)
        //             .ease("elastic")
        //         .style("fill","black");
        //     }
        //     else {
        //         circle.classed("selected",false);
        //         circle.style("fill", function(d) {
        //             var max = d3.max(pointData, function(d) { return +d.properties.Reviews;});
        //             var min = d3.min(pointData, function(d) { return +d.properties.Reviews;});
        //             var oScale = d3.scale.linear()
        //                 .domain([min, max])
        //                 .range([0.8,0.2]);
        //             if (d.properties.Category == "restaurants") { return "rgba(210, 84, 249," + (Math.sqrt(oScale(d.properties.Reviews) * 0.4)) + ")";}
        //             else if (d.properties.Category == "grocery") { return "rgba(252,255,0," + (Math.sqrt(oScale(d.properties.Reviews) * 0.4)) + ")";}
        //             else if (d.properties.Category == "active") { return "rgba(255, 160, 19," + (Math.sqrt(oScale(d.properties.Reviews) * 0.4)) + ")";}
        //             else if (d.properties.Category == "localservices,shopping") { return "rgba(255, 71, 25," + (Math.sqrt(oScale(d.properties.Reviews) * 0.4)) + ")";}
        //             else if (d.properties.Category == "nightlife") { return "rgba(0, 204, 102," + (Math.sqrt(oScale(d.properties.Reviews) * 0.4)) + ")";}
        //             else if (d.properties.Category == "financialservices,professional") { return "rgba(153, 153, 102," + (Math.sqrt(oScale(d.properties.Reviews) * 0.4)) + ")";}
        //             else if (d.properties.Category == "health") { return "rgba(153, 153, 102," + (Math.sqrt(oScale(d.properties.Reviews) * 0.4)) + ")";}
        //             else if (d.properties.Category == "civic") { return "rgba(0, 138, 230," + (Math.sqrt(oScale(d.properties.Reviews) * 0.4)) + ")";}
        //             else {return "rgba(0,0,0,0)";}
        //         })
        //     }
        //
        // })



        function testCircles(callback) {
            circles.attr("class", function (d, i) {
                // console.log("test");
                if (turf.inside(d, _polygon)) {
                    // circles.attr("fill", "black");
                    calculateTotals(d);
                    var currentId = parseInt(d3.select(this).attr("id"));
                    d3.select(this).attr("id", function() {
                        return currentId + 1;
                    });
                    return "selected";
                }
                else {
                    d3.select(this).attr("id", 0);
                }
            }), callback();

        }

        testCircles(function callback() {
            d3.selectAll("circle.selected").each(slide);
            // console.log('callback');
        });
        // var selected = d3.selectAll(".selected").transition().attr("fill","black");
        // console.log(selected);
        updateBars();



        function slide() {
            var onePath = d3.select(this);
            var counter = parseInt(onePath.attr("id"));
            // console.log(parseInt(onePath.attr("id")));
            // console.log(onePath);
            if (counter == 1) {
            onePath.style("stroke-opacity", 1)
                    .transition()
                    .duration(500)
                .delay(function(d,i) {
                    return i * 5.25;
                })
                    .attr("stroke","white")
                    .style("stroke-width",7)
                    .style("stroke-opacity",0)
                ;
            }
            else {
                return;
            }
            // function repeat() {
            //     onePath = onePath
            //         .transition()
            //         .duration(850)
            //         .attr("stroke","black")
            //         .style("stroke-width",20)
            //         .style("stroke-opacity",0)
            //     ;
            //     // .each("end", repeat);
            // })();
        }


    }

    $(document).on('input', '#isochrone-slider', function () {
        var distance = $(this).val();
        $(".distance").html(function () {
            return (distance > 9) ? distance + " min" : ' ' + distance + " min"
        });

        _polygonClass = ".min-" + distance;
        _polygon = isochrones.features.filter(function (obj) {
            return obj.properties.time == "min-" + distance;
        });
        _polygonCollection = {
            type: "FeatureCollection",
            features: [

            ]
        };

        for (var i=0;i < _polygon.length;i++){
        _polygonCollection.features.push(_polygon[i]);
        }
        // console.log(_polygonCollection);

        var merged = turf.union(_polygon[0],_polygon[1]);
        console.log(merged);
        _polygon = merged;
        showIsochrone();
        compareData();
    });

    function drawIsochrones() {
        console.log("------------Draw Isochrones");
        var geojson = isochrones.features;
        var transform = d3.geo.transform({point: projectPoint}),
            path = d3.geo.path().projection(transform);
        var geojsonPoint = g.selectAll("path")
            .data(geojson)
            .enter().append("path").attr("class", function (d) {
                return d.properties.time + " geojson-hide";
            });
        // map.on("viewreset", reset);
        polygonsUpdate();

        // Use Leaflet to implement a D3 geometric transformation.
        function projectPoint(x, y) {
            var point = map.latLngToLayerPoint(new L.LatLng(y, x));
            this.stream.point(point.x, point.y);
        }

        map.on("viewreset", polygonsUpdate);
        function polygonsUpdate() {
            var bounds = path.bounds(geojson),
                topLeft = bounds[0],
                bottomRight = bounds[1];
            geojsonPoint.attr("d", path);
        }
    }

    function showIsochrone() {
        d3.selectAll("path").classed("geojson-show", false);
        _totalPlaces = 0,
            _totalReviews = 0,
            _totalGrocery = 0,
            _totalBars = 0,
            _totalRestaurants = 0,
            _totalCivic = 0,
            _totalActive = 0,
            _totalShopping = 0,
            _totalProfessionalServices = 0;

        // var geojson = d3.select(_polygonClass);
        var geojson = _polygon;
        var geojsonPoint = d3.selectAll(_polygonClass).classed("geojson-show", true);
    }

    function calculateTotals(point) {
        _totalPlaces += 1;
        // console.log(point.properties.Category);
        // console.log(_totalPlaces);
        _totalReviews += point.properties.Reviews;
        if (point.properties.Category == "restaurants") {
            _totalRestaurants += 1;
        }
        else if (point.properties.Category == "grocery") {
            _totalGrocery += 1;
        }
        else if (point.properties.Category == "nightlife") {
            _totalBars += 1;
        }
        else if (point.properties.Category == "active") {
            _totalActive += 1;
        }
        else if (point.properties.Category == "financialservices,professional") {
            _totalProfessionalServices += 1;
        }
        else if (point.properties.Category == "localservices,shopping") {
            _totalShopping += 1;
        }
        else if (point.properties.Category == "publicservicesgovt") {
            _totalCivic += 1;
        }
        else {
        }

    }
}

L.marker([42.35239, -71.04708], {icon: transitIcon, opacity: 0.6}).addTo(map);
L.marker([42.34886, -71.04247], {icon: transitIcon, opacity: 0.6}).addTo(map);

$(".filter").click(function () {
    var processEachLayer = function () {

        var yelpCategory = d3.selectAll("circle");
        yelpCategory.each(function (d) {
            cat = d.properties.Category;
            if (turnedOn.indexOf(cat) !== -1) {
                d3.select(this).style("display", "initial");
            }
            else {
                d3.select(this).style("display", "none");
            }
        });
    }

    if (this.value == "toggle") {
        var checkboxesYelp = document.getElementsByClassName('checkbox-yelp');
        // console.log(checkboxes.length);
        var turnedOn = [];
        var turnedOnIso = [];
        $(".checkbox-yelp").prop('checked', $('.toggle').prop("checked"));
        // console.log("toggle!");

        for (var i = 0; i < checkboxesYelp.length; i++) {
            // console.log(checkboxes[i].value);
            if (checkboxesYelp[i].checked) turnedOn.push(checkboxesYelp[i].value);
        }
        processEachLayer();
    }
    else {
        var checkboxesYelp = document.getElementsByClassName('checkbox-yelp');
        var turnedOn = [];
        for (var i = 0; i < checkboxesYelp.length; i++) {
            if (checkboxesYelp[i].checked) turnedOn.push(checkboxesYelp[i].value);
            //console.log(turnedOn);
        }
        processEachLayer();
    }
});


