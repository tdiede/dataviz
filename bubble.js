"use strict";


(function() {

let width = 800;
let height = 600;

let svgBubble = d3.select('body')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', 'translate(' + width/2 + ',' + height/2 + ')');

// simulation is a collection of forces
// about where we want circles to go
// and how we want them to interact
let simulation = d3.forceSimulation()
    // .force('name', defineForce)
    .force('x', d3.forceX().strength(0.05))
    .force('y', d3.forceY().strength(0.05))
    .force('collide', d3.forceCollide(function(d) { return radiusScale(d.firstname.length**2 + 3); }));

let defs = svgBubble.append('defs');

let radiusScale = d3.scaleSqrt()
    .domain([1,300])
    .range([10,80]);

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
        .attr('r', function(d) { return radiusScale(d.firstname.length**2); })
        // .attr('fill', 'lightblue')
        .attr('fill', function(d) { return 'url(#' + d.bioid + ')'; })
        .on('click', function(d) { console.log(d); });

    defs.selectAll('.pattern')
        .data(data)
        .enter()
        .append('pattern')
        .attr('class', 'pattern')
        .attr('id', function(d) { return d.bioid; })
        .attr('height','100%')
        .attr('width','100%')
        .attr('patternContentUnits','objectBoundingBox')
        .append('image')
            .attr('height', 1)
            .attr('width', 1)
            .attr('preserveAspectRatio', 'none')
            .attr('xmlns:xlink', 'http://www.w3.org/1999/xlink')
            .attr('xlink:href', function(d) { return '225x275/' + d.bioid + '.jpg'; });

    simulation.nodes(data)
        .on('tick', tick);

    function tick() {
        circles
            .attr('cx', function(d) { return d.x; })
            .attr('cy', function(d) { return d.y; });
    }

    circles.append('text')
        .data(data)
        .enter()
        .text(function(d) { return d.lastname; })
        .attr('x', width/2)
        .attr('y', height/2)
        .style('fill', 'black')
        .style('text-anchor', 'middle');

}

})();
