import './style.css';
import { getMembers } from './api-functions';
import { forceSimulation, forceCollide, forceManyBody, forceCenter } from 'd3-force';
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { max, min } from 'd3-array';
import { arc } from 'd3-shape';

const width = window.availWidth || 1000;
const height = window.availHeight || 500;

const myInnerArc = arc()
  .innerRadius(d => d.radius - d.radius * 0.25)
  .outerRadius(d => d.radius - d.radius * 0.17)
  .cornerRadius(12)
  .startAngle(0)
  .endAngle(d => {
    const angle = Math.random(); // TODO: replace with vote behaviour metric
    return (angle * Math.PI * 2);
  });

const getRadialBarForQuarter = (quarter) => {
  const radialBarChart = arc()
    .innerRadius(d => d.radius)
    .outerRadius(d => d.radius + d.radius / 5 * Math.random()) // TODO: use quaterly expenses with scale
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

const getForce = (nodeData, clusterElement) => {
  const myForce = forceSimulation()
    // .force('charge', forceManyBody())
    .force('collide', forceCollide(d => d.radius).strength(.2))
    .force('center', forceCenter(width / 2, height / 2));

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

const renderCircles = (clusterData) => {
  const myCluster= select('#cluster');
  const myNodes = myCluster
    .selectAll('g')
    .data(clusterData)
    .enter()
    .append('g')
    .attr('class', 'cluster-node');
  myNodes
    .append('circle')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', d => d.radius)
    .style('fill', d => d.color)
    .style('opacity', d => Math.random()); // TODO: replace with party loyalty metric

  myNodes
    .append('path')
    .attr('d', myInnerArc)
    .attr('class', 'node-arc')
    .style('fill', 'grey');

  const radialBarChartContainer = myNodes.append('g').attr('class', 'radial-bar-chart');
  for (let i=1; i<=4; i++) {
    radialBarChartContainer
      .append('path')
      .attr('d', getRadialBarForQuarter(i))
      .attr('class', 'node-radial-bar-chart')
      .style('fill', 'orange');
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

const createNodeData = data => {
  const scale = getScale(data);
  return data.map(dataPoint => {
    return {
      x: width / 2,
      y: height / 2,
      radius: scale(dataPoint.seniority),
      raw: dataPoint,
      text: dataPoint.name,
      color: dataPoint.party === 'D' ? 'blue' : 'red' // TODO: use real party color codes and do a better check (other parties?)
    }
  })
};

getMembers(data => {
  console.log(data);
  const nodeData = createNodeData(data);

  const clusterElement = renderCircles(nodeData);

  getForce(nodeData, clusterElement);
});
