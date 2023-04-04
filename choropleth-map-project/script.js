const educ_url =
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const county_url =
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

const colors = ["#9CC3D5", "#5F8FB4", "#234975", "#B5D6E6"];

const margin = { top: 100, right: 70, bottom: 100, left: 70 },
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

const tooltip = d3.select("body")
    .append("div")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("background", "lightblue")
    .style("pointer-events", "none")
    .style("opacity", 0)

// add title
svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 0 - margin.top / 2)
    .attr("text-anchor", "middle")
    .attr("id", "title")
    .text("United States Educational Attainment")
    .attr("font-weight", 800)
    .style("font-size", "51px");

// add description
svg
    .append("text")
    .attr("id", "subtitle")
    .attr("x", width / 2)
    .attr("y", 0)
    .attr("text-anchor", "middle")
    .attr("id", "description")
    .text(
        " Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)"
    );

// add legend
svg
    .append('g')
    .attr("id", "legend")
    .attr("transform", "translate(650,27)")
    .selectAll("rect")
    .data(colors)
    .join("rect")
    .attr("x", (d, i) => i * 50)
    .attr("width", 50)
    .attr("height", 15)
    .attr("fill", d => d)

svg
    .append("g")
    .attr("transform", "translate(710,27)")
    .selectAll("text")
    .data(["20%", "60%", "65%"])
    .enter()
    .append("text")
    .text((d) => d)
    .attr("style", "font-size:12px; fill:red")
    .attr("x", (d, i) => i * 50)
    .attr("y", (d, i) => height - (3 * d) - 5);

// The data from all the JSON files will be available here as an array
Promise.all([d3.json(county_url), d3.json(educ_url)])
    .then((data) => {
        let county = data[0];
        let education = data[1];

        // render the map
        svg
            .append("g")
            .selectAll("path")
            .data(topojson.feature(county, county.objects.counties).features)
            .join("path")
            .attr("d", d3.geoPath())
            .attr("class", "county")
            .attr("fill", (d) => {
                let id = d.id;
                let countydata = education.find((item) => {
                    return item["fips"] === id;
                });
                let percent = countydata.bachelorsOrHigher;
                return percent <= 20
                    ? colors[0]
                    : percent <= 40
                        ? colors[1]
                        : percent <= 60
                            ? colors[2]
                            : colors[3];
            })
            .attr("data-fips", (d) => d.id)
            .attr("data-education", (d) => {
                let id = d.id;
                let countydata = education.find((item) => {
                    return item["fips"] === id;
                })
                let percent = countydata.bachelorsOrHigher;
                return percent;
            })


        // Position the tooltip next to the mouse cursor
        svg.selectAll('.county')
            .on('mouseover', (event, d) => {
                const fips = d3.select(event.target).attr('data-fips');
                const education = d3.select(event.target).attr('data-education');
                tooltip
                    .attr("data-education", education)
                    .style('left', event.pageX + 'px')
                    .style('top', event.pageY + 'px')
                    .style('opacity', 0.9)
                    .html(`<p>County: ${d.properties.name}</p><p>Fips Code: ${fips}</p><p>Education: ${education}%</p>`);
            })
            .on('mouseout', () => {
                tooltip.style('opacity', 0);
            });


    })
    .catch((err) => console.log(err));
