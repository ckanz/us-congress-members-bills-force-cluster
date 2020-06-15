import { select, selectAll } from 'd3-selection';
import { arc } from 'd3-shape';
import { forceSimulation, forceCollide, forceManyBody, forceLink, forceCenter } from 'd3-force';
import { getVotesWithPartyPct } from './data-processing';

const fbLogo = require('./images/fb.png');
const ytLogo = require('./images/yt.png');
const gtLogo = require('./images/gt.jpeg');
const vsLogo = require('./images/vs.png');
const urlLogo = require('./images/url.png');

const getForce = (nodeData, linkData, clusterElement, lineElement) => {
  const myForce = forceSimulation()
    .force("center", forceCenter(window.innerWidth / 2, window.innerHeight / 2))
    .force("charge", forceManyBody().strength(0.1))
    .force('link', forceLink().id(d => d.id).distance(50).strength(0.1))
    // TODO: any value to map to force here?
    // .force('link', forceLink().id(d => d.id).distance(d => (100 - d.value) * 5).strength(0.1))
    .force('collide', forceCollide(d => d.radius * 2).strength(0.1));

  const layoutTick = () => {
    clusterElement.attr('transform', d => `translate(${d.x},${d.y})`);
    lineElement
      .filter(d => (d.source && d.target && !isNaN(d.target.x)))
      .attr('x1', d => d.source.x || 0)
      .attr('x2', d => d.target.x || 0)
      .attr('y1', d => d.source.y || 0)
      .attr('y2', d => d.target.y || 0);
  };
  myForce.nodes(nodeData).on('tick', layoutTick);
  if (linkData && linkData.length > 0) myForce.force('link').links(linkData);
  return myForce;
};

const attendedVotewArc = arc()
  .innerRadius(d => d.radius - (d.radius * .1))
  .outerRadius(d => d.radius - (d.radius * .05))
  .cornerRadius(12)
  .startAngle(0)
  .endAngle(d => {
    const attendedVotesPct = (100 - d.raw.missed_votes_pct) || 0;
    return (attendedVotesPct / 100) * Math.PI * 1.999;
  });

const partyVotewArc = arc()
  .innerRadius(d => d.radius - (d.radius * .15))
  .outerRadius(d => d.radius - (d.radius * .2))
  .cornerRadius(12)
  .startAngle(0)
  .endAngle(d => {
    const partyVotesPct = d.raw.votes_with_party_pct || 0;
    return ((partyVotesPct / 100) * Math.PI * 1.999);
  });

const addLeafCircle = (node, x, y, r, url, img) => {
  const leafCircle = node.insert('g').attr('class', 'leaf-circle');

  // TODO: use icons from file
  img = img || 'https://mdn.mozillademos.org/files/6457/mdn_logo_only_color.png';

  /*
  leafCircle
    .append('circle')
    .style('stroke-width', 0)
    .on('click', () => {
      if (url) {
        window.open(url);
      } else {
        console.log('No URL for this page available :-(');
        console.log(url);
      }
    })
    .attr('cx', x)
    .attr('cy', y)
    .attr('r', 0)
    .transition()
    .attr('r', r)
    */

    leafCircle
      .append('image')
      .attr('class', 'leaf-circle-icon')
      .attr('x', x - r)
      .attr('y', y - r)
      .attr('width', r * 2)
      .attr('height', r * 2)
      .attr('xlink:href', img)
      .style('opacity', 0)
      .transition()
      .style('opacity', 1)
      .style('pointer-events', 'none');

}

const addLeaves = (node, { radius, raw }) => {
  const leafRadius = radius / 4;
  const centerLeafX = radius + (radius / 3);
  const sideLeafX = radius - leafRadius / 2;

  // TODO: only add leaves when ids exist
  const { youtube_id, twitter_id, facebook_account, votesmart_id, govtrack_id, url } = raw
  if (youtube_id) addLeafCircle(node, 0, -centerLeafX, leafRadius, `https://youtube.com/${youtube_id}`, ytLogo.default);
  if (twitter_id) addLeafCircle(node, sideLeafX, -radius, leafRadius, `https://twitter.com/${twitter_id}`);
  if (facebook_account) addLeafCircle(node, -sideLeafX, -radius, leafRadius, `https://facebook.com/${facebook_account}`, fbLogo.default);

  if (url) addLeafCircle(node, -sideLeafX, radius, leafRadius, url, urlLogo.default);
  if (votesmart_id) addLeafCircle(node, sideLeafX, radius, leafRadius, `https://votesmart.org/candidate/${votesmart_id}`, vsLogo.default);
  if (govtrack_id) addLeafCircle(node, 0, centerLeafX, leafRadius, `https://www.govtrack.us/congress/members/${govtrack_id}`, gtLogo.default);

  node
    .insert('circle', 'circle')
    .attr('class', 'hover-circle')
    .style('opacity', 0)
    .attr('r', centerLeafX + leafRadius)
    .attr('cx', 0)
    .attr('cy', 0);
};

const enterNode = (d, i, e) => {
  // selectAll('.cluster-node').transition().style('opacity', 0.3);
  const node = select(e[i]);
  node.raise();
  node.transition().style('opacity', 1);
  addLeaves(node, d);

  // TODO: add line, text and legend for arcs on hover
};

const exitNode = ({ radius, text }, i, e) => {
  // selectAll('.cluster-node').transition().style('opacity', 1);
  const node = select(e[i]);
  node.selectAll('.leaf-circle image')
    .transition()
    .style('opacity', 0);
  node.selectAll('.leaf-circle circle')
    .transition()
    .attr('r', 0)
    .on('end', () => {
      node.selectAll('.leaf-circle').remove();
    });
  node.selectAll('.hover-circle').remove();
};

const renderCircles = (clusterData, linkData) => {
  const myLines = select('#viz-container')
    .append('g')
    .attr('id', 'line-container')
    .selectAll('line')
    .data(linkData)
    .enter()
    .append('line')
    .attr('class', 'cluster-line');

  myLines
    .attr('x1', 0)
    .attr('x2', 0)
    .attr('y1', 0)
    .attr('y2', 0)
    .style('stroke', 'black')
    // TODO: any bill value to map on links?
    // .style('opacity', 0)
    // .transition()
    // .delay((d, i) => 3000 + (i * 3))
    // .style('opacity', d => d.value / 100)
    .style('stroke-width', 0.5);

  const myNodes = select('#viz-container')
    .append('g')
    .attr('id', 'circle-container')
    .selectAll('g')
    .data(clusterData)
    .enter()
    .append('g');

   myNodes.style('opacity', 0)
    .transition()
    .delay((d, i) => i * 10)
    .style('opacity', 1)
    .attr('class', 'cluster-node');

  myNodes
    .on('mouseenter', enterNode)
    .on('mouseleave', exitNode);

  myNodes
    .append('circle')
    .attr('class', 'cluster-circle')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', d => d.radius)
    .style('fill', d => d.color)
    .style('stroke', 'black')
    .style('stroke-width', .5)
    // TODO: value to use for opacity (if any)?
    // .style('opacity', d => getVotesWithPartyPct(d));

  myNodes
    .append('foreignObject')
    .style('pointer-events', 'none')
    .attr('x', d => -d.radius * .75)
    .attr('y', d => -d.radius)
    .attr('width', d => d.radius * 1.5)
    .attr('height', d => d.radius * 2)
    .append('xhtml:div')
    .attr('class', 'node-text')
    .attr('style', d => `height: ${d.radius * 2}px; font-size: ${d.radius / 4}px;`)
    .text(d => d.text.substring(0, 50));

  /*
  // TODO: what to do with the arcs?
  myNodes
    .append('path')
    .attr('d', attendedVotewArc)
    .attr('class', 'node-arc')
    .style('opacity', 0.5)
    .style('fill', 'black');

  myNodes
    .append('path')
    .attr('d', partyVotewArc)
    .attr('class', 'node-arc')
    .style('opacity', 0.5)
    .style('fill', 'white');
  */

  return {
    myNodes,
    myLines
  };
}

export {
  renderCircles,
  getForce
};
