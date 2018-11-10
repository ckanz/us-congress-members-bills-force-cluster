import './style.css';
import { getMembers } from './api-functions';
import { forceSimulation, forceCollide, forceManyBody, forceCenter } from 'd3-force';
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { max, min } from 'd3-array';

const width = window.availWidth || 1000;
const height = window.availHeight || 500;

const getScale = data => {
  const maxValue = max(data.map(d => d.seniority));
  const minValue = min(data.map(d => d.seniority));
  const scale = scaleLinear().range([20, 100]).domain([minValue, maxValue]);
  return scale;
};

const getForce = (nodeData, clusterElement) => {
  const myForce = forceSimulation()
    .force('charge', forceManyBody())
    .force('collide', forceCollide(d => d.radius).strength(.2))
    .force('center', forceCenter(width / 2, height / 2));

  const layoutTick = () => {
    clusterElement
    .attr('transform', d => {
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
    .style('fill', d => d.color);
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
