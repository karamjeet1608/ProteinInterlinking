/* const d3 = require('d3') */
var width = window.innerWidth
var height = window.innerHeight
var nodes =[]


d3.json('http://localhost:3500/api/proteinlist',function(error, data){
    console.log(data)
    nodes =data;


var svg = d3.select('svg')
svg.attr('width', width).attr('height', height)


// simulation setup with all forces
var simulation = d3
.forceSimulation()
.force('charge', d3.forceManyBody().strength(-10))
.force('center', d3.forceCenter(width/2, height/2))

function getNodeColor(node) {
return node.level === 1 ? 'red' : 'Blue'
}

function radiusval(){
var randomnumber=Math.floor((Math.random() * 8) + 1)
    return randomnumber
}

var nodeElements = svg.append("g")
.attr("class", "nodes")
.selectAll("circle")
.data(nodes)
.enter().append("circle")
    .attr("r", radiusval)
    .attr("fill", getNodeColor)

var textElements = svg.append("g")
.attr("class", "texts")
.selectAll("text")
.data(nodes)
.enter().append("text")
    .text(function (nodes) { return  nodes.name })
    .attr("font-size", 15)
    .attr("dx", 15)
    .attr("dy", 4)

simulation.nodes(nodes).on('tick', () => {
    nodeElements
    .attr('cx', function (node) { return node.x })
    .attr('cy', function (node) { return node.y })
    textElements
    .attr('x', function (node) { return node.x })
    .attr('y', function (node) { return node.y })
    })
})
