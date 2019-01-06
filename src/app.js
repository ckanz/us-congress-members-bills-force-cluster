import './style.css';
import { getMembers } from './api-functions';
import { forceSimulation, forceCollide, forceManyBody, forceCenter } from 'd3-force';
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { max, min } from 'd3-array';
import { arc } from 'd3-shape';
import { zoom } from 'd3-zoom';

const width = window.availWidth || 1000;
const height = window.availHeight || 500;

const myZoom = zoom()
  .on('zoom', (d, i, elements) => {
    if (elements[i] && elements[i].__zoom) {
      select('#cluster').attr('transform', elements[i].__zoom);
    }
  });

const myInnerArc = arc()
  .innerRadius(d => d.radius - d.radius * 0.25)
  .outerRadius(d => d.radius - d.radius * 0.17)
  .cornerRadius(12)
  .startAngle(0)
  .endAngle(d => {
    const angle = d.raw.detail.roles[0].missed_votes_pct / 100;
    return (angle * Math.PI * 2);
  });

const getRadialBarForQuarter = (quarter, scale) => {
  const radialBarChart = arc()
    .innerRadius(d => d.radius)
    .outerRadius(d => d.radius + scale(d.radialBars[quarter - 1]))
    .startAngle(d => ((quarter - 1) / 4) * (Math.PI * 2))
    .endAngle(d => (quarter / 4) * (Math.PI * 2));
  return radialBarChart;
}

const getScale = data => {
  const maxValue = max(data.map(d => d.seniority));
  const minValue = min(data.map(d => d.seniority));
  const scale = scaleLinear().range([8, 20]).domain([minValue, maxValue]); // TODO: make range dynamic to screen size
  return scale;
};

const getRadialBarScale = data => {
  const maxValue = max(data.map(d => getExpenseValue(d, 0)));
  const minValue = min(data.map(d => getExpenseValue(d, 0)));
  const scale = scaleLinear().range([0, 5]).domain([minValue, maxValue]); // TODO: make range dynamic to screen size
  return scale;
};

const getForce = (nodeData, clusterElement) => {
  const myForce = forceSimulation()
    .force('charge', forceManyBody().strength(0.2))
    .force('collide', forceCollide(d => d.radius * 1.2).strength(.3))
    // .force('center', forceCenter(width / 2, height / 2));

  const layoutTick = () => {
    clusterElement
    .attr('transform', d => {
      const topBoundary = d.radius;
      if (d.y < topBoundary) {
        d.y = topBoundary;
      }
      return `translate(${d.x},${d.y})`;
    });
  };
  myForce.nodes(nodeData)
    .on('tick', layoutTick);

  return myForce;
};

const renderCircles = (clusterData, radialBarScale) => {

  const myCluster= select('#cluster');
  // myCluster.call(myZoom); // TODO: fix zoom

  const myNodes = myCluster
    .selectAll('g')
    .data(clusterData)
    .enter()
    .append('g')
    .attr('class', 'cluster-node');
  myNodes
    .on('click', (d, i, e) => {
      const tooltip = select('#tooltip');
      tooltip
        .style('opacity', 0.9);
      // TODO: create a nice, styled component for this and extract data from record nicer
      tooltip.node().innerHTML = `<div>
        <h3>Details:</h3>
        <p>Name: ${d.raw.name}</p>
        <p>Party: ${d.raw.party}</p>
        <p>Role: ${d.raw.role}</p>
        <p>Gender: ${d.raw.gender}</p>
        <p>Seniority: ${d.raw.seniority}</p>
        <p>Missed Votes: ${d.raw.detail.roles[0].missed_votes_pct}%</p>
        <p>Votes with party: ${d.raw.detail.roles[0].votes_with_party_pct}%</p>
        <p>Bills sponsored: ${d.raw.detail.roles[0].bills_sponsored}</p>
        <p>Bills co-sponsored: ${d.raw.detail.roles[0].bills_cosponsored}</p>
        <p>Contact Form: <a href="${d.raw.detail.roles[0].contact_form}" target="_blank">Link to Form</a></p>
        <p>Phone: ${d.raw.detail.roles[0].phone}</p>
        <hr />
        <a href="${d.raw.times_topics_url}" target="_blank">Times Topics |</a>
        <a href="https://twitter.com/${d.raw.twitter_id}" target="_blank">Twitter Account |</a>
        <a href="https://facebook.com/${d.raw.facebook_account}" target="_blank">Facebook Account |</a>
        <a href="https://youtube.com/${d.raw.youtube_id}" target="_blank">Youtube Account |</a>
        <a href="${d.raw.detail.rss_url}" target="_blank">RSS Feeed |</a>
      </div>`;
    });

  myNodes
    .append('circle')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', d => d.radius)
    .style('fill', d => d.color)
    .style('opacity', d => d.raw.detail.roles[0].votes_with_party_pct / 100);

  myNodes
    .append('path')
    .attr('d', myInnerArc)
    .attr('class', 'node-arc')
    .style('fill', '#671f66');

  const radialBarChartContainer = myNodes.append('g').attr('class', 'radial-bar-chart');
  for (let i=1; i<=4; i++) {
    radialBarChartContainer
      .append('path')
      .attr('d', getRadialBarForQuarter(i, radialBarScale))
      .attr('class', 'node-radial-bar-chart')
      .style('fill', '#a6adbd');
  }

  myNodes
    .append('foreignObject')
    .attr('x', d => -d.radius)
    .attr('y', d => -d.radius)
    .attr('width', d => d.radius * 2)
    .attr('height', d => d.radius * 2)
    .append('xhtml:div')
    .attr('class', 'node-text')
    .attr('style', d => `height: ${d.radius * 2}px; font-size: ${d.radius / 4}px;`) // TODO: find better way to attach style to xhtml and define font size
    .text(d => d.text);

  return myNodes;
}

const getExpenseValue = (dataPoint, i) => {
  if (dataPoint && dataPoint.quarterExpensesArray && dataPoint.quarterExpensesArray[i] && dataPoint.quarterExpensesArray[i][0] && dataPoint.quarterExpensesArray[i][0].amount) {
    return dataPoint.quarterExpensesArray[i][0].amount;
  }
  return 0;
};

const createNodeData = data => {
  const scale = getScale(data);
  return data.map(dataPoint => {
    return {
      x: width / 2,
      y: height / 2,
      radius: scale(dataPoint.seniority),
      radialBars: [
        getExpenseValue(dataPoint, 0),
        getExpenseValue(dataPoint, 1),
        getExpenseValue(dataPoint, 2),
        getExpenseValue(dataPoint, 3)
      ],
      raw: dataPoint,
      text: dataPoint.name,
      color: dataPoint.party === 'D' ? '#3333FF' : '#E81B23' // TODO: do a better check (other parties?)
    }
  })
};

document.getElementById('loading').innerHTML = 'Loading...';
getMembers(data => {
  console.log(data);
  const nodeData = createNodeData(data);
  const radialBarScale = getRadialBarScale(data);

  const clusterElement = renderCircles(nodeData, radialBarScale);

  getForce(nodeData, clusterElement);
  document.getElementById('loading').innerHTML = '';
});

// TODO: change radius of cluster nodes to selected metric
document.getElementById('size-dropdown').addEventListener('change', (e) => {
  alert(`Sizing by ${e.srcElement.value} not implemented yet.`);
  e.srcElement.value = 'Seneriority';
});
