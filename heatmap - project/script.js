// This code is really poorly written. Apologies to the readers. 

const url =
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

// set the dimensions and margins of the graph
const margin = { top: 70, right: 50, bottom: 100, left: 50 },
    width = 1500 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

// create svg and place it at top left
const svg = d3
    .select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("class", "svg")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// add chart title
svg.append("text")
    .attr("x", (width / 2))
    .attr("y", 0 - (margin.top / 2))
    .attr("text-anchor", "middle")
    .attr("id", "title")
    .text("Monthly Global Land-Surface Temperature")

// add chart subtitle
svg
    .append("text")
    .attr("id", "subtitle")
    .attr("x", (width / 2))
    .attr("y", 0 - 10)
    .attr("text-anchor", "middle")
    .attr("id", "description")
    .text("1753 - 2015: base temperature 8.66 \u00B0C");

// add y axis label
svg.append("text")
    .attr("transform", "rotate(-90)") // (0,0) coordinate shifted -90 degrees -> x,y switched and bottom left is the new (0,0)
    .attr("x", 0 - height / 2)
    .attr("y", 0 - 50)
    .attr("dy", "1em") // shifts text slightly to the right
    .style("text-anchor", "middle")
    .text("Months")

// add x axis label
svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 50)
    .attr("dy", "1em") // shifts text slightly to the right
    .style("text-anchor", "middle")
    .text("Year")

// get data from url 
d3.json(url).then((data) => {
    //console.log(data)

    // labels of row and columns
    const Cols = data.monthlyVariance.map((d) => d.year); // all years
    const uniqueCols = [...new Set(Cols)]; // unique values for year
    const myCols = uniqueCols.filter((d) => d % 10 === 0) // filter to only include divisiable by 10
    const myRows = data.monthlyVariance.map((d) => d.month -= 1);
    const myVals = data.monthlyVariance.map((d) => d.variance + data.baseTemperature)
    //console.log(myVals);

    // build x scale and axis
    const x = d3.scaleBand() // creates a scale for positioning discrete bands of data along an axis
        .domain(Cols)
        .range([0, width])
        .padding(0)

    svg.append('g')
        .attr("id", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickValues(myCols)) // x axis will only have ticks for every decade

    // build y scale and axis
    const y = d3.scaleBand()
        .domain(myRows)
        .range([0, height])
        .padding(0)

    svg.append('g')
        .attr("id", "y-axis")
        .call(d3
            .axisLeft(y)
            .tickValues(y.domain())
            .tickFormat(function (month) {
                var date = new Date(0);
                date.setUTCMonth(month);
                var format = d3.utcFormat('%B');
                return format(date);
            }))

    // Create color scale
    const colorScale = d3
        .scaleSequential() // Sequential scales are used to map continuous input domains to continuous output ranges, such as color gradients.
        .interpolator(d3.interpolateRainbow) // sets the color interpolation method for the scale
        .domain([0, d3.max(data.monthlyVariance, (d) => d.variance + data.baseTemperature)]);  // sets the input domain for the scale. In this case, the domain starts from 0 and goes up to the maximum value in the dataset

    // Create the tooltip
    const tooltip = d3.select(".tooltip").attr("id", "tooltip");

    // build the heatmap chart
    svg.selectAll()
        .data(data.monthlyVariance, d => d.year + ':' + d.month) //  binds the data data.monthlyVariance to the selection, and specifies the key function d => d.year+':'+d.month to determine the key for each data element. The key function concatenates the year and month properties of each data element with a colon separator, which serves as the unique key for each element.
        .enter()
        .append("rect")
        .attr("class", "cell")
        .attr("x", d => x(d.year))
        .attr("y", d => y(d.month))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .attr("data-month", d => d.month) // added to pass the test
        .attr("data-year", d => d.year) // ditto!
        .attr("data-temp", d => d.variance + data.baseTemperature) // ditto!
        .attr("fill", (d) => colorScale(d.variance))
        .on("mouseover", (event, d) => {
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip
                .attr('data-year', d.year)
                .html(`Year: ${d.year}</br> Month: ${d.month}</br>  Variance: ${formatNumber(d.variance)}\u00B0C</br>  Temperature:${formatNumber(d.variance + data.baseTemperature)}\u00B0C`,)
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY - 10 + "px");
        })
        .on("mouseout", (event, d) => {
            tooltip.style("opacity", 0)
        })

    // add legend 
    var formatPercent = d3.format(".0%"),
        formatNumber = d3.format(".1f");

    var threshold = d3.scaleThreshold()
        .domain([0.11, 0.22, 0.33, 0.50])
        .range(["#6e7c5a", "#a0b28f", "#d8b8b3", "#b45554", "#760000"]);

    var xsmall = d3.scaleLinear()
        .domain([0, 1])
        .range([0, 540]);

    var smallxAxis = d3.axisBottom(xsmall)
        .tickSize(23)
        .tickValues(threshold.domain())
        .tickFormat(function (d) { return d === 0.5 ? formatPercent(d) : formatNumber(100 * d); });

    var gg = d3.select("svg").append("g").attr("id", "legend").attr("transform", "translate(" + 50 + "," + 650 + ")").call(smallxAxis);

    gg.select(".domain")
        .remove();

    gg.selectAll("rect")
        .data(threshold.range().map(function (color) {
            var d = threshold.invertExtent(color);
            if (d[0] == null) d[0] = xsmall.domain()[0];
            if (d[1] == null) d[1] = xsmall.domain()[1];
            return d;
        }))
        .enter().insert("rect", ".tick")
        .attr("height", 23)
        .attr("x", function (d) { return xsmall(d[0]); })
        .attr("width", function (d) { return xsmall(d[1]) - xsmall(d[0]); })
        .attr("fill", function (d) { return threshold(d[0]); });

    gg.append("text")
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")
        .attr("y", -5)
        .text("Percentage of halturshiks");


})
    .catch(err => console.log(err))
