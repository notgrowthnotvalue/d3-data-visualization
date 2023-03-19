const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

// set the dimensions and margins of the graph
const margin = { top: 70, right: 20, bottom: 50, left: 70 },
    width = 600 - margin.left - margin.right, // 710
    height = 600 - margin.top - margin.bottom; // 680

// a category scale of colors
// d3.schemeCategory10 uses 10 different hues
const color = d3.scaleOrdinal(d3.schemeCategory10)

// create svg and place it at top left
const svg = d3.select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right) // 800+70+70=940
    .attr("height", height + margin.top + margin.bottom) // 
    .attr("class", "svg")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

// add chart title
svg.append("text")
    .attr("x", (width / 2))
    .attr("y", 0 - (margin.top / 2))
    .attr("text-anchor", "middle")
    .attr("id", "title")
    .text("Doping in Professional Bicycle Racing")

// add chart subtitle
svg
    .append("text")
    .attr("id", "subtitle")
    .attr("x", (width / 2))
    .attr("y", 0 - 10)
    .attr("text-anchor", "middle")
    .attr("id", "subtitle")
    .text("35 Fastest times up Alpe d'Huez");

// create a div tooltip that will be triggered when a mouse hovers over
const tooltip = d3.select("body")
    .append("div")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .style("background", "lightblue")
    .style("pointer-events", "none");

// get data from url	
d3.json(url)
    .then(data => {
        // convert string into date object. Note .forEach changes the original array 
        data.forEach(d => {
            let parsedTime = d.Time.split(':') // convert string into array
            d.Time = new Date(1900, 0, 1, 0, parsedTime[0], parsedTime[1])  // create dummy date object. You only care about minutes and seconds, so use any year, month, day, and hour
        })

        // scale x axis linear
        var x = d3.scaleLinear()
            .domain([d3.min(data, d => d.Year - 1), d3.max(data, d => d.Year + 1)]) // substracting and adding "1" to avoid the circles appearing on the axes
            .range([0, width])

        // scale y axis time
        const y = d3.scaleTime()
            .domain([d3.max(data, d => d.Time), d3.min(data, d => d.Time)]) // inverted y axis
            .range([height, 0])

        // formatting
        const timeFormat = d3.timeFormat('%M:%S')
        const xAxis = d3.axisBottom(x).tickFormat(d3.format('d'))
        const yAxis = d3.axisLeft(y).tickFormat(timeFormat)

        // add the x axis 
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .attr("id", "x-axis")
            .attr("class", "tick")
            .call(xAxis)

        // add the y axis
        svg.append("g")
            .attr("id", "y-axis")
            .attr("class", "tick")
            .call(yAxis)

        // add circles to svg
        svg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("data-xvalue", d => d.Year) // added to pass the test
            .attr("data-yvalue", d => d.Time) // ditto!
            .attr("cx", d => x(d.Year))
            .attr("cy", d => y(d.Time))
            .attr("r", 5)
            .style('fill', function (d) {
                return color(d.Doping !== '');
            }) // riders with doping allegations will be dark-blue and no doping allegations will be orange
            .on("mouseover", function (event, d) {
                tooltip
                    .attr("data-year", d.Year)
                    .text("Name:" + d.Name + "\nYear:" + d.Year)
                return tooltip.style("visibility", "visible")
            })
            .on("mousemove", function () {
                return tooltip.style("top", (event.pageY) + "px")
                    .style("right", (event.pageX) + "px")
            })
            .on("mouseout", function () {
                return tooltip.style("visibility", "hidden")
            })

        // add y axis label
        svg.append("text")
            .attr("transform", "rotate(-90)") // (0,0) coordinate shifted -90 degrees -> x,y switched and bottom left is the new (0,0)
            .attr("y", 0 - 65)
            .attr("x", 0 - height / 3)
            .attr("dy", "1em") // shifts text slightly to the right
            .style("text-anchor", "middle")
            .text("Time in Minutes")

        // add legend 
        const legendContainer = svg.append('g')
            .attr('id', 'legend')

        const legend = legendContainer.selectAll("#legend")
            .data(color.domain())  // bind the color domain data to the legend
            .enter()
            .append('g')
            .attr('class', 'legend-label')
            .attr('transform', function (d, i) {
                return 'translate(0,' + (height / 2 - i * 20) + ')';
            }) // positions the first element of the legend at height/2; the second element is at height/2 - 20, so they don't overlap

        // add rectangles to the legend container
        legend
            .append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style('fill', color)

        // add text to the legend container
        legend
            .append('text')
            .attr('x', width - 24)
            .attr('y', 9)
            .attr('dy', '.35em')
            .style('text-anchor', 'end')
            .text(function (d) {
                if (d) {
                    return 'Riders with doping allegations';
                } else {
                    return 'No doping allegations';
                }
            });
    })
    .catch(err => console.log(err)) // catch errors