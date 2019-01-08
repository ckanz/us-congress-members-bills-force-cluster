import './style.css';
import { getMembers } from './api-functions';
import { createNodeData } from './data-processing';
import { renderCircles, getForce } from './cluster';
import { select } from 'd3-selection';
import { zoom } from 'd3-zoom';

const myZoom = zoom()
  .on('zoom', (d, i, elements) => {
    if (elements[i] && elements[i].__zoom) {
      select('#cluster').attr('transform', elements[i].__zoom);
    }
  })
  .scaleExtent([0.5, 5]);

getMembers(data => {
  console.log(data);
  
  const width = window.innerWidth || 1000;
  const height = window.innerHeight || 500;
  const nodeData = createNodeData(data, width, height);
  const clusterElement = renderCircles(nodeData);
  getForce(nodeData, clusterElement);

  select('#viz-container')
    .style('height', height)
    .call(myZoom);
});

// TODO: change radius of cluster nodes to selected metric
document.getElementById('size-dropdown').addEventListener('change', (e) => {
  alert(`Sizing by ${e.srcElement.value} not implemented yet.`);
  e.srcElement.value = 'Seneriority';
});
