d3.csv("Tonado.csv", d3.autoType).then(tornadoChart)

function tornadoChart(data) {

    const catColorScheme = d3.scaleOrdinal()
                                .domain(['Furniture', 'Office Supplies', 'Technology'])
                                .range(['brown','orange','dodgerblue'])
    
    const costProfitScheme = d3.scaleOrdinal()
                                .range(['#f9b814', 'limegreen', 'red']) //"#008083"
                                .domain(['Cost', 'Profit', 'Loss']) 

    let animateoutduration = 500,
        animationInDuration = 800
        largeFont = 15,
        symbolsize = 200;

    // Global variables in tornadoChart function
    let maxCost, minCost, maxProfit, minProfit, selectcondition, xScale, filteredbycategory, category, topOrBottom;      //xScale is here because of transition out

    
    data.forEach(function(d){
        // Remove � character from name
        d['Product Name'] = (d['Product Name']).replace(/�/g, ' ')
    })
    

    
    function filterCondition(condition, category = undefined) {

        selectcondition = condition  

        let filtereddata = data;

        // if category parameter/condition exists, filter by category
        if(category != undefined) {
            filtereddata = data.filter(function(d){ return d.Category == category})
        }

        let filtereddataobj = {};

        filtereddata.forEach((d) => {
        // Summing Cost and Profit
            if (filtereddataobj[d[condition]] == undefined) {
                filtereddataobj[d[condition]] = {
                    Cost: d.Cost,
                    Profit: d.Profit,
                    Category: d.Category,
                    Sales: d.Sales,
                    Discount: [], // empty list to append all discount values
                    "Product Name": d[condition],  // name of /category/subcategory/state/city
                    // what of quantity of items and product number?
                }; 
                // append discount value to list
                filtereddataobj[d[condition]].Discount.push(d['Discount Rate'])
            } 
            else {
                filtereddataobj[d[condition]].Cost = filtereddataobj[d[condition]].Cost + d.Cost
                filtereddataobj[d[condition]].Profit = filtereddataobj[d[condition]].Profit + d.Profit
                filtereddataobj[d[condition]].Sales = filtereddataobj[d[condition]].Sales + d.Sales
                filtereddataobj[d[condition]].Discount.push(d['Discount Rate'])
            }
        });
        
        filtereddata = [];

        Object.keys(filtereddataobj).forEach((k) => { //for each product/category/subcategory/state/city.....
            //converting data object to array
            filtereddata.push(filtereddataobj[k]);
        });

        // Sort for most profitable
        filtereddata.sort((a,b) => d3.descending(a.Profit, b.Profit))

        // Sort for least profitable only in Products, Cities and States
        if (condition == 'Product Name' || condition == 'City' || condition == 'State') {
            // enable options1 if disabled
            document.getElementById('options1').disabled = false
            // When #options1 is 'Least Profitable'
            if(topOrBottom == 'Bottom') {
                // sort ascending by profit amount
                filtereddata.sort((a,b) => d3.ascending(a.Profit, b.Profit))
            }
        }else{
            // disable options1
            document.getElementById('options1').disabled = true
        }


        // If select condition is Product
        if(condition == 'Product Name') {
            // select first 10 products
            return filtereddata.slice(0,10);
        }
        // If select condition is City or state
        else if(condition == 'City' || condition == 'State') {
            // select first 15 cities or states
            return filtereddata.slice(0,15);
        }
        else {
            // return the whole data
            return filtereddata
        }
    }

    // Creating Top or Least Options Dropdown
    let options1List = ['Top Profitable', 'Least Profitable']
    let options1Values = ['Top', 'Bottom']
    // Create a selection menu
    let options1 = document.getElementById("options1");
    for (let i = 0; i < options1List.length; i++) {
        //creating dynamically options of select menu
        let opt = document.createElement("option");
        opt.value = options1Values[i];
        opt.innerHTML = options1List[i];
        options1.appendChild(opt);
    }


    // On change event in options1 topOrBottom
    d3.select('#options1').on("change", function (d) {
        category = null // return category filter to null
        filteredbycategory = false; // return filtered alert to false
        topOrBottom = document.getElementById("options1").value;
        filtereddata = filterCondition(selectcondition); //filtering data
        drawbar(filtereddata); // redraw chart
      });


    // On change event in options1
    d3.select("#options2").on("change", (d) => {
        //change menu event
        let filtereddata; // data variable
        let animateoutduration = 500
        category = null // return category to null
        filteredbycategory = false;  // return filtered alert to false

        // Transition out
        d3.selectAll('.cost').transition().duration(animateoutduration - 100).attr('width', 0).attr('x', xScale(0))
        d3.selectAll('.profitOrLoss').transition().duration(animateoutduration - 100).attr('width', 0)
        d3.selectAll('.labels').text('')


        if (
            document
            .getElementById("options2")
            .value.localeCompare("Product Name") == 0
        ) {
            filtereddata = filterCondition("Product Name"); // filter data with 'Product Name' selection
        } 
        else if (
            document
                .getElementById("options2")
                .value.localeCompare("Category") == 0
        ) {
            filtereddata = filterCondition("Category"); // filter data with 'Category' selection
        } 
        else if (
            document
            .getElementById("options2")
            .value.localeCompare("Sub-Category") == 0
        ) {
            filtereddata = filterCondition("Sub-Category")  // filter data with 'Sub-Category' selection
        } 
        else if (
            document.getElementById("options2").value.localeCompare("Segment") == 0
        ) {
            filtereddata = filterCondition("Segment"); // filter data with 'Segment' selection
        } 
        else if (
            document
                .getElementById("options2")
                .value.localeCompare("State") == 0
        ) {
            filtereddata = filterCondition("State"); // filter data with State selection
        } 
        else {
            filtereddata = filterCondition("City"); // filter data with City selection
        }
        // Delay drawbar to allow transition out complete and drawbar again with selection
        setTimeout(()=> {drawbar(filtereddata);}, animateoutduration);
    });

    // Calculate total revenue and profit from whole data
    let totalrevenue = d3.sum(data, function(d){return d.Sales})

    let totalProfit = d3.sum(data, function(d){return d.Profit})

    drawbar(filterCondition("Product Name")); //draw chart
    //----------------------------------------------------------------


    function drawbar(filtereddata) {
    //bar draw function

        d3.select("#tornadoChart").html(""); //removing old chart

        // data already arranged according to maximum profit

        let marginleft;

        // Product names need a larger margin
        if(selectcondition == 'Product Name'){
            marginleft = 355
        }
        else{
            marginleft = 130
        }

        let margin = { top: 20, right: 155, bottom: 40, left: marginleft }, //size of chart + margin or sides    //top was once 50//right was 30
        width = 1200 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;


        let svg = d3 //adding svg and g elements
            .select("#tornadoChart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr('id', 'tornadosvg')
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");    /// translate by margins

        let tooltip = d3 //adding tooltip div
            .select("#tornadoChart")          /// select div and append tooltip div
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);         /// non visible


        minCost = d3.min(filtereddata, function(d) {return d.Cost});       /// min cost
        maxCost = d3.max(filtereddata, function(d) {return d.Cost});       /// max cost

        minProfit = d3.min(filtereddata, function(d) {return d.Profit})    /// max profit
        maxProfit = d3.max(filtereddata, function(d) {return d.Profit});   /// max profit

        // if the absolute of minProfit is larger than maxProfit, set maxProfit to equal to the absolute of minProfit
        if (Math.abs(minProfit) > maxProfit) {
            maxProfit = Math.abs(d3.min(filtereddata, function(d) {return d.Profit}));   /// max profit
        }

        // Creating xScale with Cost on left and Profit on right
        xScale = d3.scaleLinear()
                    .range([0 + 10 ,width - 20])    // +10 gives left padding, -20 gives right padding
                    .domain([-maxCost, maxProfit])

        // Force negative values to positive and format xAxis values to 2 significant figures
        // If d = 0, return 0
        let xAxisFormat = function(d) {return d == 0? 0 : Math.abs(d) < 10000? d3.format('.1s')(Math.abs(d)): d3.format('.2s')(Math.abs(d));}

        // Create xAxis with xScale and apply xAxisFormat, remove outer ticks
        let xAxis = d3.axisBottom(xScale).tickFormat(xAxisFormat).tickSizeOuter([0])
            
        // Call xAxis and translate to position, give xAxis a class for formatting
        svg.append("g").attr('class', 'xAxis').attr("transform",`translate(0, ${height})`).call(xAxis);


        // creating yScale
        let yScale = d3 
            .scaleBand()
            .range([0, height])
            .domain(filtereddata.map(function (d) {return d["Product Name"];}))
            .padding(0.1);

        //before calling y axis, append rects according to colour of category
        svg.selectAll(".catColor")
                .data(filtereddata)
                .enter()
                .append('rect')
                .attr('class', 'catColor')
                .attr('width', margin.left)
                .attr('height', yScale.bandwidth())
                .attr('fill', function(d) {return selectcondition == 'Product Name' || selectcondition =='Sub-Category' || selectcondition =='Category' ? catColorScheme(d.Category): 'grey' })
                .attr("transform", "translate(" +( - margin.left )+")") // start from edge of svg
                .attr("y", function (d) {return yScale(d["Product Name"]);}); 
    

        // reduce extra long product names in y scale
        let yAxisFormat = function(d) {return d.length > 75? d.slice(0,75) + '...' : d;}

        // create yAxis using yScale and apply yAxisFormat
        let yAxis = d3.axisLeft(yScale).tickFormat(yAxisFormat)

        // Call and append y axis with a class formatting
        // used class to make path and lines transparent
        svg.append("g").attr("class", "axisColor").call(yAxis); 

        
        /// Append Cost rects
        svg
            .selectAll(".cost")
            .data(filtereddata)
            .enter()
            .append("rect")
            .attr("class", "cost")
            .attr("x", function (d) {
                //at start 0 for animation
                return xScale(0);
            })
            .attr("y", function (d, i) {
                return yScale(d["Product Name"]);
            })
            .attr("height", yScale.bandwidth()) // height according to y scale
            .attr('fill', costProfitScheme('Cost'))
            /////ANIMATION IN///////////
            .transition()
            .duration(animationInDuration) //duration of animation
            .attr("x", function (d) {
                //giving x direction values on the basis of data
                return xScale(- d["Cost"]);
            })
            .attr("width", function (d, i) {
                //giving width on the basis of data
                return xScale(d["Cost"]) - xScale(0);
            })
            .delay((d, i) => {
                //delay
                return i * 105;
            })

        /// Append profitOrLoss rects
        svg 
            .selectAll(".profitOrLoss")
            .data(filtereddata)
            .enter()
            .append("rect")
            .attr("class", function(d){ return `profitOrLoss ${d.Profit > 0? 'profit': 'loss'}`})
            .attr("x", function (d) {
                //at start 0 for animation
                return xScale(0);
            })
            .attr("y", function (d) {
                return yScale(d["Product Name"]);
            })
            .attr("height", yScale.bandwidth())
            .attr("fill", function(d) {return d.Profit > 0? costProfitScheme('Profit'): costProfitScheme('Loss')})
            //////ANIMATION IN ///////
            .transition()
            .duration(animationInDuration)
            .attr("width", function (d) {
                /// positive cause the bars hang 
                if (d["Profit"] > 0){
                return xScale(d["Profit"]) - xScale(0);
                }else{
                return xScale(Math.abs(d["Profit"])) - xScale(0);
                }
            })
            .delay((d, i) => {
                return i * 105;
            })
            .on('end', function(d){
                // Delay classing legendText as active to prevent transition in interruption
                setTimeout(() => {legendText.classed('active', true)}, (filtereddata.length - 1) * 105)
            })
            


        /// MouseEnter and MouseLeave Events for Cost Rects
        svg 
            .selectAll(".cost") //selecting all cost bars
            .on("mouseover", function (event, d) {
            //mouseover event
            d3.selectAll(".cost").style("opacity", 0.4); //changing opacity of all bars of cost group
            d3.select(this).style("opacity", 1); // make focus opaque
            tooltip.transition().duration(300).style("opacity", 1); //display tooltip
            // Calculate some measures
            let profitMargin = d.Profit/d.Sales
            let profitability = d.Profit/d.Cost
            tooltip // data in tooltip
                .html(
                `<span style="font-size:20px;font-weight:bold"> ${selectcondition}: ${d["Product Name"]} <br> 
                </span><span style="font-size:20px;font-weight:bold;color:orange">Cost: ${d3.format("$,.2f")(d.Cost)}</span>
                <br><span style="font-size:20px;font-weight:bold">
                Profit Margin: ${d3.format(".0%")(profitMargin)}<br>
                Profitability: ${d3.format(".0%")(profitability)} </span>`
                )
                .style("visibility", "visible") //showing tooltip
                .style("left", event.pageX + "px") //for getting the x position of cursor
                .style("top", event.pageY + "px"); //for getting y positon of cursor
            })
            .on("mouseleave", function (d) {
            d3.selectAll(".cost").style("opacity", 1); //making all bars of cost group same
            tooltip //hiding tooltip
                .style("visibility", "none")
                .transition()
                .duration(301)
                .style("opacity", 0);
            });
        

        /// MouseEnter and MouseLeave Events for profitOrLoss Rects  
        svg
            .selectAll(".profitOrLoss")
            .on("mouseover", function (event, d) {
            d3.selectAll(".profitOrLoss").style("opacity", 0.4);    //changing opacity of all bars of cost group
            d3.select(this).style("opacity", 1);                    // make focus opaque
            tooltip.transition().duration(300).style("opacity", 1); // make tooltip visible
            let profit, textcolor;
            if (d.Profit > 0){
                profit = 'Profit'
                textcolor = 'green'
            }else{
                profit = 'Loss'
                textcolor = 'red'
            }
            // Calculate some measures
            let profitMargin = d.Profit/d.Sales
            let percentTotalProfit = d.Profit/totalProfit
            tooltip //adding data in tooltip
                .html(
                `<span style="font-size:20px;font-weight:bold"> ${selectcondition}: ${d["Product Name"]} <br> 
                </span><span style="font-size:20px;font-weight:bold;color:${textcolor}">${profit}: ${d3.format("$,")(Math.abs(d.Profit))}</span>
                <br><span style="font-size:20px;font-weight:bold"> Avg. Discnt: ${d3.format(".0%")(d3.mean(d["Discount"]))} <br> 
                Profit Margin: ${d3.format(".0%")(profitMargin)}<br>
                %GT Profit: ${d3.format(".0%")(percentTotalProfit)} </span>`
                )
                .style("visibility", "visible")
                .style("left", event.pageX + "px")
                .style("top", event.pageY + "px");
            })
            .on("mouseleave", function (d) {
            //hiding tooltip on mouseout
            d3.selectAll(".profitOrLoss").style("opacity", 1);
            tooltip
                .style("visibility", "none")
                .transition()
                .duration(301)
                .style("opacity", 0);
            });
            

        //for calculating placement of labels on bars
        let avgCost = maxCost / 7,     // 7 and 4 were strategically chosen with the most favourable results
            avgProfit = maxProfit / 4;


        //placing cost labels
        svg 
            .selectAll(".costtext")
            .data(filtereddata)
            .join("text")
            .attr("class", "costtext labels")
            .attr("x", function (d) {
            //formula for placing on bar or outside bar
            return d["Cost"] >= avgCost
            ? xScale((- d["Cost"])/2)
            : xScale(- d["Cost"]) - 7;
            })
            .attr("y", function (d) {
            return yScale(d["Product Name"]) + yScale.bandwidth() / 2;
            })
            .text(function (d) {
            //text add
            if (d.Cost > 100000){
                return d3.format("$.3s")(d.Cost);
            }else{
                return d3.format("$.2s")(d.Cost);
            }
            })
            .attr('dy', '.35em')
            .attr("font-size", "9px")
            .attr("text-anchor", function(d) {return d["Cost"] >= avgCost? "middle": "end"})
            .attr("fill", 'none')
            .transition().delay((d, i) => {
            return i * 105 + animationInDuration - 200;})
            .attr("fill", "black");

        //placing profit or loss labels
        svg
            .selectAll(".profittext")
            .data(filtereddata)
            .join("text")
            .attr("class", "profittext labels")
            .attr("x", function (d) {
            return d["Profit"] >= avgProfit
                ? xScale(d["Profit"]/2)
                : xScale(Math.abs(d["Profit"])) + 5
            })
            .attr("y", function (d) {
            return yScale(d["Product Name"]) + yScale.bandwidth() / 2;
            })
            .text(function (d) {
            if (d.Profit> 100000){
                return d3.format("$.3s")(d.Profit);
            }else{
                return d3.format("$.2s")(d.Profit);
            };
            })
            .attr('dy', '.35em')
            .attr("font-size", "9px")
            .attr("text-anchor", function(d) {return d["Profit"] >= avgProfit? "middle":""})
            .attr("fill", 'none')
            .transition().delay((d, i) => {
            return i * 105 + animationInDuration - 200;})
            .attr("fill", "black");


            //Modify y tickValues and labels font size when Selction is Segment or Category
            if(selectcondition == 'Segment' || selectcondition == 'Category' || filtereddata.length < 5){
                d3.selectAll('.axisColor text').style('font-size', largeFont)
                d3.selectAll("#tornadoChart .labels").style('font-size', largeFont)
            }

        /*--------------------------------------------------
                        LEGEND
        ----------------------------------------------------*/

        // create squares for legend using d3 symbol
        let square = d3.symbol().type(d3.symbolSquare)//.size(150);

        // then append squares using path element to create legend
        let legend = svg.append('g')
                        .attr('id', 'colorLegend')
                        .selectAll('path')
                        .data(costProfitScheme.domain())
                        .enter().append('path')
                        .attr('d', square.size(symbolsize))
                        .attr('fill', costProfitScheme)
                        .attr('transform', (d,i) => `translate(${width + 30},${i * 40 + 15})`)


        let legendText = d3.select('#colorLegend')
                            .selectAll('text')
                            .data(costProfitScheme.domain())
                            .enter().append('text')
                            .text(d => d).attr('fill', costProfitScheme)
                            .attr('transform', (d,i) => `translate(${width + 40},${i * 40 + 15})`)
                            .attr('dy', '.35em')
                            .classed('button', true)
                            .on('click', function(event){
                                // Only after legend has been classed active to prevent transition interruption ...
                                if(d3.select(this).classed('active') == true) {
                                    // ... make bars blink
                                    d3.selectAll(`.${d3.select(this).text().toLowerCase()}`)
                                        .transition().duration(250)
                                        .style('opacity', 0.4)
                                        .transition().duration(250)
                                        .style('opacity', 1)
                                        .transition().duration(250)
                                        .style('opacity', 0.4)
                                        .transition().duration(250)
                                        .style('opacity', 1)
                                }
                            })

        // when selectcondition is Product, Category or Sub-Category, append legend for Categories
        if(selectcondition == 'Product Name' || selectcondition == 'Category' || selectcondition == 'Sub-Category') {
    
        // Create a group for the catLegend
            const catLegendGroup = svg
                .append('g')
                .attr('id', 'legend-group')
                .attr("transform", `translate(${width + 28},${140})`);

            const catLegend  = catLegendGroup
                .selectAll('circle')
                .data(catColorScheme.domain())
                .enter()
                .append('circle')
                .attr("cy", function(d, i) {return i * 40})
                .attr("r", 5)
                .style("fill", function(d, i){return catColorScheme(d)})
                .attr('class', function(d){ return `legend ${d.replace(' ', '_')}` });


            const catLegendText  = catLegendGroup
                .selectAll('text')
                .data(catColorScheme.domain())
                .enter()
                .append("text")  
                .attr("x", 10) 
                .attr("y", function(d, i) {return i*40})               
                .attr("dy", ".35em") // 1em is the font size so 0.35em is 35% of the font size. This attribute offsets the y position by this amount.
                .style("fill", function(d, i){return catColorScheme(d)})
                .text(function(d){return d})
                .attr('class', function(d){ return `legend ${d.replace(' ', '_')}` })
                .classed('button', true)
                //.attr('class', 'button')
                .on('click', function(event) {
                    if(category != d3.select(this).text()){
                        category = d3.select(this).text()
                        filteredbycategory = true;
                        filtereddata = filterCondition(selectcondition, category)
                        drawbar(filtereddata)
                        d3.selectAll('.legend').style('opacity', 0.3)
                        d3.selectAll(`.legend.${category.replace(' ', '_')}`).style('opacity', 1)
                    }
                    
                })

                // doubleclick svg to return from category filter
                if(filteredbycategory == true) {
                    d3.select('#tornadosvg').on('dblclick', function(event){
                        // return to prefilter
                        if(filteredbycategory == true){
                            category = null // return category to null
                            filteredbycategory = false;  // return filtered alert to false
                            filtereddata = filterCondition(selectcondition) // filter data again
                            drawbar(filtereddata)       // redraw chart
                        }
                    })

                    // or create back button
                    const backbutton = 
                    catLegendGroup.append('rect')
                                .attr("y", 3 * 40)
                                .attr('height', 20)
                                .attr('width', 50)
                                .attr('fill', 'grey')
                                .classed('button', true)
                                .classed('backbutton', true)
                                
                    const backbuttontext =           
                    catLegendGroup.append('text')
                                .attr("y", 3 * 40 + 10)
                                .attr('x', 5)
                                .attr("dy", ".35em")
                                .text('Back')
                                .classed('button', true)
                                .classed('backbutton', true)

                    // click button to return from category filter
                    d3.selectAll('#tornadoChart .backbutton')
                        .on('click', function(event){
                            // return to prefilter
                                category = null // return category to null
                                filteredbycategory = false;  // return filtered alert to false
                                filtereddata = filterCondition(selectcondition) // filter data again
                                drawbar(filtereddata)       // redraw chart
                        })
                }
            }
    }
};
  