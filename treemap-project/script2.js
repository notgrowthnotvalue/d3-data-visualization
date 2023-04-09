const kickstarter_url = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json"
const movies_url = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json"
const games_url = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json";
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

const tooltip = d3.select("body")
    .append("div")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("background", "lightblue")
    .style("pointer-events", "none")
    .style("opacity", 0)

const margin = { top: 200, right: 70, bottom: 100, left: 70 },
    width = 1200 - margin.left - margin.right,
    height = 900 - margin.top - margin.bottom;

const svg = d3
    .select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("class", "svg")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// add title
const title = d3
    .select("svg")
    .append("text")
    .attr("x", width / 2)
    .attr("y", 140)
    .attr("text-anchor", "middle")
    .attr("id", "title")
    .text("Movie Sales")
    .style("font-size", "53px")

// add description
const subtitle = d3
    .select("svg")
    .append("text")
    .attr("x", width / 2)
    .attr("y", 175)
    .attr("text-anchor", "middle")
    .attr("id", "description")
    .text(
        " Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)"
    );

// read json data
d3.json(movies_url).then(function (data) {

    // Give the data to this cluster layout:
    const root = d3.hierarchy(data, (d) => d.children)
        .sum((d) => d.value) // Here the size of each leave is given in the 'value' field in input data
        .sort((d1, d2) => {
            return d2.value - d1.value
        })

    // Then d3.treemap computes the position of each element of the hierarchy
    d3.treemap()
        .size([width, height])
        .padding(2)
        (root)


    // use this information to add rectangles:
    svg
        .selectAll("rect")
        .data(root.leaves())
        .join("rect")
        .attr('x', function (d) { return d.x0; })
        .attr('y', function (d) { return d.y0; })
        .attr('width', function (d) { return d.x1 - d.x0; })
        .attr('height', function (d) { return d.y1 - d.y0; })
        .attr("data-name", d => d["data"]["name"])
        .attr("data-category", d => d["data"]["category"])
        .attr("data-value", d => d["data"]["value"])
        .style("stroke", "black")
        .attr("class", "tile")
        .on('mouseover', function (event, d) {
            tooltip
                .attr("data-value", d.data.value)
                .transition()
                .style('opacity', 1)
            tooltip.html('Name: ' + d.data.name + '<br />' + 'Revenue: $' + d.data.value)
                .style("left", event.pageX + "px")
                .style("top", event.pageY - 30 + "px")
        })
        .on('mouseout', function () {
            tooltip.transition()
                .style('opacity', 0)
        })
        .attr("fill", d => colorScale(d["data"]["category"]))


    // and to add the text labels
    svg
        .selectAll("text")
        .data(root.leaves())
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", function (d) { return d.x0 + 5 })    // +10 to adjust position (more right)
        .attr("y", function (d) { return d.y0 + 20 })    // +20 to adjust position (lower)
        .text(function (d) { return d.data.name })
        .attr("font-size", "12px")

    const category = Array.from(d3.group(root.leaves(), d => d.data.category).keys());

    //console.log(category)

    //LEGEND
    svg.append("g")
        .attr("transform", "translate(1100, 200)")
        .attr("id", "legend")
        .selectAll("rect")
        .data(category)
        .enter()
        .append("rect")
        .attr("class", "legend-item")
        .attr("fill", d => colorScale(d))
        .attr("y", (d, i) => i * 40)
        .attr("width", 30)
        .attr("height", 30);

    svg.append("g")
        .attr("transform", "translate(1130, 215)")
        .selectAll("text")
        .data(category)
        .enter()
        .append("text")
        .attr("x", 1)
        .attr("y", (d, i) => 1 + i * 40)
        .attr("style", "font-size:11px;text-transform : uppercase")
        .text(d => d)

})