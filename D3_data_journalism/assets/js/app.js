// ==================================================================================================== //
// Set initial / default variables (for svg width/height/margins and inner plot area (width and height), and others)
// ==================================================================================================== //
var svgWidth = 800;
var svgWidthHeighthRatio = (1 / 1.92)
var svgHeight = +svgWidth * +svgWidthHeighthRatio;
// console.log(`${svgWidth} x ${svgHeight}`)

// margin variable
var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

// width & heighth variables (calulated based on above)
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Initial/Default parameters
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// x-axes labels
var healthcareAxesLabel = "Lacks Healthcare (%)";
var smokesAxesLabel = "Smokes (%)";
var obesityAxesLabel = "Obese (%)";

// y-axes labels
var povertyAxesLabel = "In Poverty (%)";
var ageAxesLabel = "Age (Years | Median)";
var incomeAxesLabel = "Household Income ($ | Median)";

// ==================================================================================================== //
// Create div, svg and g (svg group) elements that will hold scatter plot chart, shifting the scatter plot chart by left and top margins
// ==================================================================================================== //
// Select scatter id element and append a div element
var chart = d3.select("#scatter")
    .append("div")
    .classed("chart", true);

// Append an svg element to the chart
var svg = chart.append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);
  
// Append an svg group to the svg element
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// ==================================================================================================== //
// Function used for x-scale var (and to update when x-axis label is clicked on)
// ==================================================================================================== //
function xScale(projectData, chosenXAxis) {
    // Create x-scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(projectData, d => d[chosenXAxis]) * 0.95,
            d3.max(projectData, d => d[chosenXAxis]) * 1.05])
        .range([0, width]);
    return xLinearScale;
};

// ==================================================================================================== //
// Function used for y-scale var (and to update when y-axis label is clicked on)
// ==================================================================================================== //
function yScale(projectData, chosenYAxis) {
    // Create y-scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(projectData, d => d[chosenYAxis]) * 0.95,
            d3.max(projectData, d => d[chosenYAxis]) * 1.05])
        .range([height, 0]);
    return yLinearScale;
};

// ==================================================================================================== //
// Function used for bottom / x-axis (and to update when x-axis label is clicked on)
// ==================================================================================================== //
function renderBottomAxes(newXScale, xAxis) {
    // Create bottom axis
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis
};

// ==================================================================================================== //
// Function used for left / y-axis (and to update when y-axis label is clicked on)
// ==================================================================================================== //
function renderLeftAxes(newYScale, yAxis) {
    // Create left axis
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis
};

// ==================================================================================================== //
// Function used to create scatter plot circles & labels (and to update when x- or y-axis labels are clicked on)
// ==================================================================================================== //
function renderScatterCircles(scatterCirclesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    scatterCirclesGroup.transition()
        .duration(500)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));
    return scatterCirclesGroup;
};

function renderScatterText(scatterTextGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    scatterTextGroup.transition()
      .duration(500)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis]));
    return scatterTextGroup;
};

// ==================================================================================================== //
// Function used to update scatterCirclesGroup with new tooltip when x- or y-axis labels are clicked on
// ==================================================================================================== //
function updateToolTip(chosenXAxis, chosenYAxis, scatterCirclesGroup) {
    if (chosenXAxis === "poverty") {
        var xLabel = "In Poverty:";
        var xValueBonusCur = "";
        var xValueBonusPct = "%";
    }
    else if (chosenXAxis === "income") {
        var xLabel = "Household Income:";
        var xValueBonusCur = "$";
        var xValueBonusPct = "";
    }
    else if (chosenXAxis === "age") {
        var xLabel = "Age:";
        var xValueBonusCur = "";
        var xValueBonusPct = "y.o.";
    }
    else {
        var xLabel = "(unknown):";
        var xValueBonusCur = "??";
        var xValueBonusPct = "??";
    }

    if (chosenYAxis === "healthcare") {
        var yLabel = "Lacks Healthcare:";
    }
    else if (chosenYAxis === "obesity") {
        var yLabel = "Obesity:";
    }
    else if (chosenYAxis === "smokes") {
        var yLabel = "Smokes:";
    }
    else {
        var yLabel = "(unknown):";
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10, 0])
        .html(d => (`<h6>${d.state}</h6>${xLabel} ${xValueBonusCur}${d[chosenXAxis]} ${xValueBonusPct}<br>${yLabel} ${d[chosenYAxis]}%`));
    scatterCirclesGroup.call(toolTip);
    scatterCirclesGroup.on("mouseover", toolTip.show)  // On hover/mouseover event
        .on("mouseout", toolTip.hide);          // On mouseout event
    return scatterCirclesGroup;      
};

// ==================================================================================================== //
// Import the data from the data.csv file
// ==================================================================================================== //
d3.csv("assets/data/data.csv").then(function(projectData, err) {

    // ================================================== //
    // Step 0: Set up error handling if statement
    // ================================================== //
    if (err) throw err;

   // ================================================== //
    // Step 1: Parse the data & cast as number where needed
    // ================================================== //
    projectData.forEach(function(data) {
        data.state = data.state;
        data.abbr = data.abbr;
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
    });

    // ================================================== //
    // Step 2: Create scale functions
    // ================================================== //
    var xLinearScale = xScale(projectData, chosenXAxis);
    var yLinearScale = yScale(projectData, chosenYAxis);

    // ================================================== //
    // Step 3: Create axis functions
    // ================================================== //
    // x-Axis
    var bottomAxis = d3.axisBottom(xLinearScale);

    // y-Axis
    var leftAxis = d3.axisLeft(yLinearScale);

    // ================================================== //
    // Step 4: Add/append axes to the chart
    // ================================================== //
    // x-Axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // y-Axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // ================================================== //
    // Step 5: Create circles & labels for the scatter plot
    // ================================================== //
    var scatterCirclesGroup = chartGroup.selectAll("circle")
        .data(projectData)
        .enter()
        .append("circle")
        .classed("stateCircle", true)
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 12)
        .attr("opacity", "0.5");

    var scatterTextGroup = chartGroup.selectAll(".stateText")
        .data(projectData)
        .enter()
        .append("text")
        .classed("stateText", true)
        .text(d => d.abbr)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .attr("dy", 3.5)
        .attr("font-size", "11px");

    // ================================================== //
    // Step 6: Create x- & y- axes labels
    // ================================================== //
    // x-axes label: Create group for 3 x-axis labels
    var xLabelsGroup = chartGroup.append("g")
        .attr("class", "aText")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")       // this is the value to grab for the event listener
        .classed("active", true)
        .text(povertyAxesLabel);

    var ageLable = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")           // this is the value to grab for the event listener
        .classed("inactive", true)
        .text(ageAxesLabel);

    var incomeLable = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")    // this is the value to grab for the event listener
        .classed("inactive", true)
        .text(incomeAxesLabel);
    
    // y-axes label: Create group for 3 y-axis labels    
    var yLabelsGroup = chartGroup.append("g")
        .attr("class", "aText")
        .attr("transform", "rotate(-90)")

    var healthcareLabel = yLabelsGroup.append("text")
        .attr("x", 0 - (height / 2))
        .attr("y", 0 - margin.left + 60)
        .attr("value", "healthcare")       // this is the value to grab for the event listener
        .classed("active", true)
        .text(healthcareAxesLabel);

    var smokesLable = yLabelsGroup.append("text")
        .attr("x", 0 - (height / 2))
        .attr("y", 0 - margin.left + 40)
        .attr("value", "smokes")           // this is the value to grab for the event listener
        .classed("inactive", true)
        .text(smokesAxesLabel);

    var obesityLable = yLabelsGroup.append("text")
        .attr("x", 0 - (height / 2))
        .attr("y", 0 - margin.left + 20)
        .attr("value", "obesity")           // this is the value to grab for the event listener
        .classed("inactive", true)
        .text(obesityAxesLabel);

    // ================================================== //
    // Step 7: Initialize tooltip on the scatter plot
    // ================================================== //
    var scatterCirclesGroup = updateToolTip(chosenXAxis, chosenYAxis, scatterCirclesGroup);
    var scatterTextGroup = updateToolTip(chosenXAxis, chosenYAxis, scatterTextGroup);

    // ================================================== //
    // Step 8: Create event listeners to update x-axis
    // ================================================== //
    // Update: x-axis
    xLabelsGroup.selectAll("text")
        .on("click", function() {
            // ========================= //
            // Get the value of the selected element
            // ========================= //
            var value = d3.select(this).attr("value");
            // console.log(value);
            // ========================= //
            // if value doesn't equal chosen X Axis, then proceed, otherwise don't update (lack of else statement)
            // ========================= //
            if (value !== chosenXAxis) {
                // ========================= //
                // Update chosenXAxis to selected value
                // ========================= //
                chosenXAxis = value;
                // ========================= //
                // Update xScale for new selected value
                // ========================= //
                xLinearScale = xScale(projectData, chosenXAxis);
                // ========================= //
                // Update xAxis with transition for new selected value
                // ========================= //
                xAxis = renderBottomAxes(xLinearScale, xAxis);

                // ========================= //
                // Update scatter circles and text with new values for new selected value
                // ========================= //
                scatterCirclesGroup = renderScatterCircles(scatterCirclesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
                scatterTextGroup = renderScatterText(scatterTextGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
                
                // ========================= //
                // Update tooltips with new values for new selected value
                // ========================= //
                scatterCirclesGroup = updateToolTip(chosenXAxis, chosenYAxis, scatterCirclesGroup);
                scatterTextGroup = updateToolTip(chosenXAxis, chosenYAxis, scatterTextGroup);

                // ========================= //
                // Update classes to bold if slected ("active") for new selected value
                // ========================= //
                if (chosenXAxis === "age") {
                    ageLable
                        .classed("active", true)
                        .classed("inactive", false);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLable
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === "income") {
                    incomeLable
                        .classed("active", true)
                        .classed("inactive", false);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLable
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false)
                    ageLable
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLable
                        .classed("active", false)
                        .classed("inactive", true);
                }
            }
        });

        // ================================================== //
        // Step 9: Create event listeners to update y-axis
        // ================================================== //
        // Update: x-axis
        yLabelsGroup.selectAll("text")
            .on("click", function() {
                // ========================= //
                // Get the value of the selected element
                // ========================= //
                var value = d3.select(this).attr("value");
                // console.log(value);
                // ========================= //
                // if value doesn't equal chosen Y Axis, then proceed, otherwise don't update (lack of else statement)
                // ========================= //
                if (value !== chosenYAxis) {
                    // ========================= //
                    // Update chosenYAxis to selected value
                    // ========================= //
                    chosenYAxis = value;
                    // ========================= //
                    // Update yScale for new selected value
                    // ========================= //
                    yLinearScale = yScale(projectData, chosenYAxis);
                    // ========================= //
                    // Update yAxis with transition for new selected value
                    // ========================= //
                    yAxis = renderLeftAxes(yLinearScale, yAxis);
    
                    // ========================= //
                    // Update scatter circles and text with new values for new selected value
                    // ========================= //
                    scatterCirclesGroup = renderScatterCircles(scatterCirclesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
                    scatterTextGroup = renderScatterText(scatterTextGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
                    
                    // ========================= //
                    // Update tooltips with new values for new selected value
                    // ========================= //
                    scatterCirclesGroup = updateToolTip(chosenXAxis, chosenYAxis, scatterCirclesGroup);
                    scatterTextGroup = updateToolTip(chosenXAxis, chosenYAxis, scatterTextGroup);
    
                    // ========================= //
                    // Update classes to bold if slected ("active") for new selected value
                    // ========================= //
                    if (chosenYAxis === "smokes") {
                        smokesLable
                            .classed("active", true)
                            .classed("inactive", false);
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        obesityLable
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                    else if (chosenYAxis === "obesity") {
                        obesityLable
                            .classed("active", true)
                            .classed("inactive", false);
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        smokesLable
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                    else {
                        healthcareLabel
                            .classed("active", true)
                            .classed("inactive", false)
                        smokesLable
                            .classed("active", false)
                            .classed("inactive", true);
                        obesityLable
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                }
            });
}).catch(function(error) {
    console.log(error);
});
