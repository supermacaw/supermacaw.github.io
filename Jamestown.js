var series, 
    hours,
    minVal,
    maxVal = 40,
    reallength,
    numPlayers = statsData.length,
    numPlayersClicked = 0,
    clickedPlayers = new Array(),
    completeLines = false,
    w = 750,
    h = 750,
    vizPadding = {
        top: 10,
        right: 0,
        bottom: 15,
        left: 0
    },
    radius,
    radiusLength,
    ruleColor = "#CCC";

var myPlayerNames = new Array();
for(var x = 0; x < numPlayers; x++){
  myPlayerNames[x] = statsData[x].shift();
}

$(document).ready(function() {
  // Handler for .ready() called.
  checkBox();
});

mergedArr = [];
    for(var j = 0; j < numPlayers; j+=1){
      //playerName = statsData[j].shift();
      mergedArr = mergedArr.concat(statsData[j]);
    }

    minVal = d3.min(mergedArr);
    maxVal = d3.max(mergedArr);
    maxVal = maxVal + ((maxVal - minVal) * 0.10);
    minVal = 0;

var checkBox = function(){
  for (var counter = 0; counter < myPlayerNames.length; counter++){
    addCheckbox(myPlayerNames[counter]);
  }
}

var addCheckbox = function(name) {
   var $container = $('#checkbox');
   var inputs = $container.find('input');
   var id = inputs.length+1;

   var that = this;
   var $input = $('<input>').attr('type', 'checkbox').attr('value',0).change(
      function() {
        gotClicked(name, this.value);
        var state = parseInt(this.value);
        state+=1;
        this.value = state.toString();
      }
    ).appendTo($container);

   var $label = $('<label></label>').attr('for', 'cb' + id).text(name).appendTo($container);
   $('<br>').appendTo($container);

   //$('<input />', { type: 'checkbox', id: 'cb'+id, value: name, onselect: 'gotClicked('+name+')'}).appendTo(container);
   //$('<label />', { 'for': 'cb'+id, text: name }).appendTo(container);
   //$('<br />').appendTo(container);
}

function gotClicked(name, val){
  var state = parseInt(val);
  if (state%2==0){
    numPlayersClicked += 1;
    indexInStatData = myPlayerNames.indexOf(name);
    //console.log(name);
    clickedPlayers.push(statsData[indexInStatData]);
    loadVizAfterRendered();
  }else{
    numPlayersClicked -=1; 
    indexToRemove = clickedPlayers.indexOf(name);
    clickedPlayers.splice(indexToRemove,1);
    loadVizAfterRendered();
  }
  //console.log(numPlayersClicked);
}

var gotUnclicked = function(name){
  
}

var loadViz = function(){
  loadData();
  buildBase();
  setScales();
  addAxes();
  draw();
};

var loadVizAfterRendered = function(){
  loadData();
  draw();
}

var loadData = function(){

    hours = [];
    //console.log(reallength);
    console.log(statsData[0]);
    reallength = 6;
    //console.log(reallength);

    hours[0] = "TSP";
    hours[1] = "AST";
    hours[2] = "RBR";
    hours[3] = "PER";
    hours[4] = "ORR";
    hours[5] = "DRR";

    series = clickedPlayers;
    
    //console.log(mergedArr);
    //console.log(maxVal);
    //give 25% of range as buffer to top

    //console.log(maxVal);

    //to complete the radial lines
    if(!completeLines){
      for (i = 0; i < statsData.length; i += 1) {
          statsData[i].push(statsData[i][0]);
      }
      completeLines = true;
    }
};

var buildBase = function(){
    var viz = d3.select("#viz")
        .append('svg:svg')
        .attr('width', w)
        .attr('height', h)
        .attr('class', 'vizSvg');

    viz.append("svg:rect")
        .attr('id', 'axis-separator')
        .attr('x', 0)
        .attr('y', 0)
        .attr('height', 0)
        .attr('width', 0)
        .attr('height', 0);
    
    vizBody = viz.append("svg:g")
        .attr('id', 'body');
};

setScales = function () {
  var heightCircleConstraint,
      widthCircleConstraint,
      circleConstraint,
      centerXPos,
      centerYPos;

  //need a circle so find constraining dimension
  heightCircleConstraint = h - vizPadding.top - vizPadding.bottom;
  widthCircleConstraint = w - vizPadding.left - vizPadding.right;
  circleConstraint = d3.min([
      heightCircleConstraint, widthCircleConstraint]);

  radius = d3.scale.linear().domain([minVal, maxVal])
      .range([0, (circleConstraint / 2)]);
  radiusLength = radius(maxVal);

  //attach everything to the group that is centered around middle
  centerXPos = widthCircleConstraint / 2 + vizPadding.left;
  centerYPos = heightCircleConstraint / 2 + vizPadding.top;

  vizBody.attr("transform",
      "translate(" + centerXPos + ", " + centerYPos + ")");
};

addAxes = function () {
  var radialTicks = radius.ticks(5),
      i,
      circleAxes,
      lineAxes;

  vizBody.selectAll('.circle-ticks').remove();
  vizBody.selectAll('.line-ticks').remove();

  circleAxes = vizBody.selectAll('.circle-ticks')
      .data(radialTicks)
      .enter().append('svg:g')
      .attr("class", "circle-ticks");

  circleAxes.append("svg:circle")
      .attr("r", function (d, i) {
          return radius(d);
      })
      .attr("class", "circle")
      .style("stroke", ruleColor)
      .style("fill", "none");

  circleAxes.append("svg:text")
      .attr("text-anchor", "middle")
      .attr("dy", function (d) {
          return -1 * radius(d);
      })
      .text(String);

  lineAxes = vizBody.selectAll('.line-ticks')
      .data(hours)
      .enter().append('svg:g')
      .attr("transform", function (d, i) {
          return "rotate(" + ((i / hours.length * 360) - 90) +
              ")translate(" + radius(maxVal) + ")";
      })
      .attr("class", "line-ticks");

  lineAxes.append('svg:line')
      .attr("x2", -1 * radius(maxVal))
      .style("stroke", ruleColor)
      .style("fill", "none");

  lineAxes.append('svg:text')
      .text(String)
      .attr("text-anchor", "middle")
      .attr("transform", function (d, i) {
          return (i / hours.length * 360) < 180 ? null : "rotate(180)";
      });
};

var draw = function () {
  var groups,
      lines,
      linesToUpdate;

  highlightedDotSize = 4;
  var increment = 255/numPlayersClicked;

  groups = vizBody.selectAll('.series')
      .data(series);
  groups.enter().append("svg:g")
      .attr('class', 'series')
      .style('fill', function (d, i) {
          var hue = i * increment;
          //console.log(hue);
         return "hsl(" + hue + ",100%,50%)";
      })
      .style('stroke', function (d, i) {
           var hue = i * increment;
           return "hsl(" + hue + ",100%,50%)";
      });
  groups.exit().remove();

  //console.log(reallength);

  lines = groups.append('svg:path')
      .attr("class", "line")
      .attr("d", d3.svg.line.radial()
          .radius(function (d) {
              return 0;
          })
          .angle(function (d, i) {
              if (i === reallength) {
                  i = 0;
              } //close the line
              return (i / reallength) * 2 * Math.PI;
          }))
      .style("stroke-width", 3)
      .style("fill", "none");

  groups.selectAll(".curr-point")
      .data(function (d) {
          return [d[0]];
      })
      .enter().append("svg:circle")
      .attr("class", "curr-point")
      .attr("r", 0);

  groups.selectAll(".clicked-point")
      .data(function (d) {
          return [d[0]];
      })
      .enter().append("svg:circle")
      .attr('r', 0)
      .attr("class", "clicked-point");

  lines.attr("d", d3.svg.line.radial()
      .radius(function (d) {
          return radius(d);
      })
      .angle(function (d, i) {
          if (i === reallength) {
              i = 0;
          } //close the line
          return (i / reallength) * 2 * Math.PI;
      }));
};