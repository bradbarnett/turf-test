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
            {"name": "restaurants", "value": _totalRestaurants},
            {"name": "grocery", "value": _totalGrocery},
            {"name": "active", "value": _totalActive},
            {"name": "shopping", "value": _totalShopping},
            {"name": "bars", "value": _totalBars},
            {"name": "professional", "value": _totalProfessionalServices},
            {"name": "civic", "value": _totalCivic}
        ];
    var sumUp = _totalPlaces;
    var chartDataTotal = [{"name": "total", "value": _totalPlaces}];

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


// bar.append("text")
//     .attr("x", barWidth / 2)
//     .attr("y", function (d) {
//         return chartYScale(d.value) + 3;
//     })
//     .attr("dy", ".75em")
//     .text(function (d) {
//         return d.value;
//     });


function type(d) {
    d.value = +d.value; // coerce to number
    return d;
}

