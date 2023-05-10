d3.csv("Aster data.csv", d3.autoType).then(AsterPlot)

//Create a color scheme for different categories
function AsterPlot(json){
  let catColorScheme = d3.scaleOrdinal()
                        .domain(['Furniture', 'Office Supplies', 'Technology'])
                        .range(['brown','orange','dodgerblue'])

  //Define a function                       
  let segmentV = Array.from(new Set(d3.map(json, function(d){return d.Segment})))

  console.log(segmentV)

  function filterData(data, value) {
    //for filtering data on the basis of category value
    let segment_obj = {},
      segment = [];

    if(category != 'All') {
        data = data.filter(function(d){ return d.Category == category})
    }


    data.forEach((d) => {
      //loop
        if (segment_obj[d.Segment] == undefined) {
          //processing data
          segment_obj[d.Segment] = d.Profit
          //list  of segments
          segment.push(d.Segment);
        } else {
          segment_obj[d.Segment] =
            segment_obj[d.Segment] + d.Profit
        }
    });
  
    return {
      segment: segment,
      segment_obj: segment_obj,
    };
  }

  let category, customerSegment, customerChart;

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

  // Sort in alphabetical order
  categories.sort()

  categories.unshift('All')

  category = "All"
  return_value = filterData(json, category); //calling filter function
  segment = return_value.segment;
  segment_obj = return_value.segment_obj;


  // creating drop down
  let select = document.getElementById("menu");
  for (var i = 0; i < categories.length; i++) {
    //creating dynamically options of select menu
    var opt = document.createElement("option");
    opt.value = categories[i];
    opt.innerHTML = categories[i];
    select.appendChild(opt);
  }

  draw(segment_obj); //drawing chart

  // when menu is changed
  d3.select("#menu").on("change", function (d) {
    //adding on change event in select menu
    category = document.getElementById("menu").value; //getting selected value
    return_value = filterData(json, category); //filtering data
    segment = return_value.segment;
    segment_obj = return_value.segment_obj;
    draw(segment_obj); //redrawing chart
    console.log(category)
  });

  function draw(segment_obj) {
    //chart drawing function
    d3.select("#donutchart svg").remove(); //removing old svg
    d3.select("#donutchart div").remove(); //removing old tooltip div

    let width = 600, //size of chart //550
      height = 600;
    let margin = {top: 100, right: 100, bottom: 100, left: 100};
    let innerRad = 35;

    // make radius from half of the smallest svg dimension
    let radius = Math.min(width, height) / 2 - Math.max(margin.left, margin.right);


    let svg = d3 //adding svg and placing...
      .select("#donutchart")
      .append("svg")
      .attr("width", width)
      .attr("height", height - 100)
      // placing new group and origin at center
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2 - 50})`);

    let tooltip = d3 //adding tooltip div
      .select("#donutchart")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    let color = d3.scaleOrdinal()
                  .domain(segmentV)
                  .range(["#0db294", "#eebe21", "#2576ba"]);

    console.log(segment)
    

    data = Object.entries(segment_obj)

    console.log(data)

    // Sort from highest to lowest
    data.sort((a,b) => d3.descending(a[1], b[1]))

    // Define the scales
  let angleScale = d3.scaleLinear()
                        // is the values, so it starts with zero and ends with the data length
                        .domain([0, data.length])
                        // Range is the total length for something to cover
                        // something to do with circumference, 2pi is 360 degrees
                        .range([0, 2 * Math.PI]);

    // this aster uses the values as the radius
  let radiusScale = d3.scaleLinear()
                        // 
                        .domain([0, d3.max(data, function(d){return d[1]})])
                        // ...that is why radius is the range for the values to cover
                        .range([innerRad, radius]);

    // Create the arc generators
  let arcGenerator = d3.arc()
              // radius of inner circle
              .innerRadius(innerRad)
              .outerRadius(function(d,) { return radiusScale(d[1]); })
              .startAngle(function(d, i) { return angleScale(i); })
              .endAngle(function(d, i) { return angleScale(i + 1); });

    //function for creating outer circle for labelling
    let outerArc = d3
    // used for labelling
      .arc()
      .innerRadius(radius * 0.9)
      .outerRadius(radius * 0.9);

    // Create the group and arc path elements
    let wedges = svg.selectAll(".aster")
    .data(data)
    .enter()
        .append("path")
        .attr("d", arcGenerator)
        .attr("class", "aster")
        .attr('fill', function(d){return color(d[0])})
        .attr("stroke", "black")
        .style("stroke-width", "1.5px") //styling
        .style("opacity", 0)
        .on("mouseover", function (event, d) {
            //mouseover event for tooltip
            d3.selectAll(".aster").style("opacity", 0.4);
            d3.select(this).style("opacity", 1);
            let totalProfitByCategory = d3.sum(data, function(d){ return d[1]})
            tooltip.transition().duration(300).style("opacity", 1); //showing tooltip
            tooltip //adding data in tooltip
              .html(
                `<span style="font-size:20px;font-weight:bold">Segment: ${
                  d[0]
                }<br></span><span style="font-size:20px;font-weight:bold">Profit: ${d3.format("$,")(
                  d[1]
                )}<br> Percentage: ${d3.format(".0%")(d[1]/totalProfitByCategory)}`
              )
              .style("visibility", "visible") //adding values on tooltip
              .style("left", event.pageX + "px") //for getting the horizontal or x position of cursor and giving it to tooltip
              .style("top", event.pageY + "px"); //for getting y value of cursor and giving it to tooltip
          })
          .on("mouseleave", function (d) {
            //hiding tooltip on mouseout
            d3.selectAll(".aster").style("opacity", 0.91);
            tooltip
              .style("visibility", "none")
              .transition()
              .duration(301)
              .style("opacity", 0);
          })
          .on('click', function(event, d){
            customerSegment = d[0]
            topCustomers(customerSegment)
          });

          // Animate In
          d3.selectAll(".aster")
            .transition()
            .duration(500) // 1000
            .delay(function(d,i){return i * 150}) //100
            .style("opacity", 0.91)


            svg //adding legend circles
            .selectAll("dots")
            .data(segmentV)
            .enter()
            .append("circle")
            .attr("cx", function (d, i) {
              //positioning of legends x value
              return width - (1.15 * width - i * 100);
            })
            .attr("cy", function (d, i) {
              //positioning of legends y value
              return height / 3 + 15;
            })
            .attr("r", 9)
            .style("fill", function (d, i) {
              //filling color on basis of type
              return color(d);
            });
      
            svg //adding legend labels
            .selectAll("labels")
            .data(segmentV)
            .enter()
            .append("text")
            .attr('class', 'legend')
            .attr("x", function (d, i) {
              return width - (1.15 * width - i * 100);
            })
            .attr("y", function (d, i) {
              return height / 2.5;
            })
            .style("fill", "black")
            .text(function (d) {
              return d; //giving value
            })
            .attr("text-anchor", "middle")
            //.style("alignment-baseline", "middle");

      function topCustomers(customerSegment){

        // remove the previous elements, transition them out
        d3.selectAll('.aster').remove()
        d3.select("#donutchart svg").remove(); //removing old svg
        d3.select("#donutchart div").remove(); //removing old tooltip div
    
        customerChart = true;
  
        // get the neccessary data

        // filter data by category and selected segment
        let filtereddata;
        if(category == 'All'){
          filtereddata = json.filter(function(d) {return d['Segment'] == customerSegment})
        } else{
          filtereddata = json.filter(function(d) {return d['Segment'] == customerSegment && d['Category'] == category})
        }
        
        let filtereddataobj = {};
    
        filtereddata.forEach((d) => {
        // Summing Cost and Profit
            if (filtereddataobj[d["Customer Name"]] == undefined) {
                filtereddataobj[d["Customer Name"]] = {
                    //Category: category,
                    Profit: d.Profit,
                    "Customer Name": d["Customer Name"],  // name of /category/subcategory/state/city
                };
            } 
            else {
                filtereddataobj[d["Customer Name"]].Profit = filtereddataobj[d["Customer Name"]].Profit + d.Profit
            }
        });
        
        filtereddata = [];
    
        Object.keys(filtereddataobj).forEach((k) => { 
            //for each segment ...
            //converting data object to array
            filtereddata.push(filtereddataobj[k]);
        });
    
        // Sort for most profitable
        filtereddata.sort((a,b) => d3.descending(a.Profit, b.Profit))
    
        filtereddata = filtereddata.slice(0,10);

        console.log(filtereddata)
  
   
        let margin = {left: 150, top: 30, right: 0, bottom: 50} //size of chart + margin or sides    //top was once 50//right was 30
            width = 800 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;
    
        svg1 = d3
            .select("#donutchart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
      
        svg = svg1.append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
          
        let tooltip = d3 //adding tooltip div
                    .select("#donutchart")
                    .append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);
        
        let xMax = d3.max(filtereddata, function(d){return d.Profit})
    
        // create  new scale for bar chart
        let xScale = d3.scaleLinear()
                        .domain([0, xMax])
                        .range([0, width]);
    
        let yScale = d3.scaleBand()
                        .domain(filtereddata.map(function (d) {return d["Customer Name"];}))
                        .range([0, height])
                        .padding(0.1)
    
        // before calling y axis, append rects according to colour of category
        svg.selectAll(".catColor")
            .data(filtereddata)
            .enter()
            .append('rect')
            .attr('class', 'catColor customers')
            .attr('opacity', 0.5)
            .attr('width', margin.left)
            .attr('height', yScale.bandwidth())
            .attr('fill', function(d) {return color(customerSegment)})
            .attr("transform", "translate(" +( - margin.left )+")") // start from edge of svg
            .attr("y", function (d) {return yScale(d["Customer Name"]);}); 
        
    
        //format xAxis values to 1 significant figures
        let xAxisFormat = function(d) {return d==0? 0 : d < 1000? `$${d.toString()[0]}h`: d3.format('$.1s')(d);}
    
        // Create xAxis with xScale and apply xAxisFormat, remove outer ticks
        let xAxis = d3.axisBottom(xScale).tickFormat(xAxisFormat).tickSizeOuter([0])
            
        // Call xAxis and translate to position, give xAxis a class for formatting
        let xAxisGroup = svg.append("g").attr('class', 'xAxis').attr("transform",`translate(0, ${height})`).call(xAxis);
    
        // reduce extra long product names in y scale
        let yAxisFormat = function(d) {return d.length > 70? d.slice(0,70) + '...' : d;}
    
        // create yAxis using yScale and apply yAxisFormat
        let yAxis = d3.axisLeft(yScale).tickFormat(yAxisFormat).tickSize([0])
    
        // Call and append y axis with a class formatting
        // used class to make path and lines transparent
        svg.append("g").attr("class", "yAxis").call(yAxis)

        //Add a title to the x-axis
        xAxisGroup.append('text')
        .text('Profits')
        .attr('y', margin.bottom/2 + 10) 
        .attr('x', width/2)
        .style('fill', 'black')
        .attr('font-size', 14)
        .attr('text-anchor', 'middle');
    
   
        let barchart = svg.append('g')// appends a new 'g' element to the svg
                          .selectAll('rect')
                          .data(filtereddata)
                          .enter()
                          .append('rect')
                          .attr('class', 'customerRect')
                          .attr('x', xScale(0))
                          .attr("y", function (d) {return yScale(d["Customer Name"]);})
                          .attr('height', yScale.bandwidth())
                          .attr('width', 0)
                          .attr('fill', function(d){
                            console.log(catColorScheme(category))
                            console.log(category)
                            if(category != 'All'){
                              return catColorScheme(category)
                            }else{
                              return 'green' // set the fill color to green
                            }
                          })
                          .attr('stroke', 'black')
                          // hover over event
                          .on('mouseover', function(event, d){
                            d3.selectAll(".customerRect").style("opacity", 0.4);
                            d3.select(this).style("opacity", 1);
                            tooltip.transition().duration(300).style("opacity", 1); //showing tooltip
                            tooltip //adding data in tooltip
                              .html(
                                `<span style="font-size:20px;font-weight:bold">Customer: ${
                                  d['Customer Name']
                                }<br>Profit: ${d3.format("$,")(d.Profit)}</span>`
                              )
                              .style("visibility", "visible") //adding values on tooltip
                              .style("left", event.pageX + "px") //for getting the horizontal or x position of cursor and giving it to tooltip
                              .style("top", event.pageY + "px"); //for getting y value of cursor and giving it to tooltip
                          })
                          .on('mouseleave', function(event){
                            d3.selectAll(".customerRect").style("opacity", 1);
                            tooltip.style('visibility', 'hidden')
                          })
    
        barchart.transition().duration(1000)
                .attr('width', function(d) { return xScale(d.Profit)})
    
        
        let title;
          title = `Top 10 Customers by Profit Share in ${customerSegment} Segment`
        
    
        svg.append('text')
          .attr('fill', 'black')
          .text(title)
          .attr('x', (width + margin.left + margin.right)/2 - margin.left)
          .attr('y', 0)
          .attr('text-anchor', 'middle')
          .attr('font-weight', 'bold')
    
        

          // doubleclick svg to return from segment drill down
        
        d3.select("#donutchart svg").on('dblclick', function(event){
          // return to prefilter
          if(customerChart == true){
              return_value = filterData(json, category); //filtering data
              segment = return_value.segment;
              segment_obj = return_value.segment_obj;
              customerChart = false
              draw(segment_obj); //redrawing chart   
          }
      })

    
      }
  }
};
