d3.csv("TreeMap4.csv", d3.autoType).then(treemap)

function treemap(json) {
// d3.csv("TreeMap.csv").then(function (json) {

  // defining default
  let rectAmount = 5, locSelected = 'City', category = "All"//"Office Supplies" //;
  let locName,svg, svg1, filteredbylocation;
  let catColorScheme = d3.scaleOrdinal().domain(['Furniture', 'Office Supplies', 'Technology']).range(['brown','orange','dodgerblue'])
  
  function filterData(data, category) {
    //for filtering data on the basis of category value
    let segment_obj = {},
        segment = [];

  if(category != 'All') {
          data = data.filter(function(d){ return d.Category == category})
  }

    data.forEach((d) => {
      //loop
        if (segment_obj[d[locSelected]] == undefined) {  //if city does not exist as a key in segment_obj 
          //processing data
          segment_obj[d[locSelected]] = d.Sales;         //create it and let its value be the Sales value
          segment.push(d[locSelected]);
        } else {                                 //if city exists as key
          segment_obj[d[locSelected]] =
            segment_obj[d[locSelected]] + d.Sales;       // add the value with current value
        }
    });

    return {
      segment: segment,               //list of cities
      segment_obj: segment_obj,       //return object of city and total sales value
    };
  }
  
  // Defining letiables
  let segment = [],
      segment_obj = {},
      return_value;

  let categories = [],
      categories_obj = {};

  //processing data
  json.forEach((d) => {
    if (categories_obj[d.Category] == undefined) {
      categories.push(d.Category);              // list of categories
      categories_obj[d.Category] = 5;           // object of categories and with value 5?  // not necessery set or if in can be used instead
    }
  });

  // sort categories alphbetically
  categories.sort()

  // Add All to first part of list
  categories.unshift('All')

  return_value = filterData(json, categories[0]); //calling filter function
  segment = return_value.segment;                     //return the list of the cities
  segment_obj = return_value.segment_obj;             //return the object of the cities and the Sales Values

  // Create a selection menu
  let select = document.getElementById("menu3");
  for (let i = 0; i < categories.length; i++) {
    //creating dynamically options of select menu
    let opt1 = document.createElement("option");
    opt1.value = categories[i];
    opt1.innerHTML = categories[i];
    select.appendChild(opt1);
  }

  // list
  let location = ['Cities', 'States', 'Regions'],
  locationvalue = ['City', 'State', 'Region']
  let select3 = document.getElementById("menu2");
  for (let i = 0; i < location.length; i++) {
    //creating dynamically options of select menu
    let opt3 = document.createElement("option");
    opt3.value = locationvalue[i];
    opt3.innerHTML = location[i];
    select3.appendChild(opt3);
  }

  // Create a list
  let ranking = ['Top 5', 'Top 10']
  // Create a selection menu
  let select2 = document.getElementById("menu1");
  for (let i = 0; i < ranking.length; i++) {
    //creating dynamically options of select menu
    let opt2 = document.createElement("option");
    opt2.value = ranking[i];
    opt2.innerHTML = ranking[i];
    select2.appendChild(opt2);
  }


  //chart(segment_obj, objColors); //drawing chart
  chart(segment_obj); //drawing chart

  // Clicking the menu Event
   d3.select('#menu3').on("change", function (d) {
    //adding on change event in select menu
    category = document.getElementById("menu3").value; //getting selected category
    return_value = filterData(json, category); //filtering data
    segment = return_value.segment;
    segment_obj = return_value.segment_obj;
    chart(segment_obj); //redrawing chart
  });

  d3.select('#menu2').on("change", function (d) {
    //adding on change event in select menu
    locSelected = document.getElementById("menu2").value; //getting selected value
    return_value = filterData(json, category); //filtering data
    segment = return_value.segment;
    segment_obj = return_value.segment_obj;
    chart(segment_obj); //redrawing chart

    if(locSelected == 'Region') {
      document.getElementById('menu1').disabled = true
    }else{
      document.getElementById('menu1').disabled = false
    }
  });

  // for ranking selection
  d3.select('#menu1').on("change", function (d) {
    let value1 = document.getElementById("menu1").value;
    //adding on change event in select menu
   
    // then
    if (value1 == 'Top 10') {
      rectAmount = 10
    }else if (value1 == 'Top 5'){
      rectAmount = 5
    }

    return_value = filterData(json, category); //filtering data
    segment = return_value.segment;
    segment_obj = return_value.segment_obj;
    chart(segment_obj); //redrawing chart
  });

 
  function chart(segment_obj) {
    //chart drawing function
    d3.select("#treemap svg").remove(); //removing old svg
    d3.select("#treemap div").remove(); //removing old tooltip div

    let data = [];

    let keys = Object.keys(segment_obj); //List of all the cities
  

    keys.forEach((k) => {               //For each city in keys
      data.push({
        name: k,
        parent: "parent",
        value: Math.floor(segment_obj[k]),  //return the value for that city from the object segment_obj
      });
    });

    const max = d3.max(data, function (d) {  // Get max value
      return d.value;
    });

    const min = d3.min(data, function (d) {   // Get min value
      return d.value;
    });

    
    data = data.sort(function (a, b) {      	    //sort data by value in descending order
      //sorting array from maximum to minimum
        return b.value - a.value;                   // sort ascending would be a-b instead
      });


    let filterdata = [{ name: "parent", parent: "", value: 0 }];    // creating new object to hold top ten
                                                                
    if (locSelected != "Region"){
      for (let i = 0; i < rectAmount; i++) {                    // adding top ten to new object
      filterdata.push(data[i]);
    }} else{
      for (let i = 0; i < 4; i++) {                    // adding top ten to new object
        filterdata.push(data[i]);
      }
    }

    data = filterdata;        // data now only contains top ten

    // Ranking after sorting
    i = 1
    data.forEach(function(o){
      if (o.name !== 'parent'){
        o['rank']= i
        i++
      }
    })

    //console.log(data)

    console.log(data)

    // set the dimensions and margins of the graph
    let margin = { top: 10, right: 165, bottom: 10, left: 20 },
      width = 640 - margin.left - margin.right, 
      height = 475 - margin.top - margin.bottom; 


    // append the svg object to the body of the page
    svg1 = d3
      .select("#treemap")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)

    console.log(svg1)

    svg = svg1.append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    console.log(svg)


    let cross = d3.symbol().type(d3.symbolCross)

    const colorLegend = d3.scaleOrdinal()
                          .domain(['Furniture', 'Office Supplies', 'Technology'])
                          .range(['brown','orange','dodgerblue'])

    let legend = svg1.append('g')
                      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                      .attr('id', 'colorLegend')
                      .selectAll('path')
                      .data(colorLegend.domain())
                      .enter()
                      .append('path')
                      .attr('d', cross.size(150))
                      .attr('class', function(d){ return `legend ${d.replace(' ', '_')}`})
                      .attr('fill', colorLegend)
                      .attr('transform', (d,i) => `translate(${width + 30},${i * 40 + 15})`)

    let legendtext = d3.select('#colorLegend')
                      .selectAll('text')
                      .data(colorLegend.domain())
                      .enter()
                      .append('text')
                      .text(d => d)
                      .attr('class', function(d){ return `legend ${d.replace(' ', '_')}`})
                      .classed('button', true)
                      .attr('fill', colorLegend)
                      .attr('transform', (d,i) => `translate(${width + 45},${i * 40 + 15})`)
                      .attr('dy', '.35em')
                
    // Show only present category legend
    d3.selectAll('#treemap .legend').style('opacity', 0.3)
    d3.selectAll(`#treemap .${category.replace(' ', '_')}`).style('opacity', 1)
   

    let root = d3
                .stratify()
                .id(function (d) {
                  return d.name;      // name of city
                }) // Name of the entity (column name is name in csv)
                .parentId(function (d) {
                  return d.parent;
                })(
                // Name of the parent (column name is parent in csv)
                data
              );

    root.sum(function (d) {
      return d.value;
      // +d.value has already been converted to number
    }); // Compute the numeric value for each entity
    console.log(root)

    let tooltip = d3 //adding tooltip div
                    .select("#treemap")
                    .append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);

    d3.treemap().size([width, height]).padding(4)(root); //compute position

    // color by category
    let catColor;
    if(category == "Furniture"){
      catColor = 'brown'    
    }else if(category == "Office Supplies"){
      catColor = 'orange'
    }else if(category =="Technology"){
      catColor = 'dodgerblue'      
    }
    // for all categories ...
    else{ 
      // ... return green
      catColor = 'green'
    }

    console.log(catColor)

   

    let colourScale = d3.scaleSequential()
                        .range(['blue', 'white'])

    colourScale = d3.scaleSequential()
                                    .domain([0, rectAmount + 5])
                                    .interpolator(d3.interpolate(catColor, 'white')); 
    
    if (locSelected == 'Region'){
      colourScale = d3.scaleSequential()
                      .domain([0, 6])
                      .interpolator(d3.interpolate(catColor, 'white')); 
    }

    
    let scaleby = 1.15


    if(locSelected == 'City') {

    // Making pattern for svg images
    let pattern = d3.select('svg').append('defs')
                  .selectAll('pattern')
                  .data(root.leaves())
                  .enter()
                  .append('pattern')
                  .attr('id', function(d) {return `${(d.data.name).replace(/ /g, '_')}`})
                  .attr('height', '100%')
                  .attr('width', '100%')
                  .attr('patternContentUnits', 'objectBoundingBox')
                  .append('image')
                  .attr('height', 1)
                  .attr('width', 1)
                  .attr('preserveAspectRatio', 'xMidYMid slice')
                  .attr('xlink:href', function(d) {return `img/${(d.data.name).replace(/ /g, '_')}.jpg`})
    }


    // Draw rectangles for treemap
    svg 
      .selectAll("rect")
      .data(root.leaves())
      .enter()
      .append("rect")
      .attr("class", function(d) {return `treemap treemapChart ${(d.data.name).replace(/ /g, '_')}`})
      .attr("x", function (d) {
        //calculate x position
        return d.x0;
      })
      .attr("y", function (d) {
        //calculate y position
        return d.y0;
      })
      .attr("width", function (d) {
        //calculate width
        return d.x1 - d.x0;
      })
      .attr("height", function (d) {
        //calculate height
        return d.y1 - d.y0;
      })
      .style("stroke", "black")
      .style("fill", function (d, i) {
        return colourScale(i);
      })
      .style('opacity', 0)
      .transition().duration(1000)
      .style('opacity',1)
      .delay(function(d,i){return i * 100})
      .on("interrupt", function(event) {
        d3.selectAll('tspan').style('opacity', 1)
        d3.selectAll(".treemap").style("opacity", 0.4);
        d3.select(this).style("opacity", 1)
      })


      // delay applying interacteraction, which do not think is neccesasary
      setTimeout(() => { 
      
      d3.selectAll("rect").classed('treemap', true);

      svg.selectAll('.treemap')
      .on("mouseover", function (event, d, i) {
        //mouseover event for tooltip
        d3.selectAll(".treemap").style("opacity", 0.4);
        d3.select(this).style("opacity", 1);
        //increase size by scaleby
        console.log((d.data.name).replace(/ /g, '_'))
        //d3.select(this).raise()
        // Select both text and text to raise
        d3.selectAll(`.${(d.data.name).replace(/ /g, '_')}`).raise()
        d3.selectAll(`.${(d.data.name).replace(/ /g, '_')}`).classed('hover', true)
        //d3.select(`text.${(d.data.name).replace(/ /g, '_')}`).attr('font-size', 0)
        if(locSelected == 'City') {
        d3.select(this).transition().duration(500)
          .attr("x", function (d) {return d.x0 - ((d.x1 - d.x0) * scaleby - (d.x1 - d.x0))/2;})
          .attr("y", function (d) {return d.y0 - ((d.y1 - d.y0) * scaleby - (d.y1 - d.y0))/2;})
          .attr("width", function (d) {return (d.x1 - d.x0) * scaleby;})
          .attr("height", function (d) {return (d.y1 - d.y0) * scaleby;})
        //d3.select(this).attr('fill', function(d){return `url(#${(d.data.name).replace(/ /g, '_')})`})
        d3.select(this).style('fill',  function(d){return `url(#${(d.data.name).replace(/ /g, '_')})`})
        }
        tooltip.transition().duration(300).style("opacity", 1); //showing tooltip
        tooltip //adding data in tooltip
          .html(
            `<span style="font-size:20px;font-weight:bold">${locSelected}: ${
              d.data.name
            }<br>Rank: ${d.data.rank}
            <br></span><span style="font-size:20px;font-weight:bold">Revenue: ${d3.format("$,")(Math.ceil(
              d.data.value)
            )}
           `
          )
          .style("visibility", "visible") //adding values on tooltip
          .style("left", event.pageX + "px") //for getting the horizontal or x position of cursor and giving it to tooltip
          .style("top", event.pageY + "px"); //for getting y value of cursor and giving it to tooltip
      })
      .on("mouseleave", function (d) {
        //hiding tooltip on mouseout
        d3.selectAll(".treemap").style("opacity", 0.91);
        // return to prevoius size and colour
        d3.selectAll('.hover').classed('hover', false)
        //d3.select(this).style("fill", function (d) {return objColors[d.data.name];})
        d3.select(this).style("fill", function (d, i) {return colourScale(d.data.rank - 1);})
        d3.select(this).transition().duration(500)
        .attr("x", function (d) {return d.x0;})
        .attr("y", function (d) {return d.y0;})
        .attr("width", function (d) {return d.x1 - d.x0;})
        .attr("height", function (d) {return d.y1 - d.y0;})
        //d3.select(`text.${(d.data.name).replace(/ /g, '_')}`).attr('font-size', 12)
        tooltip
          .style("visibility", "none")
          .transition()
          .duration(301)
          .style("opacity", 0);
      })
      //adding click event for top products
      // on click get name and save to variable, locName
      .on('click', function(event, d){
        locName = d.data.name
        topProducts(locName)
      })

      }, 0)

      // change category by category legend
      //let legend;
      legendtext
      .on("click", function(event){
        if(select.value != d3.select(this).text()) {
          select.value = d3.select(this).text() //"Furniture" // d3.select(this).text // this.HTML
          console.log(select.value)
          category = select.value
          return_value = filterData(json, category); //filtering data
          segment = return_value.segment;
          segment_obj = return_value.segment_obj;
          //chart(segment_obj, objColors); //redrawing 
          chart(segment_obj); //redrawing
        }
      })


    svg
      .selectAll("text")
      .data(root.leaves())
      .enter()
      .append("text")
      .attr('class', function(d) {return `treemapChart ${(d.data.name).replace(/ /g, '_')}`})
      .selectAll("tspan")
      .data((d) => {
        return d.data.name
          .split(/(?=[A-Z][^A-Z])/g) // split the name of city
          .map((v) => {
            return {
              text: v,
              x0: d.x0, // keep x0 reference
              y0: d.y0, // keep y0 reference
            };
          });
      })
      .enter()
      .append("tspan")
      .attr("x", (d) => d.text == 'Jacksonville' && rectAmount > 10 && category == 'Furniture'? d.x0 + 2 : d.x0 + 5)
      .attr("y", (d, i) => d.y0 + 15 + i * 10) // offset by index
      .text(function (d) {
        return d.text;
      })
      .attr("font-size", "0.6em")
      //.attr("fill", "white");
      .attr('font-weight', 'bold')

      let textanimation = d3.selectAll('tspan')
                            .style('opacity', 0)
                            .transition().duration(900)
                            .style('opacity',1)
                            .delay(function(d,i){return i * 95})

    
      
  }

  // Function for Top Products in selected location
  function topProducts(locName){

    // remove the previous elements, transition them out
    d3.selectAll('.treemapChart').remove()
    d3.select("#treemap svg").remove(); //removing old svg
    d3.select("#treemap div").remove(); //removing old tooltip div

    filteredbylocation = true
   
    // d3.select(this).datum

    // get the neccessary data

    // filter data by category and locselected
    let filtereddata;
    if(category == 'All'){
      filtereddata = json.filter(function(d) {return d[locSelected] == locName})
    }else{
      filtereddata = json.filter(function(d) {return d[locSelected] == locName && d.Category == category})
    }

    let filtereddataobj = {};

    filtereddata.forEach((d) => {
    // Summing Cost and Profit
        if (filtereddataobj[d["Product Name"]] == undefined) {
            filtereddataobj[d["Product Name"]] = {
                Category: d.Category,
                Sales: d.Sales,
                "Product Name": d["Product Name"],  // name of /category/subcategory/state/city
            };
        } 
        else {
            filtereddataobj[d["Product Name"]].Sales = filtereddataobj[d["Product Name"]].Sales + d.Sales
        }
    });
    
    filtereddata = [];

    // For each product/category/subcategory/state/city...
    Object.keys(filtereddataobj).forEach((k) => { 
        //converting data object to array
        filtereddata.push(filtereddataobj[k]);
    });

    // Sort for most profitable
    filtereddata.sort((a,b) => d3.descending(a.Sales, b.Sales))

    //
    filtereddata = filtereddata.slice(0,10);

    filtereddata.forEach(function(d){
      // Remove � character from name
      d['Product Name'] = (d['Product Name']).replace(/�/g, ' ')
    })
  

    let margin = {left: 360, top: 30, right: 150, bottom: 40} //size of chart + margin or sides  
        width = 1200 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;


    svg1 = d3
        .select("#treemap")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
  
    svg = svg1.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      
    let tooltip = d3 //adding tooltip div
                .select("#treemap")
                .append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

    
    let xMax = d3.max(filtereddata, function(d){return d.Sales})

    // create  new scale for bar chart
    let xScale = d3.scaleLinear()
                    .domain([0, xMax])
                    .range([0, width]);

    let yScale = d3.scaleBand()
                    .domain(filtereddata.map(function (d) {return d["Product Name"];}))
                    .range([0, height])
                    .padding(0.1)
                

    

    // Before calling y axis, append rects according to colour of categor
    svg.selectAll(".catColor")
        .data(filtereddata)
        .enter()
        .append('rect')
        .attr('class', 'catColor products')
        .attr('opacity', 0.5)
        .attr('width', margin.left)
        .attr('height', yScale.bandwidth())
        .attr('fill', 'grey')
        .attr("transform", "translate(" +( - margin.left )+")") // start from edge of svg
        .attr("y", function (d) {return yScale(d["Product Name"]);}); 
    

    // Force negative values to positive and format xAxis values to 2 significant figures
    // If d = 0, return 0
    let xAxisFormat = function(d) {return d==0? 0 : d < 1000? `$${d.toString()[0]}h`: d3.format('$.1s')(d);}

    // Create xAxis with xScale and apply xAxisFormat, remove outer ticks
    let xAxis = d3.axisBottom(xScale).tickFormat(xAxisFormat).tickSizeOuter([0])
        
    // Call xAxis and translate to position, give xAxis a class for formatting
    let xAxisGroup  = svg.append("g").attr('class', 'xAxis').attr("transform",`translate(0, ${height})`).call(xAxis);

    // reduce extra long product names in y scale
    let yAxisFormat = function(d) {return d.length > 65? d.slice(0,65) + '...' : d;}

    // create yAxis using yScale and apply yAxisFormat
    let yAxis = d3.axisLeft(yScale).tickFormat(yAxisFormat).tickSize([0])

    // Call and append y axis with a class formatting
    // used class to make path and lines transparent
    svg.append("g").attr("class", "yAxis").call(yAxis)

    //Add a title to the x-axis
    xAxisGroup.append('text')
    .text('Sales Revenue')
    .attr('y', margin.bottom/2 + 10) 
    .attr('x', width/2)
    .style('fill', 'black')
    .attr('font-size', 14)
    .attr('text-anchor', 'middle');



    let barchart = svg.append('g')
                      .selectAll('rect')
                      .data(filtereddata)
                      .enter()
                      .append('rect')
                      .attr('class', 'productRect')
                      .attr('x', xScale(0))
                      .attr("y", function (d) {return yScale(d["Product Name"]);})
                      .attr('height', yScale.bandwidth())
                      .attr('width', 0)
                      .attr('fill', function(d){ return catColorScheme(d.Category)})
                      .attr('stroke', 'black')
                      // hover over event
                      .on('mouseover', function(event, d){
                        d3.selectAll(".productRect").style("opacity", 0.4);
                        d3.select(this).style("opacity", 1);
                        tooltip.transition().duration(300).style("opacity", 1); //showing tooltip
                        tooltip //adding data in tooltip
                          .html(
                            `<span style="font-size:20px;font-weight:bold">Product Name: ${
                              d['Product Name']
                            }<br>Revenue: ${d3.format("$,")(d.Sales)}</span><span style="font-size:20px;font-weight:bold" id = 'lsttip'></span>`
                          )
                          .style("visibility", "visible") //adding values on tooltip
                          .style("left", event.pageX + "px") //for getting the horizontal or x position of cursor and giving it to tooltip
                          .style("top", event.pageY + "px"); //for getting y value of cursor and giving it to tooltip
                        if(category == 'All'){
                          d3.select('#lsttip').html(`<br>Category: ${d.Category}`)
                        }
                      })
                      .on('mouseleave', function(event){
                        d3.selectAll(".productRect").style("opacity", 1);
                        tooltip.style('visibility', 'hidden')
                      })

    barchart.transition().duration(1000)
            .attr('width', function(d) { return xScale(d.Sales)})

    let title;
    if(locSelected == 'Region'){
      title = `Top 10 Products by Sales Revenue in ${locName} Region`
    }else {
      title = `Top 10 Products by Sales Revenue in the ${locSelected} of ${locName}`
    }

    svg.append('text')
       .attr('fill', 'black')
       .text(title)
       .attr('x', (width + margin.left + margin.right)/2 - margin.left)
       .attr('y', 0)
       .attr('text-anchor', 'middle')
       .attr('font-weight', 'bold')


    //let bckButton = 

    // doubleclick svg to return from category filter
    if(filteredbylocation == true) {
      d3.select("#treemap svg").on('dblclick', function(event){
          // return to prefilter
          if(filteredbylocation == true){
              //category = null // return category to null
              return_value = filterData(json, category); //filtering data again
              segment = return_value.segment;
              segment_obj = return_value.segment_obj;
              //chart(segment_obj, objColors); //redrawing chart
              chart(segment_obj); //redrawing chart
          }
      })

    }

  }

}
