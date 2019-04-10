var body = d3.selectAll('input');

// code will be used to get min and max axis values.
// https://codeburst.io/javascript-finding-minimum-and-maximum-values-in-an-array-of-objects-329c5c7e22a2

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

function scatterPlot(d){
var width = 600;
var height = 600;
var margin = {
  top: 50,
  left: 50,
  right: 50,
  bottom: 50
};
console.log(d)


var svg = d3.select("body")
			.append("svg")  //grabs svg object 
            .attr("width", width)
            .attr("height", height)

var zoom = d3.zoom()
			.scaleExtent([1, 40])
    		.translateExtent([[-100, -100], [width + 90, height + 100]])
    		.on("zoom", zoomed);

var xScale = d3.scaleLinear() // takes a continuous linear scale
               .domain([Math.round(getMinX(d)) - 3,Math.round(getMaxX(d)) + 3]) //range of vals to map to scale
               .range([margin.left,width - margin.right]);
              // start margin.left because we set margin and end
              // width - margin.right our max in the svg is width
              // and we set a margin.

var yScale = d3.scaleLinear()
               .domain([Math.round(getMinY(d)) - 3,Math.round(getMaxY(d)) + 3])
               .range([height-margin.bottom,margin.top]);

// var xAxis = svg.append("g") // g is a grouping of subelements
//                .attr("transform",`translate(0,${height-margin.bottom})`) // takes special quotes are arg
//                .axisBottom(xScale); // assigns xScale to bot

// var yAxis = svg.append("g")
//                .attr("transform",`translate(${margin.left},0)`)
//                .axisLeft(yScale);

var xAxis = d3.axisBottom(xScale)
    .ticks((width + 2) / (height + 2) * 10)
    .tickSize(height)
    .tickPadding(8 - height);

var yAxis = d3.axisRight(yScale)
    .ticks(10)
    .tickSize(width)
    .tickPadding(8 - width);





var gX = svg.append("g")
    .attr("class", "axis axis--x")
    .call(xAxis);



var gY = svg.append("g")
    .attr("class", "axis axis--y")
    .call(yAxis);


d3.select("#reset")
    .on("click", resetted);




// Time to draw the points!!!!

var circle = svg.selectAll("circle") // returns empty selection
                .data(d) // initializes data
                .enter() // combines data elements and circle element
                .append("circle") // appends the circles to the element
                .attr("cx",function(d){ return xScale(d.x); }) //cx = center x, use a function to access the data. Here we access the x key for each record in the data.
                .attr("cy",function(d){ return yScale(d.y); })
                .attr("r", 3)
                .attr("fill","#C9082A")

svg.call(zoom);

function zoomed() {
  circle.attr("transform", d3.event.transform);
  gX.call(xAxis.scale(d3.event.transform.rescaleX(xScale)));
  gY.call(yAxis.scale(d3.event.transform.rescaleY(yScale)));
}

function resetted() {
  svg.transition()
      .duration(750)
      .call(zoom.transform, d3.zoomIdentity);
}

 var title = svg.append("text")
        .attr("x", (width / 2))             
        .attr("y", (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px") 
        .style("text-decoration", "underline")  
        .text("PCA Representation of HDBSCAN clusters");

var xLabel =   svg.append("text")             
      .attr("transform",
            "translate(" + (width/2) + " ," + 
                           (height - margin.top + 40 ) + ")")
      .style("text-anchor", "middle")
      .text("PC1");
      
 var yLabel =   svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 50 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("PC2"); 
  


  };

function barPlot(d) {
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

//barchart implentation

var margin =  {top: 20, right: 10, bottom: 20, left: 40};
var marginOverview = {top: 30, right: 10, bottom: 20, left: 40};
var selectorHeight = 40;
var width = 600 - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom - selectorHeight;
var heightOverview = 80 - marginOverview.top - marginOverview.bottom;
       
var maxLength = d3.max(countJson.map(function(d){ return d.class.length}))
var barWidth = maxLength * 7;
var numBars = Math.round(width/barWidth);
var isScrollDisplayed = barWidth * countJson.length > width;

// var xscale = d3.scaleBand()
//                 .domain(countJson.slice(0,numBars).map(function (d) { return d.class; }))
//                 .bandwidth([0, width], .2);

// var yscale = d3.scaleLinear()
// 							.domain([0, d3.max(countJson, function (d) { return d.value; })])
//               .range([height, 0]);
  
// var xAxis  = d3.axisBottom(xscale);
// var yAxis  = d3.axisLeft(yscale);


var svg = d3.select("body").append("svg")
						.attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom + selectorHeight);
  
var diagram = svg.append("g")
								 .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


var scales_x = d3.scaleBand() 
               .domain(classes) 
               .rangeRound([margin.left,width - margin.right])
              .padding(0.3); 

var scales_y = d3.scaleLinear()
               .domain([0,Math.max.apply(null,counts)])
               .range([height-margin.bottom,margin.top]);

var xAxis = svg.append("g") 
               .attr("transform",`translate(0,${height-margin.bottom})`) 
               .call(d3.axisBottom().scale(scales_x)) 

var yAxis = svg.append("g")
               .attr("transform",`translate(${margin.left},0)`)
               .call(d3.axisLeft().scale(scales_y));



diagram.append("g")
  	   .attr("class", "axis axis--x")
       .attr("transform", "translate(0, " + height + ")")
       .call(xAxis);

console.log('hi')
  
diagram.append("g")
       .attr("class", "y axis")
       .call(yAxis);
  
var bars = diagram.append("g");
  
bars.selectAll("rect")
            .data(countJson.slice(0, numBars), function (d) {return d.class; })
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function (d) { return xscale(d.class); })
            .attr("y", function (d) { return yscale(d.count); })
            .attr("width", xscale.rangeBand())
            .attr("height", function (d) { return height - yscale(d.count); });

  
if (isScrollDisplayed)
{
  var xOverview = d3.scaleOrdinal()
                  .domain(countJson.map(function (d) { return d.class; }))
                  .bandwidth([0, width], .2);
  yOverview = d3.scaleLinear().range([heightOverview, 0]);
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
      })

  var displayed = d3.scaleQuantize()
              .domain([0, width])
              .range(d3.range(countJson.length));

  diagram.append("rect")
              .attr("transform", "translate(0, " + (height + margin.bottom) + ")")
              .attr("class", "mover")
              .attr("x", 0)
              .attr("y", 0)
              .attr("height", selectorHeight)
              .attr("width", Math.round(parseFloat(numBars * width)/countJson.length))
              .attr("pointer-events", "all")
              .attr("cursor", "ew-resize")
              .call(d3.behavior.drag().on("drag", display));
}
function display () {
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
      .data(new_data, function (d) {return d.class; });

	 	rects.attr("x", function (d) { return xscale(d.class); });

    rects.enter().append("rect")
      .attr("class", "bar")
      .attr("x", function (d) { return xscale(d.class); })
      .attr("y", function (d) { return yscale(d.count); })
      .attr("width", xscale.rangeBand())
      .attr("height", function (d) { return height - yscale(d.count); });

    rects.exit().remove();
}
}


// set dim for bar chart, based on steven brauns tutorial
// var width = 600;
// var height = 600;
// var margin = {
//   top: 50,
//   left: 50,
//   right: 50,
//   bottom: 50
// };

// var div = d3.select("body").append("div")	// append tooltip for hover function
//     .attr("class", "tooltip")				
//     .style("opacity", 0);

// var svg = d3.select("body") // will grab body label in DOM
//             .append("svg") //appends svg object 
//             .attr("width", width)
//             .attr("height", height);



// var scales_x = d3.scaleBand() 
//                .domain(classes) 
//                .rangeRound([margin.left,width - margin.right])
//               .padding(0.3); 

// var scales_y = d3.scaleLinear()
//                .domain([0,Math.max.apply(null,counts)])
//                .range([height-margin.bottom,margin.top]);

// var xAxis = svg.append("g") 
//                .attr("transform",`translate(0,${height-margin.bottom})`) 
//                .call(d3.axisBottom().scale(scales_x)) 

// var yAxis = svg.append("g")
//                .attr("transform",`translate(${margin.left},0)`)
//                .call(d3.axisLeft().scale(scales_y));

// var bar = svg.selectAll("rect") 
//                 .data(countJson) 
//                 .enter() 
//                 .append("rect") 
//                 .attr("x",function(d){return scales_x(d.class);})
//                 .attr("y",function(d){return scales_y(d.count);}) 
//                 .attr("width",scales_x.bandwidth()) 
//                 .attr("height", function(d){
//                    return height - margin.bottom - scales_y(d.count); 
//                 })
//                 .attr("fill","#C9082A") // use nba colors
//                .on("mouseover", function(d) {		// this function shows the POS and COUNT for each bar
//             div.transition()		
//                 .duration(20)		
//                 .style("opacity", 0.9);		
//             div	.html("Class:" + d.class + "<br/>"  + "Count:" + d.count)	
//                 .style("left", (d3.event.pageX) + "px")		
//                 .style("top", (d3.event.pageY - 28) + "px");	
//             })					
//         .on("mouseout", function(d) {	// stops the hover	
//             div.transition()		
//                 .duration(0)		
//                 .style("opacity", 0);
//                 });

// var title = svg.append("text")
//         .attr("x", (width / 2))             
//         .attr("y", (margin.top / 2))
//         .attr("text-anchor", "middle")
//         .style("font-size", "16px") 
//         .style("text-decoration", "underline")  
//         .text("Class Distribution");

// var yLabel =   svg.append("text")
//       .attr("transform", "rotate(-90)")
//       .attr("y",50 - margin.left)
//       .attr("x",0 - (height / 2))
//       .attr("dy", "1em")
//       .style("text-anchor", "middle")
//       .text("Value"); 

// var xLabel =   svg.append("text")             
//       .attr("transform",
//             "translate(" + (width/2) + " ," + 
//                            (height - margin.top + 40) + ")")
//       .style("text-anchor", "middle")
//       .text("Class");



document.getElementById("4").onclick = function plot() {

var layer = '4'

var url = 'http://127.0.0.1:5000/'+layer; 
d3.json(url).then(function(d) { // make a call to the flask API
  if (d3.selectAll("svg")['_groups'][0].length===0){ // if there are no svg objects just create the graph
			scatterPlot(d);
			barPlot(d);
		}
  else { // remove the svg object and create the graph
			d3.select("svg").remove(); // adapted code from https://stackoverflow.com/questions/21490020/remove-line-from-line-graph-in-d3-js
			d3.select("svg").remove(); // adapted code from https://stackoverflow.com/questions/21490020/remove-line-from-line-graph-in-d3-js
			scatterPlot(d);
			barPlot(d);
		};


});


};

document.getElementById("9").onclick = function plot() {

var layer = '9'

var url = 'http://127.0.0.1:5000/'+layer; 
d3.json(url).then(function(d) { // make a call to the flask API

  if (d3.selectAll("svg")['_groups'][0].length===0){ // if there are no svg objects just create the graph
			scatterPlot(d);
			barPlot(d);
		}
  else { // remove the svg object and create the graph
			d3.select("svg").remove(); // adapted code from https://stackoverflow.com/questions/21490020/remove-line-from-line-graph-in-d3-js
			d3.select("svg").remove(); // adapted code from https://stackoverflow.com/questions/21490020/remove-line-from-line-graph-in-d3-js
			scatterPlot(d);
			barPlot(d);
		};



});
};

document.getElementById("18").onclick = function plot() {

var layer = '18'

var url = 'http://127.0.0.1:5000/'+layer; 
d3.json(url).then(function(d) { // make a call to the flask API

  if (d3.selectAll("svg")['_groups'][0].length===0){ // if there are no svg objects just create the graph
			scatterPlot(d);
			barPlot(d);
		}
  else { // remove the svg object and create the graph
			d3.select("svg").remove(); // adapted code from https://stackoverflow.com/questions/21490020/remove-line-from-line-graph-in-d3-js
			d3.select("svg").remove(); // adapted code from https://stackoverflow.com/questions/21490020/remove-line-from-line-graph-in-d3-js
			scatterPlot(d);
			barPlot(d);
		};



});
};

document.getElementById("27").onclick = function plot() {

var layer = '27'

var url = 'http://127.0.0.1:5000/'+layer; 
d3.json(url).then(function(d) { // make a call to the flask API

  if (d3.selectAll("svg")['_groups'][0].length===0){ // if there are no svg objects just create the graph
			scatterPlot(d);
			barPlot(d);
		}
  else { // remove the svg object and create the graph
			d3.select("svg").remove(); // adapted code from https://stackoverflow.com/questions/21490020/remove-line-from-line-graph-in-d3-js
			d3.select("svg").remove(); // adapted code from https://stackoverflow.com/questions/21490020/remove-line-from-line-graph-in-d3-js
			scatterPlot(d);
			barPlot(d);
		};



});
};

document.getElementById("36").onclick = function plot() {

var layer = '36'

var url = 'http://127.0.0.1:5000/'+layer; 
d3.json(url).then(function(d) { // make a call to the flask API

  if (d3.selectAll("svg")['_groups'][0].length===0){ // if there are no svg objects just create the graph
			scatterPlot(d);
			barPlot(d);
		}
  else { // remove the svg object and create the graph
			d3.select("svg").remove(); // adapted code from https://stackoverflow.com/questions/21490020/remove-line-from-line-graph-in-d3-js
			d3.select("svg").remove(); // adapted code from https://stackoverflow.com/questions/21490020/remove-line-from-line-graph-in-d3-js
			scatterPlot(d);
			barPlot(d);
		};



});


};