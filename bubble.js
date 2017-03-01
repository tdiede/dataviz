"use strict";


(function() {

const width = 800;
const height = 800;

const title = "WHO'S WHO in the U.S. SENATE";
const subtitle = "115th Congress";

const presentYear = new Date().getFullYear();

let svg = d3.select('body')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', 'translate(' + width/2 + ',' + height/2 + ')');

let tip = d3.select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

// simulation is a collection of forces
// about where we want circles to go
// and how we want them to interact
let simulation = d3.forceSimulation()
    // .force('name', defineForce)
    .force('x', d3.forceX().strength(0.05))
    .force('y', d3.forceY().strength(0.05))
    .force('collide', d3.forceCollide(function(d) {
        let yearsOffice = presentYear - d.assumed;
        return radiusScale(yearsOffice)+3;
    }));

let defs = svg.append('defs');

let radiusScale = d3.scaleSqrt()
    .range([10,50]);

d3.queue()
    .defer(d3.csv, 'senate.csv')
    .await(ready);


function ready(error, data) {
    if(error) throw error;

    console.table(data);

    radiusScale.domain([ 0, d3.max(data, function(d) {
        let yearsOffice = presentYear - d.assumed;
        return yearsOffice;
    }) ]);

    defs.selectAll('.senator-pattern')
        .data(data)
        .enter()
        .append('pattern')
        .attr('class', 'senator-pattern')
        .attr('id', function(d) { return d.bioid; })
        .attr('height','100%')
        .attr('width','100%')
        .attr('patternContentUnits','objectBoundingBox')
        .append('image')
            .attr('height', 1)
            .attr('width', 1)
            .attr('preserveAspectRatio', 'xMidYMid slice')
            .attr('xmlns:xlink', 'http://www.w3.org/1999/xlink')
            .attr('xlink:href', function(d) {
                // console.log(d.bioid, d);
                return '225x275/' + d.bioid + '.jpg';
            });

    let circles = svg.selectAll('.senators')
        .data(data)
        .enter()
        .append('circle')
        .attr('class','senators')
        .attr('cx', 130)
        .attr('cy', 100)
        .attr('r', function(d) {
            let yearsOffice = presentYear - d.assumed;
            return radiusScale(yearsOffice);
        })
        .attr('stroke', function(d) {
            if (d.party === 'R') {
                return 'rgba(255,0,0,0.5)';
            } else if (d.party === 'D') {
                return 'rgba(0,0,255,0.5';
            } else {
                return 'rgba(255,0,255,0.5)';
            }
        })
        .attr('stroke-width', 3)
        .attr('stroke-location', 'outside')
        .attr('fill', function(d) {
            return 'url(#' + d.bioid + ')';
        })
        .on("click", clicked)
        .on("mouseover", function(d) {
            let yearsOffice = presentYear - d.assumed;
            tip.transition()
                .duration(200)
                .style("opacity", .9);
            tip.html("<strong>Senator </strong><span>" + d.firstname + " " + d.lastname + "</span>")
                .style("left", (d3.event.pageX + radiusScale(yearsOffice)) + "px")
                .style("top", (d3.event.pageY - radiusScale(yearsOffice)) + "px");
        })
        .on("mouseout", function(d) {
            tip.transition()
                .duration(500)
                .style("opacity", 0);
        });

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

    svg.append('text')
        .attr('class', 'title')
            .text(title)
            .attr('dx', (-width/2)+20)
            .attr('dy', (-height/2)+30)
            .style('text-anchor', 'left');

    svg.append('text')
        .attr('class', 'subtitle')
        .text(subtitle)
        .attr('dx', (-width/2)+20)
        .attr('dy', (-height/2)+50)
        .style('text-anchor', 'left');

    let controls = svg.append('g')
        .attr('class', 'interface');

    controls.append('text')
        .text('DIVIDE BY')
        .attr('dx', (width/2)-100)
        .attr('dy', (-height/2)+30)
        .style('text-anchor', 'right');
    controls.append('text')
        .text('gender')
        .attr('dx', (width/2)-100)
        .attr('dy', (-height/2)+50)
        .style('text-anchor', 'right');
    controls.append('text')
        .text('party')
        .attr('dx', (width/2)-100)
        .attr('dy', (-height/2)+70)
        .style('text-anchor', 'right');


// https://github.com/wbkd/d3-extended
d3.selection.prototype.moveToFront = function() {  
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};


function clicked(d, i) {
    d3.select(this).moveToFront()
        .transition()
        .attr("r", d3.max(data, function(d) {
            let yearsOffice = presentYear - d.assumed;
            return yearsOffice*2;
        }))
        .transition()
        .duration(3000)
        .attr("r", function(d) {
            let yearsOffice = presentYear - d.assumed;
            return radiusScale(yearsOffice);
        });
}


}

})();
