"use strict";

(function() {

// const width = window.innerWidth;
const width = 1200;
const height = 900;

const padding = 4;

const title = "WHO'S WHO in the U.S. SENATE";
const subtitle = "115th Congress: 2017 – 2019";

const labels = ['tenure', 'party', 'class', 'gender'];

const presentYear = new Date().getFullYear();

let main = d3.select('body').append('div')
    .attr('class', 'force');

// main body svg element
let svg = main.append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('class', 'main')
    // .attr('transform', 'translate(' + width/2 + ',' + height/2 + ')');
    .attr('transform', 'translate(' + 0 + ',' + 0 + ')');

// title and subtitle of chart
svg.append('text')
    .attr('class', 'title')
        .text(title)
        .attr('dx', +20)
        .attr('dy', +30)
        .style('text-anchor', 'left');
svg.append('text')
    .attr('class', 'subtitle')
    .text(subtitle)
    .attr('dx', +20)
    .attr('dy', +50)
    .style('text-anchor', 'left');

// interaction with bubbles based on data attributes
let controlStrip = svg.selectAll('.interface')
    .data(labels).enter()
    .append('g')
    .attr('class', 'interface');
controlStrip.append('text')
    .html(function(d) { return d.toUpperCase(); })
    .attr('class', 'selector')
    .attr('id', function(d) { return d; })
    .attr('dx', function(d,i) { return (i*100)+400; })
    .attr('dy', +30)
    .style('text-anchor', 'left')
    .style('text-decoration', 'none');

// tooltip html, turns into info box
let tip = main.append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0.0);

// pattern definitions for circles
let photoFill = svg.append('defs');
let hatchOverlay = svg.append('defs');

// forces
let forceX = d3.forceX( width/2 ).strength(0.1);
let forceY = d3.forceY( height/2 ).strength(0.15);
let forceCollide = d3.forceCollide(function(d) {
        let yearsOffice = presentYear - d.assumed;
        return radiusScale(yearsOffice) + padding*2; }).strength(0.9);
let attractForce = d3.forceManyBody().strength(20).distanceMax(1000).distanceMin(100);
let repelForce = d3.forceManyBody().strength(-140).distanceMax(500).distanceMin(20);

// additional forces based on interaction
let forceXparty = d3.forceX(function(d) {
    if(d.party === 'R') { return width/4; }
    else if(d.party === 'D') { return width*3/4; }
    else { return width/2; }
    });

let forceYparty = d3.forceY(function(d) {
    if(d.party === 'R') { return height/3; }
    else if(d.party === 'D') { return height*2/3; }
    else { return height/2; }
    });

let forceYgender = d3.forceY(function(d) {
    if(d.gender === 'F') { return height/3; }
    else if(d.gender === 'M') { return height*5/8; }
    });

let forceXclass = d3.forceX(function(d) {
    if(d.class === 'Class I') { return width/4; }
    else if(d.class === 'Class II') { return width/2; }
    else if(d.class === 'Class III') { return width*3/4; }
    });

let forceXtriple = d3.forceX(function(d) {
    if(d.class === 'Class I') { return width/6; }
    else if(d.class === 'Class II') { return width/2; }
    else if(d.class === 'Class III') { return width*5/6; }
    });

let forceYtriple = d3.forceY(function(d) {
    if(d.party === 'I') { return height/2; }
    else {
        if(d.party === 'R' && d.gender === 'F') { return height/5; }
        else if(d.party === 'R' && d.gender == 'M') { return height*2/5; }
        else if(d.party === 'D' && d.gender == 'M') { return height*3/5; }
        else if(d.party === 'D' && d.gender == 'F') { return height*4/5; }
    }
    });

// simulation is a collection of forces about where circles go and how they interact
let simulation = d3.forceSimulation()  // .force('name', defineForce)
    .force('x', forceX)
    .force('y', forceY)
    .force('attract', attractForce)
    .force('repel', repelForce)
    .force('collide', forceCollide)
    .alpha(1)
    .alphaTarget(0)
    .alphaDecay(0.01)
    .velocityDecay(0.3);

const radiusScale = d3.scaleSqrt().range([10,50]);

d3.queue().defer(d3.csv, 'senate.csv').await(ready);

function ready(error, data) {
    if(error) throw error;
    // console.table(data);

    radiusScale.domain([ 0, d3.max(data, function(d) {
        let yearsOffice = presentYear - d.assumed;
        return yearsOffice;
    }) ]);

    photoFill.selectAll('.senator-photo')
        .data(data).enter().append('pattern')
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
        .data(data).enter().append('pattern')
            .attr('class', 'senator-hatch')
            .attr('id', function(d) { return d.gender; })
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', 10)
            .attr('height', 10)
            .append('path')
                .attr('d', 'M-1,1 l2,-2 M0,10 l10,-10 M9,11 l2,-2')
                .attr('stroke', function(d) {
                    if (d.gender === 'F') { return 'lightpink'; }
                    else if (d.gender === 'M') { return 'lightblue'; }
                    else { return 'rgba(255,255,255,0.)'; }
                }).attr('stroke-width', 3);

    let circles = svg.selectAll('.senators')
        .data(data).enter().append('g')
        .attr('class', 'senators');

    let photos = circles.append('circle')
        .attr('class', 'photo')
        .attr('r', function(d) {
            let yearsOffice = presentYear - d.assumed;
            return radiusScale(yearsOffice);
        }).attr('fill', function(d) { return 'url(#' + d.bioid + ')'; })
        .style('fill-opacity', '0.5');
    let hatches = circles.append('circle')
        .attr('class', 'hatch')
        .attr('r', function(d) {
            let yearsOffice = presentYear - d.assumed;
            return radiusScale(yearsOffice);
        }).attr('fill', function(d) { return 'url(#' + d.gender + ')'; })
        .style('fill-opacity', '0.5');
    let borders = circles.append('circle')
        .attr('class', 'border')
        .attr('r', function(d) {
            let yearsOffice = presentYear - d.assumed;
            return radiusScale(yearsOffice);
        }).attr('fill', 'none')
        .attr('stroke', function(d) {
            if (d.party === 'R') { return 'rgba(255,0,0,0.5)'; }
            else if (d.party === 'D') { return 'rgba(0,0,255,0.5'; }
            else { return 'rgba(255,0,255,0.5)'; }
        })
        .attr('stroke-width', padding)
        .attr('stroke-location', 'outside');

    circles
        .on("click", clicked)
        .on("mouseover", hover)
        .on("mouseout", leave);

    simulation.nodes(data)
        .on('tick', ticked)
        .on('end', function() { console.log('end reached'); });


    // CLICK EVENT
    // initialize array to store current selected parameters
    let currentParameters = [];
    controlStrip.on('click', function(d, i) {
        // console.log(d);  // party, for example

        updateControlPos(d);
        updateSimulation(d);
    });

    // original simulation cx,cy position
    function ticked() {
        photos.attr('cx', function(d) { return d.x; }).attr('cy', function(d) { return d.y; });
        hatches.attr('cx', function(d) { return d.x; }).attr('cy', function(d) { return d.y; });
        borders.attr('cx', function(d) { return d.x; }).attr('cy', function(d) { return d.y; });
    }
    function updateSimulation(d) {
        switch(d) {
            case 'tenure':
                if(currentParameters.includes(d)) {
                    data.sort(function(a,b) { return b.assumed - a.assumed; });
                    simulation.nodes(data)
                        .on('tick', sortByTenure);
                } else {
                    evalForces(d);
                    simulation.nodes(data)
                        .on('tick', ticked)
                        .force('x', forceX)
                        .force('y', forceY)
                        .alpha(1).alphaTarget(0).alphaDecay(0.005).velocityDecay(0.3);
                }
                break;
            default:
                evalForces(d);
                simulation.nodes(data)
                    .on('tick', ticked)
                    .force('x', forceX)
                    .force('y', forceY)
                    .alpha(1).alphaTarget(0).alphaDecay(0.005).velocityDecay(0.3)
                    .restart();
                break;
        }
    }
    function resetForceX() {
        forceX = d3.forceX( width/2 ).strength(0.1);
    }
    function resetForceY() {
        forceY = d3.forceY( height/2 ).strength(0.12);
    }

    function evalForces(d) {
        resetForceX();
        resetForceY();
        switch(currentParameters.length) {
            case 3:
                forceX = forceXtriple.strength(0.2);
                forceY = forceYtriple.strength(0.25);
                break;
            case 2:
                switch(currentParameters.sort().join(' ')) {
                    case 'class gender':
                        console.log('class and gender');
                        forceX = forceXclass.strength(0.25);
                        forceY = forceYgender.strength(0.2);
                        break;
                    case 'class party':
                        console.log('class and party');
                        forceX = forceXclass.strength(0.25);
                        forceY = forceYparty.strength(0.2);
                        break;
                    case 'gender party':
                        console.log('gender and party');
                        forceX = forceXparty.strength(0.25);
                        forceY = forceYgender.strength(0.15);
                        break;
                }
                break;
            case 1:
                switch(currentParameters[0]) {
                    case 'party':
                        forceX = forceXparty.strength(0.2);
                        break;
                    case 'class':
                        forceX = forceXclass.strength(0.3);
                        break;
                    case 'gender':
                        forceY = forceYgender.strength(0.3);
                        break;
                }
                break;
            case 0:
                resetForceX();
                resetForceY();
                break;
        }
    }

    // https://github.com/wbkd/d3-extended
    d3.selection.prototype.moveToFront = function() {
        return this.each(function(){
            this.parentNode.appendChild(this);
        });
    };
    function clicked(d, i) {
        // console.log(this);

        d3.select(this).moveToFront();

        toggleSenator(d);

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
        tip.transition().duration(200).style('opacity', 0.8);
        tip.html("<span>Senator </span><strong>" + d.firstname + " " + d.lastname +
            "</strong><br><span class='phone-number'>" + d.phone + "</span>")
            .style("left", (d3.event.pageX + radiusScale(yearsOffice)) + "px")
            .style("top", (d3.event.pageY - radiusScale(yearsOffice)) + "px");
    }
    function toggleSenator(d) {
        console.log(d);
        let tooltip = "<span>Senator </span><strong>" + d.firstname + " " + d.lastname +
            "</strong><br><span class='phone-number'>" + d.phone + "</span>";
        let state = "<span>" + d.state + ": </span>";
        let party = "<span style='color:purple;'>" + 'Independent' + "</span>";
        if(d.party === 'R') {
            party = "<span style='color:red;'>" + 'Republican' + "</span>";
        } else if(d.party === 'D') {
            party = "<span style='color:blue;'>" + 'Democrat' + "</span>";
        }
        let reelection = 2019;
        if(d.class === 'Class II') { reelection = 2021; }
        else if (d.class === 'Class III') { reelection = 2023; }
        let senateClass = "<strong>" + d.class + "</strong><br><span>Up for reelection in " + reelection +
            ".<br>Serving since " + d.assumed + ".</span>";
        let senatorInfo = tooltip + "<hr>" + state + party + "<hr>" + senateClass;
        tip.html(senatorInfo)
            .style('opacity', 1.0)
            .style("left", (d3.event.pageX + 100) + "px")
            .style("top", (d3.event.pageY) + "px");
    }
    function leave(d) {
        tip.transition().duration(500)
            .style('opacity', 0.0);
    }


    // tenure visualization
    const numColumns = 10;
    const numRows = data.length/numColumns;
    function cxCalculate(d) {
        let idx = data.indexOf(d);
        const offsetW = 80;
        const columnWidth = (width-offsetW)/numColumns;
        let columnNo = idx % numColumns;
        let cx = columnNo*columnWidth + columnWidth/2;
        return cx + offsetW;
    }
    function cyCalculate(d) {
        let idx = data.indexOf(d);
        const offsetH = 90;
        const rowHeight = ((height-offsetH)/(numRows*2)) + padding;
        let yearsOffice = presentYear - data[idx].assumed;
        let diameter = radiusScale(yearsOffice)*2;
        let rowNo = Math.floor(idx / numRows);
        let cy = rowNo*(rowHeight+(diameter/3));
        // let cy = rowNo*diameter;
        return cy + offsetH;
    }
    function sortByTenure() {
        photos.attr('cx', function(d) { return cxCalculate(d); }).attr('cy', function(d) { return cyCalculate(d); });
        hatches.attr('cx', function(d) { return cxCalculate(d); }).attr('cy', function(d) { return cyCalculate(d); });
        borders.attr('cx', function(d) { return cxCalculate(d); }).attr('cy', function(d) { return cyCalculate(d); });
    }



    // detect label position, update current parameters accordingly
    function updateParams(d) {
        // remove parameter if click is to turn off selection
        if(!(currentParameters.includes(d))) {
            if(d === 'tenure')
                currentParameters.splice(0, currentParameters.length);
            currentParameters.push(d);
        } else {
            let q = currentParameters.indexOf(d);
            currentParameters.splice(q, 1);
        }
        // if(d === 'party' || d === 'class' || d === 'gender')
        if(!(d === 'tenure') && currentParameters.includes('tenure')) {
                let p = currentParameters.indexOf('tenure');
                currentParameters.splice(p, 1);                
        }
    }

    // initial reference for visualization
    const initialRef = `<p>The United States Senate is the upper chamber of the United States Congress which, along with the House of Representatives, the lower chamber, composes the legislature of the United States. The composition and powers of the Senate are established by Article One of the United States Constitution. The Senate is composed of senators who represent each of the several states, with each state being equally represented by two senators, regardless of their population, serving staggered terms of six years; with fifty states presently in the Union, there are 100 U.S. Senators.</p>`;

    // clarify what is a class?
    const question = `<span class='question'>WHAT IS A CLASS?</span>`;
    const classRef = `<p>Article I, section 3 of the Constitution requires the Senate to be divided into three classes for purposes of elections. Senators are elected to six-year terms, and every two years the members of one class — approximately one-third of the senators — face election or reelection. Terms for senators in Class I expire in 2019, Class II in 2021, and Class III in 2023.</p>`;

    const furtherRef = `<p>Originally, senators were selected by the state legislatures, not by popular elections. By the early years of the 20th century, the legislatures of as many as 29 states had provided for popular election of senators by referendums. Popular election to the Senate was standardized nationally in 1913 by the ratification of the Seventeenth Amendment.</p>`;

    let reference = d3.select('body').insert('div', '.force')
        .attr('class', 'clarify')
        .append('html')
        .html(initialRef)
        .style('opacity', 1.0);

    function toggleBox(d) {
        if(d === 'class' && currentParameters.includes('class')) {
            reference.html(classRef);
        } else if(!(currentParameters.includes('class'))) {
            reference.html(initialRef);
        }
    }
    // update position of selected labels in interaction controls
    function updateControlPos(d) {
        switch(d) {
            case 'tenure':
                resetControls(d);
                break;
            default:
                deselectControl('tenure');
                break;
        }
        let label = d3.select('text[id='+d+']').style('text-decoration');
        if(label === 'underline') {
            deselectControl(d);
        } else if(label === 'none') {
            selectControl(d);
        }
        updateParams(d);
        toggleBox(d);
    }
    function selectControl(d) {
        d3.select('text[id='+d+']').transition()
            // .attr('dx', +30)
            .style('text-decoration', 'underline');
    }
    function deselectControl(d) {
        d3.select('text[id='+d+']').transition()
            // .attr('dx', +20)
            .style('text-decoration', 'none')
            .style('fill', '#333333');
    }
    function resetControls(d) {
        for(let control in currentParameters) {
            deselectControl(currentParameters[control]);
        }
    }

}

})();
