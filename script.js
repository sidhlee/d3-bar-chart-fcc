"use strict"


var yMargin = 40,
  width = 800,  // total bar width
  height = 400, // max bar height
  barWidth = width / 275; // data length

var tooltip = d3.select('.visHolder').append('div')
  .attr('id', 'tooltip')
  .style('opacity', 0);

var overlay = d3.select('.visHolder').append('div')
  .attr('class', 'overlay')
  .style('opacity', 0);

// green border  
var svgContainer = d3.select('.visHolder')
  .append('svg') // red border inside green
  .attr('width', width + 100)
  .attr('height', height + 60); // 60 for axisBottom and info


d3.json('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json')
  .then(function (data) {

    svgContainer.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -200)
      .attr('y', 80)
      .text('Gross Domestic Product');

    svgContainer.append('text')
      .attr('x', width / 2 + 120)
      .attr('y', height + 50)
      .text('More Information: http://www.bea.gov/national/pdf/nipaguid.pdf')
      .attr('class', 'info');

    var quarters = data.data.map(item => {
      var quarter;
      var temp = item[0].substring(5, 7);

      switch (temp) {
        case '01': quarter = 'Q1'; break;
        case '04': quarter = 'Q2'; break;
        case '07': quarter = 'Q3'; break;
        case '10': quarter = 'Q4';
      }

      return item[0].substring(0, 4) + ' ' + quarter
    })

    console.log(quarters);
    console.log(quarters.length);

    //  array of Date instances
    var quartersDates = data.data.map(function (item) {
      return new Date(item[0]);
    })

    var xMax = new Date(d3.max(quartersDates));
    xMax.setMonth(xMax.getMonth() + 3);

    // xScale takes Date obj and return x-coord in chart
    var xScale = d3.scaleTime()
      .domain([d3.min(quartersDates), xMax])
      .range([0, width]);

    var xAxis = d3.axisBottom()
      .scale(xScale);

    var xAxisGroup = svgContainer.append('g')
      .call(xAxis)
      .attr('id', 'x-axis')
      .attr('transform', 'translate(60, 410)');


    var GDPs = data.data.map(item => item[1]);

    var gdpMin = d3.min(GDPs);
    var gdpMax = d3.max(GDPs);

    var linearScale = d3.scaleLinear()
      .domain([0, gdpMax])
      .range([0, height]);

    // scaled to the chart height(400px)
    var scaledGDPs = [];
    scaledGDPs = GDPs.map(gdp => linearScale(gdp));

    var yAxisScale = d3.scaleLinear()
      .domain([0, gdpMax])
      .range([height, 0]);

    var yAxis = d3.axisLeft(yAxisScale);

    var yAxisGroup = svgContainer.append('g')
      .call(yAxis)
      .attr('id', 'y-axis')
      .attr('transform', 'translate(60,10)'); // move down by 10

    // draw bars from scaledGDPs array    
    d3.select('svg').selectAll('rect')
      .data(scaledGDPs)
      .enter()
      .append('rect')
      // embeds data into rect elements. 
      // retrieve with .getAttribute('data-date)
      .attr('data-date', (d, i) => data.data[i][0]) // get date str from json
      .attr('data-gdp', (d, i) => data.data[i][1]) // get gdp from json
      .attr('class', 'bar') // add .bar for style
      .attr('x', (d, i) => xScale(quartersDates[i])) // xScale takes Date obj, return x-coords inside svg
      .attr('y', (d, i) => height - d + 10)
      .attr('width', barWidth)
      .attr('height', d => d) // scaledGDPs
      .attr('transform', 'translate(60,0)') // 60 for axisLeft
      .on('mouseover', (d, i) => {
        overlay.transition()
          .duration(0)
          .style('height', d + 'px')
          .style('width', barWidth + 'px')
          .style('opacity', .9)
          .style('left', (i * barWidth) + 0 + 'px')
          // need to position: absolute to only worry about chart box
          // not about display dimension and centered coords
          .style('top', height - d + 10 + 'px')
          .style('transform', 'translateX(60px)');
        tooltip.transition()
          .duration(200)
          .style('opacity', .9);
        tooltip.html(quarters[i] + '<br>' + '$' +
          GDPs[i].toFixed(1).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') +
          ' Billion')
          .attr('data-date', data.data[i][0])
          .style('left', (i * barWidth) + 30 + 'px')
          .style('top', height - 100 + 'px')
          .style('transform', 'translateX(60px)');
      })
      .on('mouseout', d => {
        tooltip.transition()
          .duration(200)
          .style('opacity', 0);
        overlay.transition()
          .duration(200)
          .style('opacity', 0);
      });

  }).catch(e => console.log(e))
