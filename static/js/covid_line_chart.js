window.setTimeout(() => {
  document.getElementById("loading").style.display = "none";
}, 10000);

// Main Chart
const width = 1000,
  height = 800,
  svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", width + 300)
    .attr("height", height);

  var tooltip = d3.select("#chart").append("div")
                  .attr("class", "tooltip")
                  .style("opacity", 0);

  var brushTooltip = d3.select("#chart").append("div")
                  .attr("class", "brushTooltip")
                  .style("opacity", 0);

const margin = { top: 40, right: 120, bottom: 60, left: 60 },
  iwidth = width - margin.left - margin.right,
  iheight = height - margin.top - margin.bottom;

const gDrawing = svg
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

  svg.append("circle").attr("cx",955).attr("cy",550).attr("r", 6).style("fill", "black")
  svg.append("line").attr("x1",1023-75).attr("y1",570).attr("x2", 1035-75).attr("y2", 577).style("stroke", "#404080").style("stroke-width", "2");
  svg.append("text").attr("x", 1050-75).attr("y", 550).text("Events").style("font-size", "16px").attr("alignment-baseline","middle")
  svg.append("text").attr("id", "legend-metric").attr("x", 1050-75).attr("y", 575).text("Daily Deaths").style("font-size", "16px").attr("alignment-baseline","middle")

// Brush Chart
const brushChartWidth = 1000,
  brushChartHeight = 200,
  brushChartSvg = d3
    .select("#brushChart")
    .append("svg")
    .attr("width", brushChartWidth)
    .attr("height", brushChartHeight);

const brushChartMargins = { top: 10, right: 120, bottom: 60, left: 40 },
  iBrushChartWidth = brushChartWidth - brushChartMargins.left - brushChartMargins.right,
  iBrushChartHeight = brushChartHeight - brushChartMargins.top - brushChartMargins.bottom;

const brushChartDrawing = brushChartSvg
  .append("g")
  .attr("transform", `translate(${brushChartMargins.left}, ${brushChartMargins.top})`);

const brushSvg = brushChartSvg
  .append("g")
  .attr("transform", `translate(${brushChartMargins.left}, ${brushChartMargins.top})`);

countryMapping = {
  "AUS": "Australia",
  "BRA": "Brazil",
  "CHN": "China",
  "FRA": "France",
  "DEU": "Germany",
  "IND": "India",
  "IRN": "Iran",
  "ITA": "Italy",
  "JPN": "Japan",
  "RUS": "Russia",
  "SGP": "Singapore",
  "KOR": "South Korea",
  "ESP": "Spain",
  "GBR": "United Kingdom",
  "USA": "United States",
}

const colorMapping = {
  "AUS": "#556b2f",
  "BRA": "#7f0000",
  "CHN": "#3cb371",
  "FRA": "#008b8b",
  "DEU": "#9acd32",
  "IND": "#ff0000",
  "IRN": "#ffff00",
  "ITA": "#ba55d3",
  "JPN": "#00ff7f",
  "RUS": "#0000ff",
  "SGP": "#ff00ff",
  "KOR": "#f0e68c",
  "ESP": "#dda0dd",
  "GBR": "#ffa07a",
  "USA": "#87cefa",
};

const selectedFilters = ["USA", "SGP", "ITA", "BRA"];

let metric = "new_deaths_per_million";  
const countries = {};
let firstLoad = false;

function update(err, cases, events, start, end){
  events.forEach(({ country }) => {
    if(!country.includes(",")) {
      if (!countries[country]) {
        countries[country] = 1;
      } else {
        countries[country] = countries[country] + 1;
      }
  }
    
  });
  
  const select = document.getElementById("metric-select");

  function listQ(x){
    gDrawing.selectAll("*").remove();
    brushChartDrawing.selectAll("*").remove();
    metric = x.target.value;
    document.getElementById("legend-metric").innerHTML = select.options[select.selectedIndex].innerHTML;
    update(null, cases, events, start, end);
  }
  select.onchange = listQ;

  const parseDate = d3.timeParse("%Y-%m-%d");

  let data = [];
  for (key in countryMapping){
    let arr = cases[key].data;
    arr = arr.map((day) => {
      day["country"] = key;
      return day;
    })
    data = data.concat(arr);
  }

  const dateMapping = {};

  data.forEach(function(d) {
    d.dateTime = parseDate(d.date);
    if(!dateMapping[d.country]) {
      dateMapping[d.country] = {};
    }
    dateMapping[d.country][d.date] = d[metric];
  });

  data = data.filter((x) => selectedFilters.indexOf(x.country) !== -1);

  const ogData = data.map(a => ({...a}));

  if (start) {
    data = data.filter(({ dateTime }) => dateTime > start);
  }
  if (end) {
    data = data.filter(({ dateTime }) => dateTime < end);
  }

  const x = d3.scaleTime().domain(d3.extent(data, function(d) { return d.dateTime; })).range([0, iwidth]);
  const y = d3.scaleLinear().domain(d3.extent(data, function(d) { return d[metric]; })).range([iheight, 0]);

  // Main Chart
  gDrawing
    .append("g")
    .attr("transform", `translate(0,${iheight})`)
    .call(d3.axisBottom(x))
    .append("text")
    .style("fill", "black")
    .style("font-size", "12pt")
    .attr("transform", `translate(${iwidth}, ${-20})`);

  const option = select.options[select.selectedIndex].innerHTML;

  gDrawing
    .append("g")
    .call(d3.axisLeft(y))
    .append("text")
    .style("fill", "black")
    .style("font-size", "14pt")
    .text(() => option)
    .attr("transform", `translate(${200}, 15)`);

  for (key in colorMapping) {
    if (selectedFilters.indexOf(key) !== -1) {
    // gDrawing.append("path")
    //   .datum(data.filter(x => x.country === key))
    //   .attr("fill", "none")
    //   .attr("stroke", d => colorMapping[key])
    //   .attr("stroke-width", 1.5)
    //   .style("stroke-dasharray", ("3, 3"))
    //   .attr("d", d3.line()
    //     .x(function(d) { return x(d.dateTime) })
    //     .y(function(d) { return y(d.total_cases_per_million) })
    //   )

    gDrawing.append("path")
      .datum(data.filter(x => x.country === key))
      .attr("class", "line")
      .attr("id", key)
      .attr("fill", "none")
      .attr("stroke", colorMapping[key])
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function(d) { return x(d.dateTime) })
        .y(function(d) { return y(d[metric]) })
      )
    }
  }

  function handleMouseOver(d, i) {
    // d3.select(this).style("cursor", "pointer"); 
    d3.select(this).attr("r", 15);
    const html = "<span> Date: " + d3.timeFormat("%a, %B %d")(d.dateTime) + "<br/> Event Description: " + d.description + "</span>";
    tooltip.html(html)
      .style("left", (d3.event.pageX + 15) + "px")
      .style("top", (d3.event.pageY - 28) + "px")
      .transition()
      .duration(150)
      .style("opacity", .95) 
  }

  function handleMouseOut(d, i) {
    d3.select(this).attr("r", 7);
    hoveredGenre = "";
    // d3.select(this).style("cursor", "default");
    tooltip.transition()
      .duration(200)
      .style("opacity", 0);
  }

  function handleLegendMouseOver(d, i) {
    d3.select(this).style("cursor", "pointer"); 
  }

  function handleLegendMouseOut(d, i) {
    d3.select(this).style("cursor", "default"); 
  }

  const mouseG = gDrawing.append("g")
    .attr("class", "mouse-over-effects");

  mouseG.append("path") // this is the black vertical line to follow mouse
    .attr("class", "mouse-line")
    .style("stroke", "black")
    .style("stroke-width", "1px")
    .style("opacity", "0");

  const dateLabel = mouseG.append("text").style("opacity", "0");

  mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
    .attr('width', iwidth) // can't catch mouse events on a g element
    .attr('height', iheight)
    .attr('fill', 'none')
    .attr('pointer-events', 'all')
    .on('mouseout', function() { // on mouse out hide line, circles and text
      d3.select(".mouse-line")
        .style("opacity", "0");
      d3.selectAll(".mouse-per-line circle")
        .style("opacity", "0");
      d3.selectAll(".mouse-per-line text")
        .style("opacity", "0");
      dateLabel.style("opacity", "0");
    })
    .on('mouseover', function() { // on mouse in show line, circles and text
      d3.select(".mouse-line")
        .style("opacity", "1");
      d3.selectAll(".mouse-per-line circle")
        .style("opacity", "1");
      d3.selectAll(".mouse-per-line text")
        .style("opacity", "1");
    })
    .on('mousemove', function() { // mouse moving over canvas
      var mouse = d3.mouse(this);
      d3.select(".mouse-line")
        .attr("d", function() {
          var d = "M" + mouse[0] + "," + iheight;
          d += " " + mouse[0] + "," + 0;
          return d;
        });  

  var mousePerLine = mouseG.selectAll('.mouse-per-line')
    .data(selectedFilters)
    .enter()
    .append("g")
    .attr("class", "mouse-per-line");

  mousePerLine.append("circle")
    .attr("r", 7)
    .style("stroke", function(d) {
      return colorMapping[d];
    })
    .style("fill", "none")
    .style("stroke-width", "1px")
    .style("opacity", "0");

  mousePerLine
    .append("text")
    .attr("transform", "translate(10,3)")
    .style("font-weight", "bold");

  d3.selectAll(".mouse-per-line")
    .attr("transform", function(d, i) {
      const filteredData = data.filter(x => x.country === d);
      const currLine = document.getElementById(d);
      var xDate = x.invert(mouse[0]),
          bisect = d3.bisector(function(d) { return d.dateTime; }).right;
          idx = bisect(filteredData, xDate);

      const selectedData = filteredData[idx];
      if(!selectedData) {
        return;
      }
      
      d3.select(this).select('text')
        .text(selectedData[metric]);

        var beginning = 0,
        end = currLine.getTotalLength(),
        target = null;

        

    while (true){
      target = Math.floor((beginning + end) / 2);
      pos = currLine.getPointAtLength(target);
      if ((target === end || target === beginning) && pos.x !== mouse[0]) {
          break;
      }
      if (pos.x > mouse[0])      end = target;
      else if (pos.x < mouse[0]) beginning = target;
      else break; //position found
    }

    d3.select(".mouse-line")
      .select('text')
      .text(selectedData[metric]);
    
      dateLabel.style("opacity", "1").text(selectedData.date).attr("transform", "translate(" + (mouse[0] + 5) + "," + 140 +")");

      return "translate(" + mouse[0] + "," + pos.y +")";
    });
  });

  const parseEventDate = d3.timeParse("%m/%d/%Y");

  const eventsCopy = JSON.parse(JSON.stringify(events));

  for (key in colorMapping) {
    if (selectedFilters.indexOf(key) !== -1) {
      let countryEvents = eventsCopy.filter(x => x.country.includes(countryMapping[key])).map((y) => {
        y.countryAbbrev = key;
        return y;
      });

      countryEvents.forEach(function(d) { 
        d.dateTime = parseEventDate(d.date);
        d.dashFormattedDate = d3.timeFormat("%Y-%m-%d")(d.dateTime);
      });

      if (start) {
        countryEvents = countryEvents.filter(({ dateTime }) => dateTime > start);
      }

      if (end) {
        countryEvents = countryEvents.filter(({ dateTime }) => dateTime < end);
      }

      mouseG.append("g")
        .selectAll(key)
        .data(countryEvents)
        .enter()
        .append("circle")
          .attr("fill", d => colorMapping[key])
          .attr("stroke", "none")
          .attr("cx", function(d) { return x(d.dateTime) })
          .attr("cy", function(d) { return y(dateMapping[key][d.dashFormattedDate]) })
          .attr("r", 7)
          .on("mouseover", handleMouseOver)
          .on("mouseout", handleMouseOut)
    }
  }


  function handleLegendClick(d) {

    const index = selectedFilters.indexOf(d);
    if (index == -1) {
      selectedFilters.push(d);
    } else {
      selectedFilters.splice(index, 1);
    }
    gDrawing.selectAll("*").remove();
    brushChartDrawing.selectAll("*").remove();
    update(null, cases, events, start, end, metric);
  }

  const legend = gDrawing.append("g");

  const initialY = 10;
  const legendSpacing = 30;

  legend
    .selectAll('circle')
    .data(Object.keys(colorMapping))
    .enter()
    .append("circle")
    .attr("cx", width - 100)
    .attr("cy", (d, index) => initialY + legendSpacing * (index + 1))
    .attr("r", 10)
    .attr("fill", d => selectedFilters.indexOf(d) !== -1 ? colorMapping[d] : "white")
    .attr("class", "selected")
    .attr('fill-opacity', 0.55)
    .attr('stroke', 'black')
    .attr('stroke-width', 2)
    .style("font-size", "9pt")
    .on("click", handleLegendClick)
    .on("mouseover", handleLegendMouseOver)
    .on("mouseout", handleLegendMouseOut);

  legend
    .selectAll('text')
    .data(Object.keys(colorMapping))
    .enter()
    .append("text")
    .attr("x", width - 80)
    .attr("y", (d, index) => initialY + legendSpacing * (index + 1) + 5)
    .text(d => countryMapping[d]);

  // Brush Chart
  const brushChartX = d3.scaleTime().domain(d3.extent(ogData, function(d) { return d.dateTime; })).range([0, iBrushChartWidth]);
  const brushChartY = d3.scaleLinear().domain(d3.extent(ogData, function(d) { return d[metric]; })).range([iBrushChartHeight, 0]);

  for (key in colorMapping) {
    if (selectedFilters.indexOf(key) !== -1) {
    // brushChartDrawing.append("path")
    //   .datum(data.filter(x => x.country === key))
    //   .attr("fill", "none")
    //   .attr("stroke", d => colorMapping[key])
    //   .attr("stroke-width", 1.5)
    //   .style("stroke-dasharray", ("3, 3"))
    //   .attr("d", d3.line()
    //     .x(function(d) { return brushChartX(d.dateTime) })
    //     .y(function(d) { return brushChartY(d.total_cases_per_million) })
    //   )
    
      brushChartDrawing.append("path")
        .datum(ogData.filter(x => x.country === key))
        .attr("fill", "none")
        .attr("stroke", d => colorMapping[key])
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
          .x(function(d) { return brushChartX(d.dateTime) })
          .y(function(d) { return brushChartY(d[metric]) })
        )
    }
  }

    brushChartDrawing
      .append("g")
      .attr("transform", `translate(0,${iBrushChartHeight})`)
      .call(d3.axisBottom(brushChartX))
      .append("text")
      .style("fill", "black")
      .style("font-size", "12pt")
      .attr("transform", `translate(${iBrushChartWidth}, ${-20})`);

    brushChartDrawing
      .append("g")
      .call(d3.axisLeft(brushChartY))
      .append("text")
      .style("fill", "black")
      .style("font-size", "12pt")
      .attr("transform", "translate(50, 0)");

    const brush = d3
      .brushX()
      .extent([
        [0, 0],
        [
          iBrushChartWidth,
          iBrushChartHeight
        ]
      ])
      .on("brush", (a, b)=>{
        const selection = d3.event.selection;
        if (!d3.event.sourceEvent || !selection) return;
        document.getElementById("brushTooltip").style.display = "none";
        const selectedTime = selection.map(d => brushChartX.invert(d));
        document.getElementById("startDate").innerHTML = "Start Date: " + d3.timeFormat("%m-%d-%Y")(selectedTime[0]);
        document.getElementById("endDate").innerHTML = "End Date: " + d3.timeFormat("%m-%d-%Y")(selectedTime[1]);
      })
      .on("end", ()=>{
        const selection = d3.event.selection;
        if (!d3.event.sourceEvent || !selection) return;
        const selectedTime = selection.map(d => brushChartX.invert(d));

        gDrawing.selectAll("*").remove();
        brushChartDrawing.selectAll("*").remove();
        update(null, cases, events, selectedTime[0], selectedTime[1]);
      });
  
    if (!firstLoad) {
      brushSvg
      .append("g")
      .attr("class", "brush")
      .call(brush);
      d3.select(".brush").call(brush.move, [0, 840]);
      firstLoad = true;
    }
}

d3.queue()
  .defer(d3.json, "./static/data/data.json")
  .defer(d3.json, "./static/data/covidEvents.json")
  .await(update);
