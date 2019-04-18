// helper functions here
// code will be used to get min and max axis values.
// https://codeburst.io/javascript-finding-minimum-and-maximum-values-in-an-array-of-objects-329c5c7e22a2
// var dispatch = d3.dispatch('pointsUpdated')
function getMinY(d) {
  return d.reduce((min, p) => p.y < min ? p.y : min, d[0].y);
}
function getMaxY(d) {
  return d.reduce((max, p) => p.y > max ? p.y : max, d[0].y);
}

function getMinX(d) {
  return d.reduce((min, p) => p.x < min ? p.x : min, d[0].x);
}
function getMaxX(d) {
  return d.reduce((max, p) => p.x > max ? p.x : max, d[0].x);
}

function getMaxCount(d) {
	return d.reduce((max, p) => p.count > max ? p.count : max, d[0].count);
}

function getMinCount(d) {
	return d.reduce((min, p) => p.count > min ? p.count : min, d[0].count);
}

// helper for sort
  function cmp(a, b) {
    return b[1] - a[1];
}

// small viz for nearestNeighborSearch
function nearestNeighborPlot(d){

// check if nearestNeighbor plot exists. True remove
  if (d3.selectAll("svg#nearestNeighbor")[0].length>0){
    d3.select("svg#nearestNeighbor").remove();
  }

  nearestClasses = [];
  for (i=0;i<d.length;i++){
    nearestClasses.push(d[i]['class'])
  }

var margin = {top: 20, right: 20, bottom: 120, left: 40},
    width = 400 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var xScale = d3.scale.ordinal().rangeRoundBands([0, width], .05);

var yScale = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom")

var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left")


xScale.domain(nearestClasses);
yScale.domain([0, d3.max(d, function(d) { return d.distProb; }) + 0.1]);

var svg = d3.select("#nnPlot").append("svg")
    .attr("id","nearestNeighbor")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", "-.55em")
      .attr("transform", "rotate(-90)" )

  svg.append("g")
      .classed("y axis", true)
      .call(yAxis)
    .append("text")
      .classed("label", true)
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left)
      .attr("x",-height/2)
      .attr("dy", ".71em")
      .style("text-anchor", "middle")
      .style("font-size","12px")
      .text('Summed Distance');

  svg.append("text")
        .attr("x", (width / 2))             
        .attr("y", -margin.top + 10)
        .attr("text-anchor", "middle")
        .style("font-size", "14px") 
        .style("text-decoration", "underline")  
        .text("Classes of Nearest Neighbors of Clicked Point")

  svg.selectAll("bar")
      .data(d)
    .enter().append("rect")
      .style("fill", "gray")
      .attr("x", function(d) { return xScale(d.class); })
      .attr("width", xScale.rangeBand())
      .attr("y", function(d) { return yScale(d.distProb); })
      .attr("height", function(d) { return height - yScale(d.distProb); });

}

// small viz for clusterDistribution
function clusterDistributionPlot(d,bin){

// check if nearestNeighbor plot exists. True remove
  if (d3.selectAll("svg#clusterDistribution")[0].length>0){
    d3.select("svg#clusterDistribution").remove();
  }

  clusters = [];
  for (i=0;i<d.length;i++){
    clusters.push(d[i]['Cluster'])
  }

var margin = {top: 20, right: 20, bottom: 120, left: 40},
    width = 400 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var xScale = d3.scale.ordinal().rangeRoundBands([0, width], 0.1);

var yScale = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom")

var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left")


xScale.domain(clusters);
yScale.domain([0, d3.max(d, function(d) { return d.Frequency; }) + 0.1]);

var svg = d3.select("#clustPlot").append("svg")
    .attr("id","clusterDistribution")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");

  // svg.append("g")
  //     .attr("class", "x axis")
  //     .attr("transform", "translate(0," + height + ")")
  //     .call(xAxis)
  //   .selectAll("text")
  //     .style("text-anchor", "end")
  //     .attr("dx", "-.8em")
  //     .attr("dy", "-.55em")
  //     .attr("transform", "rotate(-90)" )


  svg.append("g")
      .classed("y axis", true)
      .call(yAxis)
    .append("text")
      .classed("label", true)
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left)
      .attr("x",-height/2)
      .attr("dy", ".71em")
      .style("text-anchor", "middle")
      .style("font-size","12px")
      .text('Frequency');

  svg.append("g")
      .classed("x axis", true)
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .classed("label", true)
      .attr("x", width/2)
      .attr("y", margin.bottom - 80)
      .style("text-anchor", "middle")
      .style("font-size","12px")
      .text('Clusters');

  svg.append("text")
        .attr("x", (width / 2))             
        .attr("y", -margin.top + 10)
        .attr("text-anchor", "middle")
        .style("font-size", "14px") 
        .style("text-decoration", "underline")  
        .text("Cluster Distribution of "+bin)




  svg.selectAll("bar")
      .data(d)
    .enter().append("rect")
      .style("fill", "gray")
      .attr("x", function(d) { return xScale(d.Cluster); })
      .attr("width", xScale.rangeBand())
      .attr("y", function(d) { return yScale(d.Frequency); })
      .attr("height", function(d) { return height - yScale(d.Frequency); });

}

function clusterDistribution(d,bin){
  //console.log(bin);
  //console.log(d);

  var binDist = {};
  for (i=0;i<d.length;i++){
    if (d[i]['class']===bin && !(d[i]['CLUSTER'] in binDist)){
      binDist[d[i]['CLUSTER']]=1
    }
    else if (d[i]['class']===bin){
      binDist[d[i]['CLUSTER']] += 1
    }
  }
  binDistBar = []
  uniCluster = Object.keys(binDist)
  clusterCounts = Object.values(binDist)
  for (i=0;i<uniCluster.length;i++){
    binDistBar.push({'Cluster':uniCluster[i],'Frequency':clusterCounts[i]});
  }
  clusterDistributionPlot(binDistBar,bin);
}

// searches top k nearest points to a given point, pt. Calculates probable class based on that.
function nearestNeighborSearch(d,pt,k){ 
  var pointDist = [];
  for (i=0;i<d.length;i++){
    pointDist.push([d[i]["class"],1/(1+Math.sqrt(Math.pow(pt[0]-d[i]['x'],2)+Math.pow(pt[1]-d[i]['y'],2)))]);// calculate euclidean distance
  }
  // sort array and get top closest k results that are not point

  pointDist.sort(cmp);
  var topk = pointDist.slice(1,k+1);

// getting weighted probabilities to see who is closest neighbor
  var wProb = {};

  var denominator = 0;

  for (i=0;i<topk.length;i++){
    denominator = denominator + topk[i][1]
  }

  for (i=0;i<topk.length;i++){
    console.log(topk[i][0])
    if (!(topk[i][0] in wProb)){
      wProb[topk[i][0]] = topk[i][1]/denominator
    }

    else {
      wProb[topk[i][0]] = wProb[topk[i][0]] + (topk[i][1]/denominator)
    }
  }
uniClass = Object.keys(wProb)
dist = Object.values(wProb)
  wProbJson = [];
  for (i=0;i<uniClass.length;i++){
    wProbJson.push({'class':uniClass[i],'distProb':dist[i]})
  }

  nearestNeighborPlot(wProbJson)
}

// scatterplot here
function scatterPlot(d,title){ // code adapted from: http://bl.ocks.org/peterssonjonas/4a0e7cb8d23231243e0e

  var dataset = d;

var margin = { top: 50, right: 100, bottom: 50, left: 100 },
    outerWidth = 750,
    outerHeight = 500,
    width = outerWidth - margin.left - margin.right;
    height = outerHeight - margin.top - margin.bottom;

var xScale = d3.scale.linear()
    .range([0, width]).nice();

var yScale = d3.scale.linear()
    .range([height, 0]).nice();


  xScale.domain([getMinX(d), getMaxX(d)]);
  yScale.domain([getMinY(d),getMaxY(d)]);

  var xAxis = d3.svg.axis()
      .scale(xScale)
      .orient("bottom")
      .tickSize(-height);

  var yAxis = d3.svg.axis()
      .scale(yScale)
      .orient("left")
      .tickSize(-width);

  var color = d3.scale.category10();

  var tip = d3.tip()
      .attr("class", "d3-tip")
      .offset([-10, 0])
      .html(function(d,i) {
        return 'Class:'+d['class']+' Cluster: ' + d['CLUSTER'];
      });

  var zoomBeh = d3.behavior.zoom()
      .x(xScale)
      .y(yScale)
      .scaleExtent([0, 500])
      .on("zoom", zoom);

  var svg = d3.select("#scatPlot")
    .append("svg")
    .attr("id","scatterplotMain")
      .attr("width", outerWidth)
      .attr("height", outerHeight)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .call(zoomBeh);

 svg.call(tip);

  svg.append("rect")
      .attr("width", width)
      .attr("height", height);

  svg.append("g")
      .classed("x axis", true)
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .classed("label", true)
      .attr("x", width/2)
      .attr("y", margin.bottom - 10)
      .style("text-anchor", "middle")
      .style("font-size","20px")
      .text('PC1');

  svg.append("g")
      .classed("y axis", true)
      .call(yAxis)
    .append("text")
      .classed("label", true)
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 50)
      .attr("x",-height/2)
      .attr("dy", ".71em")
      .style("text-anchor", "middle")
      .style("font-size","20px")
      .text('PC2');

    svg.append("text")
        .attr("x", (width / 2))             
        .attr("y", margin.top - 60)
        .attr("text-anchor", "middle")
        .style("font-size", "20px") 
        .style("text-decoration", "underline")  
        .text(title)

var objects = svg.append("svg")
      .classed("objects", true)
      .attr("width", width)
      .attr("height", height);

  objects.append("svg:line")
      .classed("axisLine hAxisLine", true)
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", width)
      .attr("y2", 0)
      .attr("transform", "translate(0," + height + ")");

  objects.append("svg:line")
      .classed("axisLine vAxisLine", true)
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", height);

  objects.selectAll(".dot")
      .data(d)
    .enter().append("circle")
      .classed("dot", true)
      .attr("id",function(d,i){return d.class;})
      .attr("r", 3)
      .attr("transform", transform)
      .style("fill", function(d) { return color(d['CLUSTER']); })
      .on("mouseover", tip.show)
      .on("mouseout", tip.hide)
      .on("click", function(d) { nearestNeighborSearch(dataset,[d.x,d.y],5)});


  var legend = svg.selectAll(".legend")
      .data(color.domain())
    .enter().append("g")
      .classed("legend", true)
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("circle")
      .attr("r", 3.5)
      .attr("cx", width + 20)
      .attr("fill", color);

  legend.append("text")
      .attr("x", width + 26)
      .attr("dy", ".35em")
      .text(function(d) { return d; });

  d3.select("input").on("click", change);

// zoom function behavior

  function change() {
    xCat = "PC1";
    xMax = d3.max(d, function(d) { return d['x']; });
    xMin = d3.min(d, function(d) { return d['x']; });

    zoomBeh.x(xScale.domain([xMin, xMax])).y(yScale.domain([yMin, yMax]));

    var svg = d3.select("svg").transition();

    svg.select(".x.axis").duration(750).call(xAxis).select(".label").text("PC1");

    objects.selectAll(".dot").transition().duration(1000).attr("transform", transform);
  }

  function zoom() {
    svg.select(".x.axis").call(xAxis);
    svg.select(".y.axis").call(yAxis);

    svg.selectAll(".dot")
        .attr("transform", transform);
  }

  function transform(d) {
    return "translate(" + xScale(d["x"]) + "," + yScale(d["y"]) + ")";
  }
};

function hightlight(bar) {

  //for class in classes
  //if class !=  bar
  //opacity = 0.5
  for (i=0;i<classes.length;i++){
    if (!(classes[i]==bar)){
  d3.selectAll('circle#'+classes[i])
    .style("opacity",0.1)
  }
}
d3.selectAll('circle#'+bar)
  .attr("r",4)
};

function returnToDefault() {
  d3.selectAll('circle')
    .attr("r",3)
    .style("opacity",1.0)
};

// barplot here
function barPlot(d){ // code adapted from http://bl.ocks.org/cse4qf/95c335c73af588ce48646ac5125416c6

var dataset = d;
classes = [];

for (i=0;i<dataset.length;i++){
  if (!(classes.includes(dataset[i]['class']))){
    classes.push(dataset[i]['class'])
  }
}



// preprocessing
var i;
var arr = [];
var count = {};
for (i = 0; i < d.length; i++) {
	arr.push(d[i]['class'])
}

for (i = 0; i < arr.length; i++ ){

	if (!Object.keys(count).includes(arr[i])){ // if position has not been accounted for

		count[arr[i]]=1;
		}
	else{

		count[arr[i]]+=1;
		}
			}

classes = Object.keys(count)
counts = Object.values(count)

var countJson = [];

for (i=0;i<classes.length;i++){ // take the key value pairs and make a list of json objects where each object is {pos:pos,year:year}
countJson.push({class:classes[i],count:counts[i]});
}

countJson.sort(function(a, b){
    return b.count - a.count;
});
// barchart


var margin =  {top: 20, right: 10, bottom: 20, left: 60};
var marginOverview = {top: 30, right: 10, bottom: 20, left: 40};
var selectorHeight = 40;
var width = 650 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom - selectorHeight;
var heightOverview = 80 - marginOverview.top - marginOverview.bottom;
       
var maxLength = d3.max(countJson.map(function(d){ return d.class.length})) // max length of class label 

var barWidth = maxLength * 3;
var numBars = Math.round(width/barWidth);
var isScrollDisplayed = barWidth * countJson.length > width;
       


  
var xscale = d3.scale.ordinal()
                .domain(countJson.slice(0,numBars).map(function (d) { return d.class; }))
                .rangeBands([0, width], .2);

var yscale = d3.scale.linear()
							.domain([0, d3.max(countJson, function (d) { return d.count; })])
              .range([height, 0]);
  
var xAxis  = d3.svg.axis().scale(xscale).orient("bottom");
var yAxis  = d3.svg.axis().scale(yscale).orient("left");
  
var svg = d3.select("#classBarPlot").append("svg")
            .attr("id","barplotMain")
						.attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom + selectorHeight);
  
var diagram = svg.append("g")
								 .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
diagram.append("g")
  		 .attr("class", "x axis")
       .attr("transform", "translate(0, " + height + ")")
       .call(xAxis);
  
diagram.append("g")
       .attr("class", "y axis")
       .call(yAxis);
  
var bars = diagram.append("svg");
  
bars.selectAll("rect")
            .data(countJson.slice(0, numBars), function (d) {return d.class; })
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function (d) { return xscale(d.class); })
            .attr("y", function (d) { return yscale(d.count); })
            .attr("width", xscale.rangeBand())
            .attr("height", function (d) { return height - yscale(d.count); })
            .on("mouseover", function(d){
            	hightlight(d.class);
            })
            .on("mouseout", function(d){
              returnToDefault();
            })
            .on("click", function(d){
                clusterDistribution(dataset,d.class);
              });


  
if (isScrollDisplayed)
{
  var xOverview = d3.scale.ordinal()
                  .domain(countJson.map(function (d) { return d.class; }))
                  .rangeBands([0, width], .2);
  yOverview = d3.scale.linear().range([heightOverview, 0]);
  yOverview.domain(yscale.domain());

  var subBars = diagram.selectAll('.subBar')
      .data(countJson)

  subBars.enter().append("rect")
      .classed('subBar', true)
      .attr({
          height: function(d) {
              return heightOverview - yOverview(d.count);
          },
          width: function(d) {
              return xOverview.rangeBand()
          },
          x: function(d) {

              return xOverview(d.class);
          },
          y: function(d) {
              return height + heightOverview + yOverview(d.count)
          }
      });

  var displayed = d3.scale.quantize()
              .domain([0, width])
              .range(d3.range(countJson.length));

  diagram.append("rect") // allows for dragging the bar below to get extra bars
              .attr("transform", "translate(0, " + (height + margin.bottom) + ")")
              .attr("class", "mover")
              .attr("x", 0)
              .attr("y", 0)
              .attr("height", selectorHeight)
              .attr("width", Math.round(parseFloat(numBars * width)/countJson.length))
              .attr("pointer-events", "all")
              .attr("cursor", "ew-resize")
              .call(d3.behavior.drag().on("drag", display))
              ;
}

  svg.append("g")
      .classed("y axis", true)
      .call(yAxis)
    .append("text")
      .classed("label", true)
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 65)
      .attr("x",-height/2)
      .attr("dy", ".71em")
      .style("text-anchor", "middle")
      .style("font-size","20px")
      .text('Frequency');

  svg.append("text")
        .attr("x", (width / 2))             
        .attr("y", (margin.top / 2) + 10)
        .attr("text-anchor", "middle")
        .style("font-size", "20px") 
        .style("text-decoration", "underline")  
        .text("Frequency of Classes")

function display () { // updates the bars on screen
    var x = parseInt(d3.select(this).attr("x")),
        nx = x + d3.event.dx,
        w = parseInt(d3.select(this).attr("width")),
        f, nf, new_data, rects;

    if ( nx < 0 || nx + w > width ) return;

    d3.select(this).attr("x", nx);

    f = displayed(x);
    nf = displayed(nx);

    if ( f === nf ) return;

    new_data = countJson.slice(nf, nf + numBars);

    xscale.domain(new_data.map(function (d) { return d.class; }));
    diagram.select(".x.axis").call(xAxis);

    rects = bars.selectAll("rect")
      .data(new_data, function (d) {return d.class; })
      ;

	 	rects.attr("x", function (d) { return xscale(d.class); })
	 	;


    rects.enter().append("rect")
      .attr("class", "bar")
      .attr("x", function (d) { return xscale(d.class); })
      .attr("y", function (d) { return yscale(d.count); })
      .attr("width", xscale.rangeBand())
      .attr("height", function (d) { return height - yscale(d.count); })
      .on("mouseover", function(d){
              hightlight(d.class);
            })
      .on("mouseout", function(d){
          returnToDefault();
            })
      .on("click", function(d){
                clusterDistribution(dataset,d.class);
              });
      

    rects.exit().remove();
};
}


function plot(layer) { // plotting follows similar algorithm just need to change layer value per button. Setting plot function alone also allows for default plotting abilities

layerNum = layer.replace("data/","");

var TITLE = 'Max Pool Layer ' + layerNum

var url = 'http://127.0.0.1:5000/'+layer; 
d3.json(url, function(d) { // make a call to the flask API

  if (d3.selectAll("svg")[0].length===0){ // if there are no svg objects just create the graph
      scatterPlot(d,TITLE);
      barPlot(d);
    }
  else { // remove the svg object and create the graph
      d3.select("svg#scatterplotMain").remove(); // adapted code from https://stackoverflow.com/questions/21490020/remove-line-from-line-graph-in-d3-js
      d3.select("svg#barplotMain").remove(); // adapted code from https://stackoverflow.com/questions/21490020/remove-line-from-line-graph-in-d3-js
      if (d3.selectAll("svg#nearestNeighbor")[0].length===1){ // if nearestNeighbor plot is active
        d3.select("svg#nearestNeighbor").remove();
      }
      if (d3.selectAll("svg#clusterDistribution")[0].length===1){ // if clusterDist plot is active
        d3.select("svg#clusterDistribution").remove();
      }
      scatterPlot(d,TITLE);
      barPlot(d);
    };



});


};


// Gets charts by buttons
document.getElementById("4").onclick = function dispPlot() { // javascript is stupid so you need to set a function to call a function. DiCaprio stars in Function-ception, two data science students dive into javascript

plot("data/4");

};

document.getElementById("9").onclick = function dispPlot() {

plot("data/9");

};

document.getElementById("18").onclick = function dispPlot() {

plot("data/18");

};

document.getElementById("27").onclick = function dispPlot() {

plot("data/27");

};

document.getElementById("36").onclick = function dispPlot() {

plot("data/36");

};

plot("data/4");