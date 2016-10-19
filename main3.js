/**
 * Created by bbarnett on 8/23/2016.
 */

// Create leaflet map
var map = new L.Map("map", {
    center: new L.LatLng(42.359534, -71.070482),
    zoom: 14,
    zoomControl: true,
    opacity: .5,
    attributionControl: false
});

//Add base layer
L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
}).addTo(map);


$.getJSON("/data/MBTA-lines.geojson", function (data) {
    // add GeoJSON layer to the map once the file is loaded
    L.geoJson(data, {
        style: function (feature) {
            switch (feature.properties.LINE) {
                case 'RED':
                    return {
                        color: "#d13934",
                        opacity: 1,
                        weight: 4
                    };
                case 'BLUE':
                    return {
                        color: "#027dc3",
                        opacity: 1,
                        weight: 4
                    };
                case 'ORANGE':
                    return {
                        color: "#e58c28",
                        opacity: 1,
                        weight: 4
                    };
                case'GREEN':
                    return {
                        color: "#008f4f",
                        opacity: 1,
                        weight: 4
                    };
                case'SILVER':
                    return {
                        color: "transparent",
                        opacity: 1,
                        weight: 4
                    };
            }
        }
    }).addTo(map);
})
;


//Add global variables
var width = window.innerWidth,
    height = window.innerHeight,
    _polygon,
    _polygonClass,
    _points,
    _pointsInside,
    _totalPlaces,
    _totalreviews,
    _totalGrocery,
    _totalBars,
    _totalRestaurants,
    _totalCivic,
    _totalActive,
    _totalShopping,
    _stationName = "Kendall-MIT",
    _testIsochrone,
    _distance = 5,
    _clickedItem = "restaurants",
    _totalProfessionalServices;

//Initiate map and svg merge
map._initPathRoot();

//Load data, then call runViz
d3_queue.queue()
    .defer(d3.json, "data/stripped_data.geojson")
    .await(runViz);

//Set up map svg and annotation svg

var svg = d3.select(map.getPanes().overlayPane).select("svg"),
    isochroneGroups = {}, isochronesG = svg.append("g").attr("id", "isochrones-g");
var placeInfoSvg = d3.select("#places-info").append("svg").attr("width", 300).attr("height", 50).classed("places-info-svg", true);
var nameText = placeInfoSvg.append("text");
var reviewsText = placeInfoSvg.append("text");

//Create circles on map
function runViz(error, points) {
    drawIsochrones(_stationName, function () {
        changeIsochrone();
        showIsochrone();
        compareData();
    })

    function checkColor(d) {

        if (d.properties.STATION == _stationName) {
            return "rgba(71,71,71,1)"
        }
        else {
            return "white"
        }
    };

    function style(d) {
        return {
            color: "black",
            weight: 1,
            opacity: 1,
            fillColor: checkColor(d),
            fillOpacity: 1,
            radius: 4
        }
    }

    $.getJSON("/data/MBTA_Rail.geojson", function (data) {
        // add GeoJSON layer to the map once the file is loaded
        railStations = L.geoJson(data, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng);
            },
            onEachFeature: onEachFeature,
            style: style

        }).addTo(map);
    });

    var lastClickedLayer;

    function whenClicked(e) {
        var current = e;
        railStations.setStyle({fillColor :'white'})

        var stationName = current.target.feature.properties.STATION;
        _stationName = stationName;
        $("#station").html(function() {
            return _stationName.replace(/\s+/g, ' ')
        })
        current.target.setStyle({
            fillColor: 'rgba(71,71,71,1)'
        })

        if (!isochroneGroups[_stationName]) {

            drawIsochrones(_stationName, function () {
                changeIsochrone();
                showIsochrone();
                compareData();
            })
        }
        else {
            changeIsochrone();
            showIsochrone();
            compareData();
        }
        lastClickedLayer = e.target;
    }

    function onEachFeature(feature, layer) {
        layer._id = feature.properties.STATION
        layer.on({
            click: whenClicked
        });
    }


    if (error) throw error;
    var g = svg.append("g").attr("class", "leaflet-zoom-hide");

    var pointData = points.features;

    pointData.forEach(function (d) {
        if (d.geometry.coordinates[1] === null) {
            d.LatLng = new L.LatLng(0, 0)
        }
        else {
            d.LatLng = new L.LatLng(d.geometry.coordinates[1], d.geometry.coordinates[0])

        }
    })

    pointData.sort(function (a, b) {
        return b.properties.reviews - a.properties.reviews;
    });
    var circles = g.selectAll("circle")
        .data(pointData)
        .enter()
        .append("circle")
        .attr("class", "unselected on")
        .attr("r", 5);
    pointsUpdate();
    map.on("viewreset", pointsUpdate);

    function pointsUpdate() {
        var max = d3.max(pointData, function (d) {
            return +d.properties.reviews;
        });
        var min = d3.min(pointData, function (d) {
            return +d.properties.reviews;
        });
        var oScale = d3.scale.linear()
            .domain([min, max])
            .range([0.3, 0.05]);
        circles.attr("cx", function (d) {
            return map.latLngToLayerPoint(d.LatLng).x
        });
        circles.attr("cy", function (d) {
            return map.latLngToLayerPoint(d.LatLng).y
        });
        circles.attr("r", function (d) {
            if (d.properties.reviews > 10) {
                return Math.sqrt(parseInt(d.properties.reviews) * 0.15);
            }
            else if (d.properties.reviews > 50) {
                return Math.sqrt(parseInt(d.properties.reviews) * .05);
            }
            else {
                return 3;
            }
        });
        circles.attr("callit", function (d) {
            return d.Name
        });
        circles.attr("id", 0);
        //
        circles.style("fill", function (d) {
            if (d.properties.metacategory == "restaurants") {
                return "rgba(210, 84, 249," + (Math.sqrt(oScale(d.properties.reviews) * 0.4)) + ")";
            }
            else if (d.properties.metacategory == "grocery") {
                return "rgba(252,255,0," + (Math.sqrt(oScale(d.properties.reviews) * 0.4)) + ")";
            }
            else if (d.properties.metacategory == "active") {
                return "rgba(255, 160, 19," + (Math.sqrt(oScale(d.properties.reviews) * 0.4)) + ")";
            }
            else if (d.properties.metacategory == "localservices,shopping") {
                return "rgba(255, 71, 25," + (Math.sqrt(oScale(d.properties.reviews) * 0.4)) + ")";
            }
            else if (d.properties.metacategory == "nightlife") {
                return "rgba(0, 204, 102," + (Math.sqrt(oScale(d.properties.reviews) * 0.4)) + ")";
            }
            else if (d.properties.metacategory == "financialservices,professional") {
                return "rgba(153, 153, 102," + (Math.sqrt(oScale(d.properties.reviews) * 0.4)) + ")";
            }
            else if (d.properties.metacategory == "health") {
                return "rgba(153, 153, 102," + (Math.sqrt(oScale(d.properties.reviews) * 0.4)) + ")";
            }
            else if (d.properties.metacategory == "civic") {
                return "rgba(0, 138, 230," + (Math.sqrt(oScale(d.properties.reviews) * 0.4)) + ")";
            }
            else {
                return "rgba(0,0,0,0)";
            }
        })
        circles.style("stroke-width", 1);
        circles.style("stroke", function (d) {
            if (d.properties.metacategory == "restaurants") {
                return "rgba(210, 84, 249," + (Math.sqrt(oScale(d.properties.reviews) * 0.4)) + ")";
            }
            else if (d.properties.metacategory == "grocery") {
                return "rgba(252,255,0," + (Math.sqrt(oScale(d.properties.reviews) * 0.4)) + ")";
            }
            else if (d.properties.metacategory == "active") {
                return "rgba(255, 160, 19," + (Math.sqrt(oScale(d.properties.reviews) * 0.4)) + ")";
            }
            else if (d.properties.metacategory == "localservices,shopping") {
                return "rgba(255, 71, 25," + (Math.sqrt(oScale(d.properties.reviews) * 0.4)) + ")";
            }
            else if (d.properties.metacategory == "nightlife") {
                return "rgba(0, 204, 102," + (Math.sqrt(oScale(d.properties.reviews) * 0.4)) + ")";
            }
            else if (d.properties.metacategory == "financialservices,professional") {
                return "rgba(153, 153, 102," + (Math.sqrt(oScale(d.properties.reviews) * 0.4)) + ")";
            }
            else if (d.properties.metacategory == "health") {
                return "rgba(153, 153, 102," + (Math.sqrt(oScale(d.properties.reviews) * 0.4)) + ")";
            }
            else if (d.properties.metacategory == "civic") {
                return "rgba(0, 138, 230," + (Math.sqrt(oScale(d.properties.reviews) * 0.4)) + ")";
            }
            else {
                return "rgba(0,0,0,0)";
            }
        })
    }

    showCircles();
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
                if (d.properties.reviews > 10) {
                    return Math.sqrt(parseInt(d.properties.reviews) * 2);
                }
                else if (d.properties.reviews > 50) {
                    return Math.sqrt(parseInt(d.properties.reviews) * .5);
                }
                else {
                    return 10;
                }

            });
        var data = circle.datum();
        nameText.text(data.properties.name)
            .attr("class", "nameshow")
            .attr("x", 150)
            .attr("y", 25)
            .style("font-size", "120%");


        reviewsText
            .text(data.properties.location.address1)
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
                if (d.properties.reviews > 10) {
                    return Math.sqrt(parseInt(d.properties.reviews) * 0.15);
                }
                else if (d.properties.reviews > 50) {
                    return Math.sqrt(parseInt(d.properties.reviews) * .05);
                }
                else {
                    return 5;
                }
            })
    });

    var _points = pointData;

    function drawIsochrones(_stationName, callback) {
        var path = "data/station-isochrones/" + _stationName + ".json";
        isochroneGroups[_stationName] = isochronesG.append("g").attr("id", _stationName);
        d3.json(path, function (error, json) {
            var geojson = json.features;
            _polygon = geojson;
            var transform = d3.geo.transform({point: projectPoint}),
                path = d3.geo.path().projection(transform);
            var geojsonPoint = isochroneGroups[_stationName].selectAll("path")
                .data(geojson)
                .enter().append("path").attr("class", function (d) {
                    return "min-" + d.properties.minutes + "-" + _stationName.replace(/\s+/g, '') + " geojson-hide";
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

            if (callback) {
                callback()
            }
            ;
        })

    }

    function compareData() {
        _totalPlaces = 0,
            _totalreviews = 0,
            _totalGrocery = 0,
            _totalBars = 0,
            _totalRestaurants = 0,
            _totalCivic = 0,
            _totalActive = 0,
            _totalShopping = 0,
            _totalProfessionalServices = 0;

        function testCircles(callback) {
            circles.attr("class", function (d, i) {
                if (turf.inside(d, _testIsochrone[0])) {
                    // circles.attr("fill", "black");
                    calculateTotals(d);
                    var currentId = parseInt(d3.select(this).attr("id"));
                    d3.select(this).attr("id", function () {
                        return currentId + 1;
                    });
                    return "on selected";
                }
                else {
                    d3.select(this).attr("id", 0);
                }
            }), callback();
        }

        testCircles(function callback() {
            // d3.selectAll("circle.selected").each(slide);
        });
        // var selected = d3.selectAll(".selected").transition().attr("fill","black");

        updateBars();

        function slide() {
            var onePath = d3.select(this);
            var counter = parseInt(onePath.attr("id"));
             if (counter == 1) {
                onePath.style("stroke-opacity", 1)
                    .transition()
                    .duration(500)
                    .delay(function (d, i) {
                        return i * 5.25;
                    })
                    .attr("stroke", "white")
                    .style("stroke-width", 7)
                    .style("stroke-opacity", 0)
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

    function changeIsochrone() {

        var stationName = _stationName;
        _polygonClass = ".min-" + _distance + "-" + stationName.replace(/\s+/g, '');
        ;
        _testIsochrone = _polygon.filter(function (obj) {
            return obj.properties.minutes == parseInt(_distance);
        });

    }


    $(document).on('input', '#isochrone-slider', function () {
        var distance = $(this).val();

        _distance = distance;
        $(".distance").html(function () {
            return (distance > 9) ? distance + " min" : ' ' + distance + " min"
        });
        changeIsochrone();
        showIsochrone();
        compareData();
    });


    function showIsochrone() {
        d3.selectAll("path").classed("geojson-show", false);

        var geojsonPoint = d3.selectAll(_polygonClass).classed("geojson-show", true);
    }

    function calculateTotals(point) {


        _totalreviews += point.properties.reviews;
        if (point.properties.metacategory == "restaurants" && $("input[value='restaurants']").prop("checked")) {
            _totalPlaces += 1;
            _totalRestaurants += 1;
        }
        else if (point.properties.metacategory == "grocery" && $("input[value='grocery']").prop("checked")) {
            _totalPlaces += 1;
            _totalGrocery += 1;
        }
        else if (point.properties.metacategory == "nightlife" && $("input[value='nightlife']").prop("checked")) {
            _totalPlaces += 1;
            _totalBars += 1;
        }
        else if (point.properties.metacategory == "active" && $("input[value='active']").prop("checked")) {
            _totalPlaces += 1;
            _totalActive += 1;
        }
        else if (point.properties.metacategory == "financialservices,professional" && $("input[value='financialservices,professional']").prop("checked")) {
            _totalPlaces += 1;
            _totalProfessionalServices += 1;
        }
        else if (point.properties.metacategory == "localservices,shopping" && $("input[value='localservices,shopping']").prop("checked")) {
            _totalPlaces += 1;
            _totalShopping += 1;
        }
        else if (point.properties.metacategory == "publicservicesgovt" && $("input[value='publicservicesgovt']").prop("checked")) {
            _totalPlaces += 1;
            _totalCivic += 1;
        }
        else {
        }

    }

    function showCircles(callback) {

        function processEachLayer() {
            var yelpmetacategory = d3.selectAll("circle");
            yelpmetacategory.each(function (d) {
                cat = d.properties.metacategory;
                if (turnedOn.indexOf(cat) !== -1) {
                    d3.select(this).style("display", "initial");
                    d3.select(this).classed("on", true)
                }
                else {
                    d3.select(this).classed("on", false)
                    d3.select(this).style("display", "none");
                }
            });

        }

        if (_clickedItem.value == "toggle") {
            var checkboxesYelp = document.getElementsByClassName('checkbox-yelp');
            var turnedOn = [];
            var turnedOnIso = [];
            $(".checkbox-yelp").prop('checked', $('.toggle').prop("checked"));
            for (var i = 0; i < checkboxesYelp.length; i++) {
                if (checkboxesYelp[i].checked) turnedOn.push(checkboxesYelp[i].value);
            }
            processEachLayer();
        }
        else {
            var checkboxesYelp = document.getElementsByClassName('checkbox-yelp');
            var turnedOn = [];
            for (var i = 0; i < checkboxesYelp.length; i++) {
                if (checkboxesYelp[i].checked) turnedOn.push(checkboxesYelp[i].value);
            }
            processEachLayer();
        }


        if (callback) {
            callback();
        }
        // compareData();
    }


    $(".filter").click(function () {
        var clickedItem = {
            "value": this.value,
            "status": this.checked
        };

        _clickedItem = clickedItem;
        showCircles(compareData);


    });

}


