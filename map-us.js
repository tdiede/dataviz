"use strict";

(function() {

const width = 1200;
const height = 500;


let projection = d3.geoAlbersUsa()
   .translate([width/2, height/2])
   .scale([1000]);

let path = d3.geoPath()
    .projection(projection);

let main = d3.select('body').append('div')
    .attr('class', 'map');

// main body svg element
let svg = main.append('svg')
    .attr("width", width)
    .attr("height", height);

let color = d3.scaleOrdinal()
    .range(["red","blue","purple"]);

// tooltip
let tip = main.append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0.0);

d3.csv("senate.csv", function(data) {

    d3.json("us-states.json", function(json) {
        // console.log(json);

    for(let j=0; j<json.features.length; j++)  {
        let jsonState = json.features[j].properties.name;
        let senators = [];
        let parties = [];

        for(let i=0; i<data.length; i++) {
            let senatorState = data[i].statename;
            let senator = data[i];
            let party = data[i].party;

            if(senatorState === jsonState) {
                senators.push(senator);
                parties.push(party);
            }
        }

        json.features[j].properties.senators = senators;
        json.features[j].properties.parties = parties;
    }

    console.log(json.features[0].properties);

    svg.selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("stroke", "#FFF")
        .style("stroke-width", "1")
        .style("fill", function(d) {
            let twoParties = d.properties.parties;
            if(twoParties.includes('R') && twoParties.includes('D') || twoParties.includes('I')) {
                return color('purple');
            } else if(twoParties.includes('R')) {
                return color('red');
            } else if(twoParties.includes('D')) {
                return color('blue');
            } else {
                return "rgb(213,222,217)";
            }
        });
    });
});

})();
