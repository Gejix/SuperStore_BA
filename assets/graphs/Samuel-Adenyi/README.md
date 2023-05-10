# Triangle chart

A Triangle chart is a variation of a scatter chart in which the data points are replaced with traingles, and an additional dimension of the data is represented in the size of the triangles.

<img src="../../img/charts Image/Yemi.PNG" alt="App interface" width="1000" height="600">

## Purpose: 
    To show the relationship between sales revenue, profits, & quantity by category and sub-category.

## Functionality:
-   The product category and sub-category can be selected through a drop-down button interface.
-   A legend is presented as a navigational tool to filter the available product categories.
-   The tooltip function is utilized to visually convey significant metrics of the data points.
 
## Insights: : 
-   Phones in the Technology category generated the highest revenue ($330K) and profits ($44.5K) for the business.
-   Binders in the Office Supply category had the highest quantity of units sold (5974)
-   Furniture category even though sold more than office supplies but made less profit.

## Lesson learned:
-   The process of generating triangles for the chart posed a computational challenge.
-   The task of rotating the triangles presented a formidable obstacle.
-   Creating an allowance for the triangle charts was fraught with difficulties.
-   Employing D3 join function to add an event to the legends proved to be arduous, necessitating the -   use of the filter without exit the SVG polygons.
-   The development and manipulation of the animation workflow posed significant challenges.
