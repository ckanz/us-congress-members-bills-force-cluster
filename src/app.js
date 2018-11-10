import './style.css';
import { getMembers } from './api-functions';
import { forceSimulation, forceManyBody, forceCenter } from 'd3-force';
import { select } from 'd3-selection';

const width = window.availWidth || 1000;
const height = window.availHeight || 500;

const getForce = (nodeData, clusterElement) => {
  const myForce = forceSimulation()
    .force('charge', forceManyBody())
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
  return data.map(dataPoint => {
    return {
      x: width / 2,
      y: height / 2,
      radius: 10,
      raw: dataPoint
    }
  })
};

getMembers(data => {
  const nodeData = createNodeData(data);

  const clusterElement = renderCircles(nodeData);

  getForce(nodeData, clusterElement);
});
