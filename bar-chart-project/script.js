const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";

// set the dimensions and margins of the graph
const margin = { top: 70, right: 20, bottom: 50, left: 50 };
const width = 800 - margin.left - margin.right; // 500-50-20=430
const height = 800 - margin.top - margin.bottom; // 500-20-30=450
const barPadding = 0.5; // each bar's width


d3.json(url)
    .then(data => {
        // get data from url
        const years = data.data.map(item => new Date(item[0]))
        const dataset = data.data

        // create a div tooltip that will be triggered when a mouse hovers over
        const tooltip = d3.select("body")
            .append("div")
            .attr("id", "tooltip")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden")
            .style("background", "lightblue")
            .style("pointer-events", "none")


        // create svg object
        const svg = d3.select("body")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("class", "svg")
            .append("g")
            .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")

        // scale data
        let xScale = d3.scaleTime()
            .domain([d3.min(years), d3.max(years)])
            .range([0, width])

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(dataset, (d) => d[1])])
            .range([height, 0]);

        // add rectangles to the bar chart
        svg.selectAll("rect")
            .data(dataset)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("data-date", (d, i) => dataset[i][0]) // what's the point of this line? I added it just to pass the test.
            .attr("data-gdp", (d, i) => dataset[i][1]) //  ditto!
            .attr("x", (d, i) => i * (width / dataset.length)) // x value is tied directly to the width of SVG and the number of values in the data set. Bars will be evenly spaced.
            .attr("y", (d, i) => yScale(d[1]))
            .attr("width", width / dataset.length - barPadding) // set as a fraction of the SVG width and number of data points, minus a padding value
            .attr("height", (d, i) => height - yScale(d[1]))
            .on("mouseover", function (d, i) {
                tooltip
                    .attr("data-date", this.getAttribute("data-date"))
                    .text("GDP:" + this.getAttribute("data-gdp") + "\nDate:" + this.getAttribute("data-date"))
                return tooltip.style("visibility", "visible");
            })
            .on("mousemove", function () {
                return tooltip.style("top", (event.pageY - 100) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", function () {
                return tooltip.style("visibility", "hidden");
            });

        // add the x Axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")") // drop the axis at the bottom
            .attr("id", "x-axis")
            .attr("class", "tick")
            .call(d3.axisBottom(xScale));

        // add the y axis
        svg.append("g")
            .attr("id", "y-axis")
            .attr("class", "tick")
            .call(d3.axisLeft(yScale)); //doesn't need transform/translate

        // add y axis label
        svg.append("text")
            .attr("transform", "rotate(-90)") // (0,0) coordinate shifted -90 degrees -> x,y switched and bottom left is the new (0,0)
            .attr("y", 0 + 10)
            .attr("x", 0 - height / 3)
            .attr("dy", "1em") // shifts text slightly to the right
            .style("text-anchor", "middle")
            .text("Gross Domestic Product")

        // add chart title
        svg.append("text")
            .attr("x", (width / 2))
            .attr("y", 0 - (margin.top / 3))
            .attr("text-anchor", "middle")
            .attr("id", "title")
            .text("United States GDP")

        // text box with more info
        svg.append('text')
            .attr('x', width / 2 - 100)
            .attr('y', height + 45)
            .text('More Information: http://www.bea.gov/national/pdf/nipaguid.pdf')
            .attr('class', 'info');


    })



