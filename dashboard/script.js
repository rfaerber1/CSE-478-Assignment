const margin = { top: 40, right: 30, bottom: 50, left: 60 };
    const width = 425 - margin.left - margin.right;
    const width2 = 525 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("background-color", "rgba(0, 0, 0, 0.7)")
    .style("color", "white")
    .style("padding", "5px");

// function to add axis label to an svg element
function addAxisLabel(svg, text, x, y, anchor = "middle", rotation = 0) {
    svg.append("text")
      .attr("transform", `rotate(${rotation})`)
      .attr("x", x)
      .attr("y", y)
      .attr("text-anchor", anchor)
      .attr("fill", "black")
      .style("font-size", "12px")
      .text(text);
}

// function to add axis label to an svg element
function addTitle(svg, text, x, y, anchor = "middle", rotation = 0) {
    svg.append("text")
      .attr("transform", `rotate(${rotation})`)
      .attr("x", x)
      .attr("y", y)
      .attr("text-anchor", anchor)
      .attr("fill", "black")
      .style("font-size", "16px")
      .text(text);
}

// TODO: Load CSV file using d3.csv
// loading and parsing the csv data
d3.csv("../data/cleaned_data.csv", d3.autoType).then(data => {
    const areas = [...new Set(data.map(d => d.Geography))].sort();
    const years = [...new Set(data.map(d => d.Year))].sort();
    const  allEthnicities = [...new Set(data.map(d => d.Dimension))].sort();
    // two race/ethnicity dimensions only present in 2009-10 (will cuase confusion through lack of continuity)
    const ethnicities = allEthnicities.filter(item => !["American Indian or Alaska Native, Non-Hispanic", "Asian, Non-Hispanic"].includes(item));

    // Color Scale for Race/Ethnicity Values
    let colorScale = d3.scaleOrdinal()
      .domain(ethnicities) // categories if I want colors to stay the same no matter whats selected
      .range(["#26547c", "#ef476f", "#ffd166", "#06d6a0"]); // colors

    // reorder months to reflect order within flu season
    data.forEach(d => {
      // Re-map months: Jul (7) → 0, ..., May (5) → 7
      d.seasonMonth = (d.Month >= 7) ? d.Month - 7 : d.Month + 5;
    });
    const fluMonths = ["Jul", "Aug", "Sept", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"];
  
    let selectedVaccine = 'Seasonal Influenza'; // not all values for every year/area (don't change)
    //'Seasonal Influenza' (present for all years (no reason to change, only value with continuity)
    //'Any Influenza Vaccination, Seasonal or H1N1' (only appears in 2009-10)
    //'Influenza A (H1N1) 2009 Monovalent' (only appears in 2009-10)

    // get max estimate value, set up consistent axis for estimates
    const maxEstimate = d3.max(data.filter(d => d.Vaccine == selectedVaccine).map(d => d["Estimate (%)"]));
    // max value for axis
    const estimateMax = (Math.ceil(maxEstimate / 5)) * 5

    // Dashboard Filter Interactions
    // Initial Values
    let selectedYear = 2018;
    let selectedArea = "Arizona";
    let selectedEthnicity = ethnicities;
    let selectedEstimate = "Average";
  
    // Setting up Filter Interactions
    d3.select("#areaSelect")
      .selectAll("option")
      .data(areas)
      .join("option")
      .attr("value", d => d)
      .text(d => d);
    d3.select("#areaSelect").property("value", selectedArea);
  
    d3.select("#areaSelect").on("change", function() {
      selectedArea = this.value;
      updateAll();
    });

    d3.select("#yearSelect")
      .selectAll("option")
      .data(years)
      .join("option")
      .attr("value", d => d)
      .text(d => `${d}–${(d + 1).toString().slice(-2)}`);
    d3.select("#yearSelect").property("value", selectedYear);
  
    d3.select("#yearSelect").on("change", function() {
      selectedYear = parseInt(this.value);
      updateAll();
    });

    d3.select("#estimateSelect")
      .selectAll("option")
      .data(["Average", "Maximum"])
      .join("option")
      .attr("value", d => d)
      .text(d => d);
    d3.select("#estimateSelect").property("value", selectedEstimate);
  
    d3.select("#estimateSelect").on("change", function() {
      selectedEstimate = this.value;
      updateAll();
    });

    function updateCategories() {
      d3.select("#buttonContainer")
      .selectAll("button")
      .data(ethnicities)
      .join("button")
      .attr("value", d => d)
      .text(d => d)
      .style("background-color", d => selectedEthnicity.includes(d) ? "white" : "lightgray")
      .on("click", function(event, d) {
        if (selectedEthnicity.includes(d) && selectedEthnicity.length > 1) {
          selectedEthnicity = selectedEthnicity.filter(e => e !== d).sort(); // Remove
        } else if (!selectedEthnicity.includes(d)){
          selectedEthnicity.push(d); // Add
          selectedEthnicity.sort();
        }
        updateAll();
        console.log("Selected ethnicities:", ethnicities);
      });
    }
  
    // setting up SVG elements linked to index.html
    const chart = d3.select("#chart").append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const svgLine = d3.select("#lineChart").append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const svgYearLine = d3.select("#lineYearChart").append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const globalLegend = d3.select("#legend").append("g");
  
    // function to update all charts
    function updateAll() {
      d3.select("#yearSelect").property("value", selectedYear);
      //updateColorScale(); not needed, now stays the same
      updateCategories();
      drawLegend();
      drawBarChart();
      drawLineChart();
      drawYearLineChart();
    }
  
    // Draw Legend
    function drawLegend() {
      globalLegend.selectAll("*").remove();
  
      // TODO: Add a legend showing color-category mapping
      const lx = 2;
      const ly = 13;
      const lWidth = 20;
      const lHeight = 20;
      const pad = 10;
  
      const legend = globalLegend.selectAll(".legend").data(colorScale.domain());
  
      globalLegend.append("text")
        .attr("x", lx)
        .attr("y", ly)
        .text("Legend");
  
      console.log("Checking", globalLegend.node().getAttribute("transform"));
  
      legend.enter().append("rect")
        .data(selectedEthnicity) //if I want colors to stay the same no matter whats selected
        .attr("x", `${lx}`)
        .attr("y", (d, i) => `${ly + pad + 25 * i}`)
        .attr("width", lWidth)
        .attr("height", lHeight)
        .style("fill", d => colorScale(d));
  
      legend.enter().append("text")
        .data(selectedEthnicity) //if I want colors to stay the same no matter whats selected
        .attr("x", `${lx + 30}`)
        .attr("y", (d, i) => `${ly + (pad+10) + 25 * i}`)
        .attr("dy", "0.35em")
        .text(d => d);
  
      console.log("SVG width:", globalLegend.attr("width"));
      console.log("SVG height:", globalLegend.attr("height"));
    }
  
    // Draw Line chart showing data over the years for given area
    function drawYearLineChart() {
      // filtered data based on user interaction
      const areaData = data
        .filter(d => d.Geography === selectedArea)
        .filter(d => selectedEthnicity.includes(d.Dimension))
        .filter(d => d.Vaccine === selectedVaccine)
        .sort((a, b) => d3.ascending(a.Year, b.Year))
        .sort((a, b) => d3.ascending(a.Dimension, b.Dimension));
  
      // using areaData get data for chart: year, dimension, cummulative year estimate based on average or max value
      const estimateByYear = [];
      const grouped = d3.group(areaData, d => d.Year, d => d.Dimension);
      for (const [year, dimMap] of grouped) {
        for (const [dimension, values] of dimMap) {
          estimateByYear.push({
            Year: year,
            Dimension: dimension,
            Estimate: selectedEstimate=="Average" ? d3.mean(values, v => v["Estimate (%)"]).toFixed(2) : d3.max(values, v => v["Estimate (%)"]).toFixed(2)
          });
        }
      }
  
      // sort data to be in correct order based on year
      estimateByYear.sort((a, b) => d3.ascending(a.Year, b.Year));
      const groupedData = d3.group(estimateByYear, d => d.Dimension);
  
      // clear chart
      svgYearLine.selectAll("*").remove();

      // scale x-axis
      const x = d3.scaleBand()
        .domain(d3.range(d3.min(estimateByYear.map(d => d.Year)), d3.max(estimateByYear.map(d => d.Year))+1))
        .range([0, width2])
        .padding(0.2);
      // scale y-axis
      const y = d3.scaleLinear()
        .domain([
          0,
          estimateMax
        ])
        .range([height, 0]);
  
      // setting x-axis tick marks / values
      svgYearLine.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d => `${d}–${(d + 1).toString().slice(-2)}`))
        .selectAll("text").attr("fill", "black")
        .attr("transform", "translate(-20, 15), rotate(-45)");
      // setting y-axis tick marks / values
      svgYearLine.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text").attr("fill", "black");

      // rectangles showing what year is selected/mouse is hovering over
      svgYearLine.selectAll("yearRect")
        .data(x.domain())
        .join("rect")
        .attr("x", d => x(d))
        .attr("y", 0)
        .attr("width", x.bandwidth())
        .attr("height", height)
        .attr("fill", "lightgrey")
        .attr("opacity", d => d === selectedYear ? 1 : 0)
        .on("mouseover", function(event, d) {
            if (d !== selectedYear){
                d3.select(this).attr("opacity", 0.5);
            }
        })
        .on("mouseout", function(event, d) {
            if (d !== selectedYear){
                d3.select(this).attr("opacity", 0);
            }
        })
        .on("click", function(event, d) {
          selectedYear = d;
          updateAll();
        });
  
  
      // plotting the data
      for (const [dimension, values] of groupedData) {
        // creating lines using path for line chart
        svgYearLine.append("path")
          .datum(values)
          .attr("fill", "none")
          .attr("stroke", d => colorScale(dimension))
          .attr("stroke-width", 2)
          .attr("d", d3.line()
            .x(d => x(d.Year) + 0.5 * x.bandwidth())
            .y(d => y(d["Estimate"])));

        // adding circles onto data points
        svgYearLine.selectAll(`circle_${dimension}`)
          .data(values)
          .join("circle")
          .attr("cx", d => x(d.Year) + 0.5 * x.bandwidth())
          .attr("cy", d => y(d["Estimate"]))
          .attr("r", 4)
          .attr("fill", d => colorScale(d.Dimension))
          .on("mouseover", function(event, d) {
            tooltip.html(`Group: ${d.Dimension}<br>Season: ${d.Year}–${(d.Year + 1).toString().slice(-2)}<br>Estimate (%): ${d["Estimate"]}`)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 10) + "px")
              .style("opacity", 1);
          })
          .on("mouseout", function() {
            tooltip.style("opacity", 0);
          });
      }

      // add title
      addTitle(svgYearLine, `Estimated Vaccinations in ${selectedArea} by Flu Year/Season`, (width2)/2-margin.left/4, -15);
      // adding axis labels
      addAxisLabel(svgYearLine, "Year/Season", width2 / 2, height + 50);
      addAxisLabel(svgYearLine, `${selectedEstimate} Estimate (%)`, -height / 2, -margin.left*(2/3), "middle", -90);
    }
  
    function drawLineChart() {
      const areaData = data
        .filter(d => d.Geography === selectedArea)
        .filter(d => d.Year === selectedYear)
        .filter(d => selectedEthnicity.includes(d.Dimension))
        .filter(d => d.Vaccine === selectedVaccine)
        .sort((a, b) => d3.ascending(a.seasonMonth, b.seasonMonth))
        .sort((a, b) => d3.ascending(a.Dimension, b.Dimension));
  
      console.log(areaData);
      const groupedData = d3.group(areaData, d => d.Dimension);
  
      svgLine.selectAll("*").remove();
  
      // scale x-axis
      const x = d3.scaleBand()
      .domain(d3.range(0, fluMonths.length))
      .range([0, width])
      .padding(0.2);

      // scale y-axis
      const y = d3.scaleLinear()
        .domain([
          0,
          estimateMax
        ])
        .range([height, 0]);

      // setting x-axis tick marks / values
      svgLine.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(x => fluMonths[x]))
        .selectAll("text").attr("fill", "black");
      // setting y-axis tick marks / values
      svgLine.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text").attr("fill", "black");

      // if no data for given area/year
      if (areaData.length === 0){
        svgLine.append("text")
        .attr("x", 10)
        .attr("y", height/2)
        .text(`No Data for ${selectedArea} in ${selectedYear}–${(selectedYear + 1).toString().slice(-2)}`);
      }
      // plot data
      else {
        for (const [dimension, values] of groupedData) {
            // creating lines using path for line chart
            svgLine.append("path")
            .datum(values)
            .attr("fill", "none")
            .attr("stroke", d => colorScale(dimension))
            .attr("stroke-width", 2)
            .attr("d", d3.line()
                .x(d => x(d.seasonMonth) + 0.5 * x.bandwidth())//.x(d => x(d.seasonMonth))
                .y(d => y(d["Estimate (%)"])));
            // adding circles onto data points
            svgLine.selectAll(`circle_${dimension}`)
            .data(values)
            .join("circle")
            .attr("cx", d => x(d.seasonMonth) + 0.5 * x.bandwidth())//d => x(d.seasonMonth))
            .attr("cy", d => y(d["Estimate (%)"]))
            .attr("r", 4)
            .attr("fill", d => colorScale(d.Dimension))
            .on("mouseover", function(event, d) {
                tooltip.html(`Group: ${d.Dimension}<br>Month: ${fluMonths[d.seasonMonth]}<br>Estimate (%): ${d["Estimate (%)"]}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px")
                .style("opacity", 1);
            })
            .on("mouseout", function() {
                tooltip.style("opacity", 0);
            });
        }
      }

      // add title
      addTitle(svgLine, `Estimated Vaccinations: ${selectedArea} (${selectedYear}–${(selectedYear + 1).toString().slice(-2)})`, width / 2 -margin.left/4, -15);  
      // adding axis labels
      addAxisLabel(svgLine, "Month", width / 2, height + 40);
      addAxisLabel(svgLine, "Estimate (%)", -height / 2, -40, "middle", -90);
    }
  
    function drawBarChart() {
      // get data according to selected year and area
      const topData = data
        .filter(d => d.Geography === selectedArea)
        .filter(d => d.Year === selectedYear)
        .filter(d => selectedEthnicity.includes(d.Dimension))
        .filter(d => d.Vaccine === selectedVaccine)
        .sort((a, b) => b.seasonMonth - a.seasonMonth)
        .sort((a, b) => d3.ascending(a.Dimension, b.Dimension));
  
      chart.selectAll("*").remove();
      // Set up x and y scales
      // scale x-axis (by names of data)
      const x = d3.scaleBand()
        .domain(d3.range(0, fluMonths.length))
        .range([0, width])
        .padding(0.2);
      const x2 = d3.scaleBand()
        .domain(topData.map(d => d.Dimension))
        .range([0, x.bandwidth()])
        .padding(0.05);
  
      // scale y-axis (linear)
      const y = d3.scaleLinear()
        .domain([d3.max(topData, d => d["Sample Size"]), 0])
        .range([0, height]);
  
      // Add axes using d3.axisBottom and d3.axisLeft
      // y-axis
      chart.append("g").call(d3.axisLeft(y).tickSize(0))
        .selectAll("text").attr("fill", "black");
      // x-axis
      chart.append("g").attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(x => fluMonths[x]))
        .selectAll("text")
        .style("text-anchor", "left")
        .attr("fill", "black");


      // if no data for a given area/year
      if (topData.length === 0){
        chart.append("text")
        .attr("x", 10)
        .attr("y", height/2)
        .text(`No Data for ${selectedArea} in ${selectedYear}–${(selectedYear + 1).toString().slice(-2)}`);
      }
      // plot data
      else {
      // create group by month
      const rects = chart.selectAll(".bars")
        .data(d3.group(topData, d => d.seasonMonth))
        .join("g")
        .attr("class", "month")
        .attr("transform", ([month]) => `translate(${x(+month)}, 0)`);
      // create rects for each group
      rects.selectAll("rect")
        .data(([_, values]) => values)
        .join("rect")
        .attr("class", "bars")
        .attr("x", d => x2(d.Dimension))
        .attr("y", d => y(d["Sample Size"]))
        .attr("width", x2.bandwidth())
        .attr("height", d => y(0) - y(d["Sample Size"]))
        .attr("fill", "#6baed6");
  
      //Color bars by category using a color scale
      chart.selectAll(".bars")
        .attr("fill", d => colorScale(d.Dimension));

        //Add tooltips
      chart.selectAll(".bars")
      .on("mouseover", function(event, d) {
        tooltip.html(`Group: ${d.Dimension}<br>Month: ${fluMonths[d.seasonMonth]}<br>Sample Size: ${d["Sample Size"]}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px")
          .style("opacity", 1);
      })
      .on("mouseout", function() {
        tooltip.style("opacity", 0);
      });
      }
  
      // add title
      addTitle(chart, `Sample Sizes: ${selectedArea} (${selectedYear}–${(selectedYear + 1).toString().slice(-2)})`, width / 2, -15);  
      // add axis labels
      addAxisLabel(chart, "Month", width / 2, height + 40);
      addAxisLabel(chart, "Sample Size", -height / 2, -45, "middle", -90);
    }
  
    // === Initial render ===
    updateAll();
  });