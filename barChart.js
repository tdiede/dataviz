"use strict";


const title = 'THE "PARAMOUNT LEADERS" OF CHINA';
const subtitle = 'Time in Office (Days, Years)'

// define margin, width, and height for graphic
const margin = {top:30, right:30, bottom:80, left:50};
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

// define SVG, 'g' element is a container to group objects
const svg = d3.select('body')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// define x,y scales
const xScale = d3.scaleBand()
    .range([0,width])
    .padding(0.2);

const yScale = d3.scaleLinear()
    .range([height,0]);

// create x axis, y axis
const xAxis = d3.axisBottom()
    .scale(xScale);

const yAxis = d3.axisLeft()
    .scale(yScale);

// import data
d3.csv('chineserulers.csv', function(error,data) {
    if(error) throw error;
    console.log(data);

    data.forEach(function(d) {
        d.term = +d.term;
        d.name = d.name;
        console.log(d.name, d.term);
    });

    // data.sort(function(a,b) {
    //     return b.term - a.term;
    // });

    // specify domains
    xScale.domain(data.map(function(d) { return d.name; }));
    yScale.domain([0, d3.max(data, function(d) { return d.term; })]);

    // draw the bars
    let bar = svg.selectAll('.bar')
        .data(data)
        .enter()
        .append('g')
        .attr('class', 'bar');

    bar.append('rect')
        .attr('x', function(d) { return xScale(d.name); })
        .attr('y', function(d) { return yScale(d.term); })
        .attr('width', xScale.bandwidth())
        .attr('height', function(d) { return height - yScale(d.term); });

    // draw the xAxis
    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

    // draw the yAxis
    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

    let xLabels = svg.select('.x')
        .selectAll('text')
        .attr('transform', 'rotate(-30)')
        .attr('dx', '-0.5em')
        .attr('dy', '0.25em')
        .style('text-anchor', 'end')
        .style('font-weight', 'bold');

    let yLabels = svg.select('.y')
        .selectAll('text')
        .attr('dx', '-0.5em');

    // label the bars
    bar.append('text')
        .text(function(d) { return d.years + ' years, ' + d.days + ' days'; })
        .attr('x', function(d) { return xScale(d.name) + xScale.bandwidth()/2; })
        .attr('y', function(d) { return yScale(d.term) - 5; })
        .style('text-anchor', 'middle');

    // put a title and subtitle
    svg.append('text')
        .attr('class', 'title')
        .text(title)
        .style('text-anchor', 'middle')
        .attr('x', width/2)
        .attr('y', 0);

    svg.append('text')
        .attr('class', 'subtitle')
        .text(subtitle)
        .style('text-anchor', 'middle')
        .attr('x', width/2)
        .attr('y', 20);

});