// Tutorial by user Ganesh H on Youtube.com
const colorScale = d3.scaleOrdinal(d3.schemeCategory10)

let movieDataUrl = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json';

let movieData

let tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .attr("id", "tooltip")
    .style("visibility", "hidden");

let canvas = d3.select("#canvas")

let drawTreeMap = () => {

    // create a hierarchy
    let hierarchy = d3.hierarchy(movieData, (node) => {
        return node['children']
    }).sum((node) => {
        return node['value']
    }).sort((node1, node2) => {
        return node2['value'] - node1['value']
    })

    // create treemap method
    let createTreeMap = d3.treemap()
        .size([1000, 600]);
    // create treemap
    createTreeMap(hierarchy)

    let movieTiles = hierarchy.leaves()
    console.log(movieTiles)
    /** 
    x0, y0 - coordinates where the top left corner of tile should go
    x1, y1 - coordinates where the bottom right corner of tile goes  
    **/

    let block = canvas.selectAll('g')
        .data(movieTiles)
        .enter()
        .append('g')
        // setting x and y coordinates for each g
        .attr('transform', (movie) => {
            return 'translate(' + movie['x0'] + ',' + movie['y0'] + ')'
        })

    block.append('rect')
        .attr('class', 'tile')
        .attr('fill', (movie) => {
            return colorScale(movie['data']['category'])
        })
        .attr('data-name', (movie) => {
            return movie['data']['name']  // adding property data-name
        })
        .attr('data-category', (movie) => {
            return movie['data']['category'] // adding property data-category
        })
        .attr('data-value', (movie) => {
            return movie['data']['value'] // adding property data-value
        })
        // setting height and width for each rectangle
        .attr('width', (movie) => {
            return movie['x1'] - movie['x0']
        })
        .attr('height', (movie) => {
            return movie['y1'] - movie['y0']
        })
        .on('mouseover', (movie) => {
            tooltip.transition()
                .style('visibility', "visible")
            tooltip.html('Name: ' + movie['data']['name'] + '<br />' + 'Revenue: $' + movie["data"]["value"])
            tooltip.attr("data-value", movie['data']['value'])
        })
        .on('mouseout', (movie) => {
            tooltip.transition()
                .style('visibility', 'hidden')
        })

    block.append('text')
        .text((movie) => {
            return movie['data']['name']
        })
}

d3.json(movieDataUrl).then(
    (data, error) => {
        if (error) {
            console.log(error)
        } else {
            movieData = data
            console.log(movieData)
            drawTreeMap()
        }
    }
)