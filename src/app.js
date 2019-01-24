import './style.css';
import { getMembers } from './api-functions';
import { createNodeData, createLinkData } from './data-processing';
import { renderCircles, getForce } from './cluster';
import { select } from 'd3-selection';
import { zoom } from 'd3-zoom';

const californiaVoting = require('./local-data.json');
const allMembers = require('./all-members.json');
const live = false;

const myZoom = zoom()
  .on('zoom', (d, i, elements) => {
    if (elements[i] && elements[i].__zoom) {
      select('#viz-container').attr('transform', elements[i].__zoom);
    }
  })
  .scaleExtent([0.5, 10]);

const initVis = data => {
  const width = window.innerWidth || 1000;
  const height = window.innerHeight || 500;
  const nodeData = createNodeData(data.nodes, width, height);
  const { myNodes, myLines } = renderCircles(nodeData, data.links);
  getForce(nodeData, data.links, myNodes, myLines);

  select('svg')
    .style('height', height)
    .call(myZoom);
}

if (live) {
  getMembers(data => {
    console.log(data);
    console.log(JSON.stringify(data));
    initVis(data);
  });
} else {
  initVis(californiaVoting);
  console.log(californiaVoting);
}

// TODO: change radius of cluster nodes to selected metric
document.getElementById('size-dropdown').addEventListener('change', (e) => {
  alert(`Sizing by ${e.srcElement.value} not implemented yet.`);
  e.srcElement.value = 'Seneriority';
});
