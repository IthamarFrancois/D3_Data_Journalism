// Initialize default X/Y-axis chart choices and variables
var xAxisChoice = "poverty";
var yAxisChoice = "healthcare";


///////////  SVG  /////////// 

// Clear any existing elements/charts in SVG container area when loading browser page
var svgArea = d3.select("body").select("svg");
if (!svgArea.empty())
{
    svgArea.remove();
}

// Initialize default SVG size parameters and margin
var svgWidth = 1000;
var svgHeight = 500;

// Set Margins
var svgMargin = 
{
    top: 10,
    right: 60,
    bottom: 100,
    left: 100
};


// Define Chart area dimensions
var chartWidth = svgWidth - svgMargin.left - svgMargin.right;
var chartHeight = svgHeight - svgMargin.top - svgMargin.bottom;


// Set SVG wrapper
var SVG = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGrp = SVG.append("g")
    .attr("transform", `translate(${svgMargin.left}, ${svgMargin.top})`);

///////////  End SVG Declarations   /////////// 



///////////  Functions  /////////// 

// Function that will set the chart size parameters for x-Axis
function ScaleX(csvData, xAxisChoice) 
{
    var xLinearScale = d3.scaleLinear().domain
        ([
            d3.min(csvData, d => d[xAxisChoice]) * .75,
            d3.max(csvData, d => d[xAxisChoice]) * 1.1
        ]).range([0, chartWidth]);

    return xLinearScale;

}


// Function that will set the chart size parameters for y-Axis
function ScaleY(csvData, yAxisChoice) 
{
    var yLinearScale = d3.scaleLinear().domain
        ([
            d3.min(csvData, d => d[yAxisChoice]) * 0.75,
            d3.max(csvData, d => d[yAxisChoice]) * 1.1
        ]).range([chartHeight, 0]);
    
        return yLinearScale;
}



// Function that will update x-scale ticks when x-axis label is clicked
function xAxisChange(UpdateX, xAxis) 
{
        // Create X-axis transition
        var bottomAxis = d3.axisBottom(UpdateX);
        xAxis.transition().duration(1000).call(bottomAxis);
        
    return xAxis;

}

// Function that will update y-scale ticks when y-axis label is clicked
function yAxisChange(UpdateY, yAxis) 
{
        // Create Y-axis transition
        var leftAxis = d3.axisLeft(UpdateY);
        yAxis.transition().duration(1000).call(leftAxis);
        
    return yAxis;

}


//// Function that will update/keep text labeling when an axis is changed
function TextChange(texGrp, UpdateX, xAxisChoice, UpdateY, yAxisChoice) 
{
        texGrp.transition().duration(1000)
            // Centers State abbreviations in center of circle
            .attr("x", d => UpdateX(d[xAxisChoice]))
            .attr("y", d => UpdateY(d[yAxisChoice] - .4))
            .attr("text-anchor", "middle");            

    return texGrp;
}


//// Function that will update circles when an axis is changed to show other data
function CircleChange(circlesGrp, UpdateX, xAxisChoice, UpdateY, yAxisChoice)  
{
    circlesGrp.transition().duration(1000)
            
            .attr("cx", d => UpdateX(d[xAxisChoice]))
            .attr("cy", d => UpdateY(d[yAxisChoice]));
            
    return circlesGrp;
}



///////////  End Functions Declarations  ///////////





// Import State data and values from 'data.csv' using d3.csv 
d3.csv("assets/data/data.csv").then(function(csvData) 
{
    // Parsing columns/values
    csvData.forEach(function(data)
    {
    
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
    
    }); console.log(csvData)  // Read 'data.csv' check



    // // Create linear scale functions for X/Y-axes by referencing previous Scale functions
    var xLinearScale = ScaleX(csvData, xAxisChoice);
    var yLinearScale = ScaleY(csvData, yAxisChoice);

    
    // Create X/Y-axes functions to append them to chart
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append x-axis
    var xAxis = chartGrp.append("g").classed('x-axis', true).attr("transform", `translate(0, ${chartHeight})`).call(bottomAxis);
    
    // Append y-axis
    var yAxis = chartGrp.append("g").classed('y-axis', true).call(leftAxis);

    // Append default circles from "data.csv" data using d3 css parameters for "stateCircle"
    var circlesGrp = chartGrp.selectAll(".stateCircle").data(csvData).enter().append("circle")
        .attr("cx", d => xLinearScale(d[xAxisChoice]))
        .attr("cy", d => yLinearScale(d[yAxisChoice]))
        .attr("class", "stateCircle")
        .attr("r", "16")
        .attr("opacity", ".9");


    // Append state abbreviations/text to circles from "data.csv" using d3 css parameters for "stateText"
    var texGrp = chartGrp.append("g").selectAll(".stateText").data(csvData).enter().append("text")    
        .text((d) => (d.abbr))
        .attr("x", d => xLinearScale(d[xAxisChoice]))
        .attr("y", d => yLinearScale(d[yAxisChoice] - .4))
        .attr("class", "stateText")



    //// X - AXIS INTERACTIVE //// 

    //// Create x-axis label grouping
    var XgroupLabels = chartGrp.append("g").attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 30})`)

    // Property Label
    var PovertyLabel = XgroupLabels.append("text").attr("x", 0).attr("y", 0).attr("value", "poverty")
    .classed("active", true)
    .text("In Poverty (%)");

    // Age Label
    var AgeLabel = XgroupLabels.append("text").attr("x", 0).attr("y", 25).attr("value", "age")
    .classed("inactive", true)
    .text("Age (Median)");

    // Income Label
    var IncomeLabel = XgroupLabels.append("text").attr("x", 0).attr("y", 50).attr("value", "income")
    .classed("inactive", true)
    .text("Household Income (Median)");


    // Controls which x-axis label is highlighted bold/active vs greyyed/inactive based on 'click' event
    XgroupLabels.selectAll("text")
        .on("click", function()
            {
                // Set value variable to the choice made via click event
                var Xvalue = d3.select(this).attr("value");
                //console.log(Xvalue);
                //console.log(xAxisChoice);

                // If value does not equal poverty
                if (Xvalue !== xAxisChoice)
                {
                    xAxisChoice = Xvalue;
                    // console.log("");
                    // console.log("XCheck");
                    // console.log(Xvalue);
                    // console.log(xAxisChoice);
                    // console.log("End XCheck");
                    // console.log("");

                    // recalls previously established functions to allow for interactive chart animations and visualizations based on X-axis label selection
                    xLinearScale = ScaleX(csvData, xAxisChoice);
                    xAxis = xAxisChange(xLinearScale, xAxis);
                    texGrp = TextChange(texGrp, xLinearScale, xAxisChoice, yLinearScale, yAxisChoice);
                    circlesGrp = CircleChange(circlesGrp, xLinearScale, xAxisChoice, yLinearScale, yAxisChoice);


                    if (xAxisChoice === "poverty") 
                    {
                        PovertyLabel.classed("active", true).classed("inactive", false);
                        AgeLabel.classed("active", false).classed("inactive", true);
                        IncomeLabel.classed("active", false).classed("inactive", true);
                        
                    }

                    else if (xAxisChoice === "age") 
                    {
                        PovertyLabel.classed("active", false).classed("inactive", true);
                        AgeLabel.classed("active", true).classed("inactive", false);
                        IncomeLabel.classed("active", false).classed("inactive", true);
                    }

                    else 
                    {
                        PovertyLabel.classed("active", false).classed("inactive", true);
                        AgeLabel.classed("active", false).classed("inactive", true);
                        IncomeLabel.classed("active", true).classed("inactive", false);
                    }

                }
            }
        );
    

    //// Y - AXIS INTERACTIVE //// 
    //// Create y-axis label grouping
    var YgroupLabels = chartGrp.append("g").attr("transform", `translate(-30, ${chartHeight / 2})`)
    
    // Healthcare Label
    var HealthcareLabel = YgroupLabels.append("text").attr("x", 0).attr("y", -25).attr("value", "healthcare")
    .attr("transform", "rotate(-90)")
    .classed("active", true)
    .attr("dy", "1em")
    .text("Lacks Healthcare (%)");

    var SmokesLabel = YgroupLabels.append("text").attr("x", 0).attr("y", -50).attr("value", "smokes")
    .attr("transform", "rotate(-90)")
    .classed("inactive", true)
    .attr("dy", "1em")
    .text("Smokes (%)");

    var ObesityLabel = YgroupLabels.append("text").attr("x", 0).attr("y", -75).attr("value", "obesity")
    .attr("transform", "rotate(-90)")
    .classed("inactive", true)
    .attr("dy", "1em")
    .text("Obese (%)");

    // Controls which x-axis label is highlighted bold/active vs greyyed/inactive based on 'click' event
    YgroupLabels.selectAll("text")
        .on("click", function()
            {
                // Set value variable to the choice made via click event
                var Yvalue = d3.select(this).attr("value");
                // console.log(Yvalue);
                // console.log(yAxisChoice);

                // If value does not equal poverty
                if (Yvalue !== yAxisChoice)
                {
                    yAxisChoice = Yvalue;
                    // console.log("");
                    // console.log("YCheck");
                    // console.log(Yvalue);
                    // console.log(yAxisChoice);
                    // console.log("End YCheck");
                    // console.log("");

                // recalls previously established functions to allow for interactive chart animations and visualizations based on Y-axis label selection
                yLinearScale = ScaleY(csvData, yAxisChoice);
                yAxis = yAxisChange(yLinearScale, yAxis);
                texGrp = TextChange(texGrp, xLinearScale, xAxisChoice, yLinearScale, yAxisChoice);
                circlesGrp = CircleChange(circlesGrp, xLinearScale, xAxisChoice, yLinearScale, yAxisChoice);

                    if (yAxisChoice === "healthcare") 
                    {
                        HealthcareLabel.classed("active", true).classed("inactive", false);
                        SmokesLabel.classed("active", false).classed("inactive", true);
                        ObesityLabel.classed("active", false).classed("inactive", true);
                    }

                    else if (yAxisChoice === "smokes") 
                    {
                        HealthcareLabel.classed("active", false).classed("inactive", true);
                        SmokesLabel.classed("active", true).classed("inactive", false);
                        ObesityLabel.classed("active", false).classed("inactive", true);
                    }

                    else 
                    {
                        HealthcareLabel.classed("active", false).classed("inactive", true);
                        SmokesLabel.classed("active", false).classed("inactive", true);
                        ObesityLabel.classed("active", true).classed("inactive", false);
                    }

                }
            }
        );

});




//////////////////////////////  Ithamar Francois  //////////////////////////////


