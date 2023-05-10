# Tree map

This graph shows a tree map chart

The treemap functions as a visualization composed of nested rectangles. These rectangles represent certain categories within a selected dimension and are ordered in a hierarchy, or “tree.” Quantities and patterns can be compared and displayed in a limited chart space. Treemaps represent part to whole relationships.

<img src="../../img/charts Image/Arinze.PNG" alt="App interface" width="1000" height="600">

## Purpose: 
    To create visualizations that depict the sales revenue generated from the top 5 and 10 states, as well as the products that primarily contributed to revenue in each state and city

## Functionality:
-   The visualization includes a legend that represents the three business categories and serves as a filter for selecting each category. 
-   The first two drop-down menus allow users to filter the top 5 and top 10 cities and states with the highest revenue. 
-   The last drop-down menu allows users to filter products by category. 
-   When the mouse hovers over each location, users can view a breakdown of sales revenue, rank, name, and a landmark picture of the location.

## Insights:
-   New York City generated the highest revenue of $256 over a four-year period, followed by Los-Angeles, Seattle, San Francisco, and Philadelphia. 
-   In 2016, Los Angeles overtook New York as the highest revenue-generating city. 
-   At the city level, the Canon image class 2200 advanced copier in the Technology category -    contributed the most to revenue. 
-   The High-speed automatic electric letter opener in the Office Supplies category made the most revenue overall at the state level.

## Lesson learned:
-   One of the challenges encountered was arranging hierarchical data using the D3 stratify function. 
-   Formatting the values of the tooltip to achieve a more visually appealing and readable output was also challenging.
