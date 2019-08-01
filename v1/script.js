// width and height of chart (only the bars)
const w = 600,
  h = 300,
  svgPadding = 10,    
  url =
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";

function prettyDollar(dollar) {
  return dollar.toFixed(1)
    .replace(/(\d)(?=(\d{3})+.)/g, '$1,');
}

const svg = d3
  .select("#chart")
  .append("svg")
  .attr("id", "canvas")
  .attr("width", w + 60)
  .attr("height", h + 60)
  .style("background-color", "rgba(155, 255, 255, .5)")
  .style("padding", svgPadding + 'px');

const overlay = d3.select('#chart')
  .append("div")
  .attr("id", "overlay")
  .style("opacity", 0);

const tooltip = d3
  .select("#chart")
  .append("div")
  .attr("id", "tooltip")
  .attr("opacity", 0);

d3
  .json(url)
  .then(data => {
    // console.log(JSON.stringify(data, null, 4));
    const numData = data.data.length;
    // console.log(numData);
    const source = data.display_url,
      description = data.description;
   

    // display source and discription
    d3.select("footer #source").html("Source: " + source);
    d3.select("footer #description").html(description);

    // get x and y scales
    const barWidth = w / numData;
    const quarterDates = data.data.map((v, i) => {
      return new Date(v[0]);
    });

    const maxDate = d3.max(quarterDates);
    maxDate.setMonth(maxDate.getMonth() + 3);

    const minDate = d3.min(quarterDates),
      xScale = d3
        .scaleTime()
        .domain([minDate, maxDate])
        .range([0, w]);

    const GDPs = data.data.map((v, i) => {
      return v[1];
    });
  
    const toQuarter = (dateStr) => {
      let year = dateStr.substring(0, 4);
      let month = dateStr.substring(5,7);
      switch(month) {
        case '01': return year + ' Q1';
        case '04': return year + ' Q2';
        case '07': return year + ' Q3';
        case '10': return year + ' Q4';
      }
    }
  
    const quarters = data.data.map(v => {
      return toQuarter(v[0]);
    })

    const maxGDP = d3.max(GDPs),
      yScale = d3
        .scaleLinear()
        .domain([0, maxGDP])
        .range([h, 0]); //scale also start from the bottom

    // create and display x and y axis
    const axisMarginLeft = 35,
      chartMarginTop = 20;
    const xAxis = d3.axisBottom(xScale);

    svg
      .append("g")
      .call(xAxis)
      .attr("id", "x-axis")
      .attr(
        "transform",
        "translate(" + axisMarginLeft + "," + (h + chartMarginTop) + ")"
      );
    // must put parenthesis around variables when adding
    // otherwise, string concatenation happens

    const yAxis = d3.axisLeft(yScale);

    svg
      .append("g")
      .call(yAxis)
      .attr("id", "y-axis")
      .attr(
        "transform",
        "translate(" + axisMarginLeft + "," + chartMarginTop + ")"
      );

    // legend
    svg
      .append("text")
      .text("Gross Domestic Product (Billions of Dollars)")
      .attr("x", 0)
      .attr("y", 10)
      .style("font-size", "0.8em");

    // append bars from data
    d3
      .select("svg")
      .selectAll("rect")
      .data(GDPs)
      .enter()
      .append("rect")
      .attr("x", (d, i) => i * barWidth)
      .attr("y", (d, i) => yScale(d))
      .attr("width", barWidth)
      .attr("height", (d, i) => h - yScale(d))
      .attr("class", "bar")
      .attr(
        "transform",
        "translate(" + axisMarginLeft +
      ", " + chartMarginTop + ")"
      )
      .attr("data-date", (d, i) => data.data[i][0])
      .attr("data-gdp", (d, i) => d)
      .on("mouseover", (d, i) => {
      // console.log(yScale(d), i * barWidth)
      
          overlay.transition()
          .duration(0)
          // style takes value as 2nd arg. NOT cb!!
          .style("left", 
                 i * barWidth + axisMarginLeft + 
                 svgPadding  +  "px")
          .style("top", yScale(d) + chartMarginTop + 
                 svgPadding + "px")
          .style("width", barWidth + "px")
          .style("height", h - yScale(d) + "px")
          .style("opacity", 0.7);
      
          tooltip.transition()
          .duration(100)
          .style("opacity", 0.7);
      
          tooltip
          .attr('data-date', data.data[i][0] )
          .style("left", i * barWidth - 40 + "px")
          .style("top", "200px")
          .style("width", "150px")
          .style("height", "5em")
          .html(quarters[i] + '<br>' + '$' +    
                prettyDollar(GDPs[i]) + ' Billion')
      // need this for mouseover to keep firing over the overlapping object(tooltip in this case)
          .style("pointer-events", "none") 
      })
  .on('mouseout', d => {
      tooltip.transition()
      .duration(200)
      .style('opacity', 0);
      
      overlay.transition()
      .duration(200)
      .style('opacity', 0);
        
    })
  
  
  })
  .catch(err => console.log(err));
