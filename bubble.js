"use strict";


(function() {

let margins = {top:20, right:20, bottom:20, left:30};
let width = 800 - margins.left - margins.right;
let height = 600 - margins.top - margins.bottom;

let svgBubble = d3.select('body')
    .append('svg')
    .attr('width', width + margins.left + margins.right)
    .attr('height', height + margins.top + margins.bottom)
    .append('g')
    .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');

// simulation is a collection of forces
// about where we want circles to go
// and how we want them to interact
let simulation = d3.forceSimulation()
    // .force('name', defineForce)
    .force('x', d3.forceX(width/2).strength(0.05))
    .force('y', d3.forceY(height/2).strength(0.05));

d3.queue()
    .defer(d3.csv, 'senate.csv')
    .await(ready);

function ready(error, data) {
    if(error) throw error;

    console.table(data);

    let circles = svgBubble.selectAll('.senators')
        .data(data)
        .enter()
        .append('circle')
        .attr('class','senators')
        .attr('cx', 130)
        .attr('cy', 100)
        .attr('r', 10)
        .attr('fill', 'lightblue');

    simulation.nodes(data)
        .on('tick', tick);

    function tick() {
        circles
            .attr('cx', function(d) { return d.x; })
            .attr('cy', function(d) { return d.y; });
    }

}

})();
