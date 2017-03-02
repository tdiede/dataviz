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
    .style('opacity', 0.0);

// simulation is a collection of forces
// about where we want circles to go
// and how we want them to interact
let simulation = d3.forceSimulation()
    // .force('name', defineForce)
    .force('x', d3.forceX().strength(0.05))
    .force('y', d3.forceY().strength(0.05))
    .force('collide', d3.forceCollide(function(d) {
        let yearsOffice = presentYear - d.assumed;
        return radiusScale(yearsOffice)+5;
    }));

let photoFill = svg.append('defs');
let hatchOverlay = svg.append('defs');

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

    photoFill.selectAll('.senator-photo')
        .data(data)
        .enter().append('pattern')
            .attr('class', 'senator-photo')
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
                    return '225x275/' + d.bioid + '.jpg';
                });

    hatchOverlay.selectAll('.senator-hatch')
        .data(data)
        .enter().append('pattern')
            .attr('class', 'senator-hatch')
            .attr('id', function(d) { return d.gender; })
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', 10)
            .attr('height', 10)
            .append('path')
                .attr('d', 'M-1,1 l2,-2 M0,10 l10,-10 M9,11 l2,-2')
                .attr('stroke', function(d) {
                    if (d.gender === 'F') {
                        return 'lightpink';
                    } else if (d.gender === 'M') {
                        return 'lightblue';
                    } else {
                        return 'rgba(255,255,255,0.)';
                    }
                })
                .attr('stroke-width', 3);

    let circles = svg.selectAll('.senators')
        .data(data)
        .enter()
        .append('g')
        .attr('class', 'senators');

    let photos = circles.append('circle')
        .attr('class', 'photo')
        .attr('r', function(d) {
            let yearsOffice = presentYear - d.assumed;
            return radiusScale(yearsOffice);
        })
        .attr('fill', function(d) {
            return 'url(#' + d.bioid + ')';
        })
        .style('fill-opacity', '0.5');

    let hatches = circles.append('circle')
        .attr('class', 'hatch')
        .attr('r', function(d) {
            let yearsOffice = presentYear - d.assumed;
            return radiusScale(yearsOffice);
        })
        .style('fill', function(d) {
            return 'url(#' + d.gender + ')';
        })
        .style('fill-opacity', '0.7');

    let borders = circles.append('circle')
        .attr('class', 'border')
        .attr('r', function(d) {
            let yearsOffice = presentYear - d.assumed;
            return radiusScale(yearsOffice);
        })
        .attr('fill', 'none')
        .attr('stroke', function(d) {
            if (d.party === 'R') {
                return 'rgba(255,0,0,0.5)';
            } else if (d.party === 'D') {
                return 'rgba(0,0,255,0.5';
            } else {
                return 'rgba(255,0,255,0.5)';
            }
        })
        .attr('stroke-width', 4)
        .attr('stroke-location', 'outside');


    circles
        .on("click", clicked)
        .on("mouseover", hover)
        .on("mouseout", leave);

    simulation.nodes(data)
        .on('tick', tick);

    function tick() {
        photos.attr('cx', function(d) { return d.x; }).attr('cy', function(d) { return d.y; });
        hatches.attr('cx', function(d) { return d.x; }).attr('cy', function(d) { return d.y; });
        borders.attr('cx', function(d) { return d.x; }).attr('cy', function(d) { return d.y; });
    }

    // title and subtitle of chart
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

    // interaction with bubbles based on data attributes
    let controls = svg.append('g')
        .attr('class', 'interface');
    controls.append('text')
        .text('GENDER')
        .attr('dx', (width/2)-200)
        .attr('dy', (-height/2)+30)
        .style('text-anchor', 'center');
    controls.append('text')
        .text('PARTY')
        .attr('dx', (width/2)-100)
        .attr('dy', (-height/2)+30)
        .style('text-anchor', 'center');


// https://github.com/wbkd/d3-extended
d3.selection.prototype.moveToFront = function() {  
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};


function clicked(d, i) {
    console.log(this);

    d3.select(this).moveToFront();

    d3.select(this).selectAll('circle.photo')
        .transition()
            .attr("r", d3.max(data, function(d) {
                let yearsOffice = presentYear - d.assumed;
                return yearsOffice*2;
            }))
            .style('fill-opacity', '1.0')
        .transition().duration(3000)
            .attr("r", function(d) {
                let yearsOffice = presentYear - d.assumed;
                return radiusScale(yearsOffice);
            })
            .style('fill-opacity', '0.5');

    d3.select(this).selectAll('circle.border')
        .transition()
            .attr("r", d3.max(data, function(d) {
                let yearsOffice = presentYear - d.assumed;
                return yearsOffice*2;
            }))
        .transition().duration(3000)
            .attr("r", function(d) {
                let yearsOffice = presentYear - d.assumed;
                return radiusScale(yearsOffice);
            });

    d3.select(this).selectAll('circle.hatch')
        .transition()
            .style('fill-opacity', '0.0')
        .transition().delay(3000)
            .style('fill-opacity', '0.7');

}

function hover(d) {
    let yearsOffice = presentYear - d.assumed;
    tip.transition().duration(200)
        .style('opacity', 0.8);
    tip.html("<strong>Senator </strong><span>" + d.firstname + " " + d.lastname + "</span>")
        .style("left", (d3.event.pageX + radiusScale(yearsOffice)) + "px")
        .style("top", (d3.event.pageY - radiusScale(yearsOffice)) + "px");
}
function leave(d) {
    tip.transition().duration(500)
        .style('opacity', 0.0);
}


}

})();
