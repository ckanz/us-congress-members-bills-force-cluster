On this document are three different concepts that have been sketched out for the web application:

# Concpet 1
### Sortable Bar Chart of Members
![Concept1](https://github.com/ckanz/congressional-representatives-california-visualisation/blob/sketches/concept/concept_1.jpg?raw=true)

In this concept, each member of Congress is listed in a bar chart, of which the metric of the x-axis can be chosen and sorted by. Metrics that members can be sorted (descending and ascending) by are
* total number of votes
* numbers of "yes" votes
* number of "no" votes
* number of "no vote"
* expensed amount in USD
* number of statements

The name of each member is coloured in the party colour and an icon before the name indicates whether it's a member of the house or senate. Each name is also a link the the member's details page.

The details page of a member contains all information about the member in the top left of the page. The top right of the page has links to social media and recent news reports. On the center of the page are displayed three main metrics in boxes: Total numbers of votes, expensed money and statements. Below each box is a vertical timeline of circles where each circle represents a vote, an expense or a statement. When hovering over a circle, details about the event will be displayed in a tooltip. Size of circle on the expenses line indicates the amount of expensed money and colour on the vote line indicates the type of vote (yes, no or no vote).

---

# Concept 2
### Sortable grid of business cards
![Concept2](https://github.com/ckanz/congressional-representatives-california-visualisation/blob/sketches/concept/concept_2.jpg?raw=true)

In the second concept, all related members of Congress are listed in a grid of business cards. On each business card are the overall details of each member. Like the previous concept, the list can be sorted by the same metrics state above.

When clicking on a business card, the details page of the member will be displayed. This details page contains the business card in the top left and in the center a dashbaord displaying the number of and type of votes in a bar chart, expenses over time by type in a stacked bar chart and number of statements over time on a line chart. When interacting with elements on each chart, the detail of each data point (vote, expense or statement) can be seen in a tooltip. A small list icon above each chart will bring the user to the full detailed list of votes, expenses or statements on a new page.

---

# Concept 3
![Concept3](https://github.com/ckanz/congressional-representatives-california-visualisation/blob/sketches/concept/concept_3.jpg?raw=true)

The thrid concept is a force cluster where each cluster node represents a member of Congress. In the center of each node is the name of the member and the node's background color represents the associated party. The size of each node can represent any of the listed metrics above, which can be selected and changed through a drop-down list. A three-coloured  border around the node displays the ratio of yes, no and not voted votes of each member. Nodes are linked though lines of different stroke-widths. These lines and theor widths indicate the number of same votes on the same bills. The thicker the line between two nodes is, the more same votes on the same bill have taken place by both of these members.

The force cluster can be split apart onto different areas of the screen by different dimensions, e.g. party or vote type on a certain bill.

---
