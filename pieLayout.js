/**
 * Created by Alicia on 9/11/16.
 */

var chartSvgMargin = {top: 5, right: 5, bottom: 5, left: 10},
    chartSvgWidth = 150 - (chartSvgMargin.left + chartSvgMargin.right),
    chartSvgHeight = 200 - (chartSvgMargin.top + chartSvgMargin.bottom);


var chartSvg = d3.select("#bar-chart").append("svg")
    .attr("width", chartSvgWidth + (chartSvgMargin.left + chartSvgMargin.right))
    .attr("height", chartSvgHeight + (chartSvgMargin.top + chartSvgMargin.bottom))
    .style("fill", "gray");

var textSvg = d3.select("#total-places").append("svg")
    .attr("width", 300)
    .attr("height", 100)
    .style("fill", "gray");

var chartG = chartSvg.append('g').attr("transform", "translate(" + (0) + ",2)");
var totalG = textSvg.append('g');

var chartXScale = d3.scale.linear().range([chartSvgWidth, 0]);
var chartYScale = d3.scale.linear().range([chartSvgHeight, 0]);

// var xAxis = d3.svg.axis()
//     .scale(chartXScale)
//     .orient("bottom");
//
// var yAxis = d3.svg.axis()
//     .scale(chartYScale)
//     .orient("left")
//     .ticks(10);




function updateBars() {
  var chartData =
        [
            {"name": "restaurants", "status": true, "value": _totalRestaurants},
            {"name": "grocery", "status": true, "value": _totalGrocery},
            {"name": "active", "status": true, "value": _totalActive},
            {"name": "shopping", "status": true, "value": _totalShopping},
            {"name": "bars", "status": true, "value": _totalBars},
            {"name": "professional", "status": true, "value": _totalProfessionalServices},
            {"name": "civic", "status": true, "value": _totalCivic}
        ];


    var clickedItem = _clickedItem;

    if (typeof clickedItem !== 'undefined') {
        chartData.forEach(function(d) {
            if (d.name == clickedItem['value']) {
                d.status = clickedItem.status
            }
            if (d.status == false) {
                d.value = 0;
            }

        })
    }



    console.log(chartData);
    var sumUp = _totalPlaces;
    var chartDataTotal = [{"name": "total", "status": true, "value": _totalPlaces}];

    chartXScale.domain([0, d3.max(chartData, function (d) {
        return d.value ;
    }) + 50]);

    var barWidth = 16;

    var bar = chartG.selectAll("rect")
        .data(chartData);


    bar.enter().append("rect");

    bar.exit().remove();

    bar.transition()							//Initiate a transition on all elements in the update selection (all rects)
        .duration(500)
        .attr("class","chart-bars")
        .attr("id",function(d) {
            return d.name;
        })
        .attr("x", function (d) {
            return 0;
        })
        .attr("width", function (d) {
            return chartSvgWidth - chartXScale(d.value) + 1;
        })
        .attr("height", barWidth)
        .attr("transform", function (d, i) {
            var translate = ((i * barWidth) + (7 * i));
            return "translate(0," + translate + ")";
        });

    // chartG.selectAll("rect").data(chartData).append("text")
    //     .attr("x", barWidth / 2)
    //     .attr("y",0)
    //     .attr("dy", ".75em")
    //     .text(function (d) {
    //         return d.value;
    //     });




    var barText = chartG.selectAll(".bartext")
        .data(chartData);

    barText.enter().append("text")


    barText.exit().remove();

    barText.transition()							//Initiate a transition on all elements in the update selection (all rects)
        .duration(500)
        .attr("class", "bartext")
        .attr("x", function(d) {
            return chartSvgWidth - chartXScale(d.value) + 5
        })
        .attr("y",0)
        .attr("dy", ".75em")
        .attr("name",function(d) {
            return d.name
        })
        .attr("transform", function (d, i) {
            var translate = ((i * barWidth) + (7 * i));
            return "translate(0," + translate + ")";
        })
        .attr("opacity",0)
        .text(function (d) {
            return d.value;
        });

    bar.on("mouseover", function(d) {
        var text = barText.filter(function(t) {
            return t.name == d.name;
        })
        text.attr("opacity",1);
    })

    bar.on("mouseout", function(d) {
        barText.attr("opacity",0);
    })


    totalG.selectAll("text").remove();
    var numberText = totalG.selectAll("total-places-text").data(chartDataTotal);
    numberText.enter().append("text").attr("class","total-places-text");
    numberText.attr("x",0).attr("y",0).attr("dy", ".75em").text(function(d) {
        if (d.value) {
            return d.value;
        }
        else {
            return "0";
        }
    }).attr("transform","translate(150,10)");


    var placesText = totalG.append("text").attr("class","total-places-text-supportive");
    placesText.attr("x",0).attr("y",0).attr("dy", ".75em").text(function() {
            return "Places";
    }).attr("transform","translate(150,65)");



}

updateBars();





function type(d) {
    d.value = +d.value; // coerce to number
    return d;
}

