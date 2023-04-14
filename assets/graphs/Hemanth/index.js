function filterData(data, value) {
  //for filtering data on the basis of category value
  let segment_obj = {},
    segment = [];
  data.forEach((d) => {
    //loop
    if (d.Category.localeCompare(value) == 0) {
      //if value equal selected category
      if (segment_obj[d.Segment] == undefined) {
        //processing data
        segment_obj[d.Segment] = parseFloat(d.Profit.split("$")[1]);
        segment.push(d.Segment);
      } else {
        segment_obj[d.Segment] =
          segment_obj[d.Segment] + parseFloat(d.Profit.split("$")[1]);
      }
    }
  });

  return {
    segment: segment,
    segment_obj: segment_obj,
  };
}

d3.csv("Donut data.csv").then(function (json) {
  let segment = [],
    segment_obj = {},
    return_value;

  let categories = [],
    categories_obj = {};

  //processing data
  json.forEach((d) => {
    if (categories_obj[d.Category] == undefined) {
      categories.push(d.Category);
      categories_obj[d.Category] = 5;
    }
  });

  return_value = filterData(json, "Office Supplies"); //calling filter function
  segment = return_value.segment;
  segment_obj = return_value.segment_obj;

  let select = document.getElementById("menu");
  for (var i = 0; i < categories.length; i++) {
    //creating dynamically options of select menu
    var opt = document.createElement("option");
    opt.value = categories[i];
    opt.innerHTML = categories[i];
    select.appendChild(opt);
  }

  draw(segment_obj); //drawing chart

  d3.select("#menu").on("change", function (d) {
    //adding on change event in select menu
    let value = document.getElementById("menu").value; //getting selected value
    return_value = filterData(json, value); //filtering data
    segment = return_value.segment;
    segment_obj = return_value.segment_obj;
    draw(segment_obj); //redrawing chart
  });

  function draw(segment_obj) {
    //chart drawing function
    d3.select("#donutchart svg").remove(); //removing old svg
    d3.select("#donutchart div").remove(); //removing old tooltip div

    let width = 550, //size of chart
      height = 550,
      margin = 100;

    let radius = Math.min(width, height) / 2 - margin; //radius of donut chart

    let svg = d3 //adding svg and placing it at center
      .select("#donutchart")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    let tooltip = d3 //adding tooltip div
      .select("#donutchart")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    // let color = d3.scaleOrdinal().domain(segment).range(d3.schemeSet3); //creating color scheme
    let color = ["#0db294", "#eebe21", "#2576ba"];

    let pie = d3 //inbuilt pie/donut function
      .pie()
      .sort(null) // Do not sort group by size
      .value((d) => d[1]);

    let data_ready = pie(Object.entries(segment_obj)); //converting data to donut/pie format data

    let arc = d3 //function for creating inner circle
      .arc()
      .innerRadius(radius * 0.5)
      .outerRadius(radius * 0.8);

    //function for creating outer circle
    let outerArc = d3
      .arc()
      .innerRadius(radius * 0.9)
      .outerRadius(radius * 0.9);

    svg //drawing donut chart
      .selectAll("donutslices")
      .data(data_ready) //adding data
      .join("path")
      .attr("d", arc) //calling arc drawing
      .attr("class", "donut")
      .style("stroke-width", "2px") //styling
      .attr("fill", (d, i) => color[i]) //coloring on the basis type
      .style("opacity", 0.91)
      // .attr("stroke", "white")
      .on("mouseover", function (i, d) {
        //mouseover event for tooltip
        d3.selectAll(".donut").style("opacity", 0.4);
        d3.select(this).style("opacity", 1);
        tooltip.transition().duration(300).style("opacity", 1); //showing tooltip
        tooltip //adding data in tooltip
          .html(
            `<span style="font-size:20px;font-weight:bold">Type: ${
              d.data[0]
            }<br></span><span style="font-size:20px;font-weight:bold">Value: ${Math.ceil(
              d.data[1]
            )}$`
          )
          .style("visibility", "visible") //adding values on tooltip
          .style("left", event.pageX + "px") //for getting the horizontal or x position of cursor and giving it to tooltip
          .style("top", event.pageY + "px"); //for getting y value of cursor and giving it to tooltip
      })
      .on("mouseleave", function (d) {
        //hiding tooltip on mouseout
        d3.selectAll(".donut").style("opacity", 0.91);
        tooltip
          .style("visibility", "none")
          .transition()
          .duration(301)
          .style("opacity", 0);
      });

    svg //for drawing label lines
      .selectAll("lines")
      .data(data_ready)
      .join("polyline")
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .style("fill", "none")
      .attr("points", function (d) {
        let a1 = arc.centroid(d); // line insertion
        let a2 = outerArc.centroid(d); // line break
        let a3 = outerArc.centroid(d); // label position
        let midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        a3[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1);
        return [a1, a2, a3];
      });

    svg //adding labels to the lines
      .selectAll("labels")
      .data(data_ready)
      .join("text")
      .text((d) => d.data[0])
      .attr("stroke", "white")
      .attr("transform", function (d) {
        let pos = outerArc.centroid(d);
        let midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
        return `translate(${pos})`;
      })
      .style("text-anchor", function (d) {
        let midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        return midangle < Math.PI ? "start" : "end";
      });

    svg //adding legend circles
      .selectAll("dots")
      .data(data_ready)
      .enter()
      .append("circle")
      .attr("cx", function (d, i) {
        //positioning of legends x value
        return width - (1.15 * width - i * 100);
      })
      .attr("cy", function (d, i) {
        //positioning of legends y value
        return height / 3;
      })
      .attr("r", 7)
      .style("fill", function (d, i) {
        //filling color on basis of type
        return color[i];
      });

    svg //adding legend labels
      .selectAll("labels")
      .data(data_ready)
      .enter()
      .append("text")
      .attr("x", function (d, i) {
        return width - (1.2 * width - i * 100);
      })
      .attr("y", function (d, i) {
        return height / 2.5;
      })
      .style("fill", "white")
      .text(function (d) {
        return d.data[0]; //giving value
      })
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle");
  }
});
