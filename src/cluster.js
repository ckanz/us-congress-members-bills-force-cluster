import { select, selectAll } from 'd3-selection';
import { arc } from 'd3-shape';
import { forceSimulation, forceCollide, forceManyBody, forceLink } from 'd3-force';
import { getVotesWithPartyPct } from './data-processing';

const getForce = (nodeData, linkData, clusterElement, lineElement) => {
  const myForce = forceSimulation()
    .force('link', forceLink().id(d => d.id).distance(d => (100 - d.value) * 3).strength(d => d.value / 500))
    .force('collide', forceCollide(d => d.radius * 1.5).strength(0.1));

  const layoutTick = () => {
    clusterElement.attr('transform', d => `translate(${d.x},${d.y})`);
    lineElement
      .select('line')
      .filter(d => (d.source && d.target))
      .style('stroke-width', d => d.value / 20)
      .attr('x1', d => d.source.x)
      .attr('x2', d => d.target.x)
      .attr('y1', d => d.source.y)
      .attr('y2', d => d.target.y);
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
    const attendedVotesPct = d.raw.missed_votes_pct || 0;
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
  img = 'https://mdn.mozillademos.org/files/6457/mdn_logo_only_color.png';

  leafCircle
    .append('circle')
    .on('click', () => {
      if (url) {
        window.open(url);
      } else {
        console.log('No URL for this page available :-(');
        console.log(url);
      }
    })
    .attr('vector-effect', 'non-scaling-stroke')
    .attr('cx', x)
    .attr('cy', y)
    .attr('r', 0)
    .transition()
    .attr('r', r)

    leafCircle
      .append('image')
      .attr('class', 'leaf-circle-icon')
      .attr('x', x - r / 2)
      .attr('y', y - r / 2)
      .attr('width', r)
      .attr('height', r)
      .attr('xlink:href', img)
      .style('opacity', 0)
      .transition()
      .style('opacity', 1)
      .style('pointer-events', 'none');

}

const addLeaves = (node, d) => {
  const mainRadius = d.radius;
  const leafRadius = mainRadius / 4;
  const centerLeafX = mainRadius + (mainRadius / 3);
  const sideLeafX = mainRadius - leafRadius / 2;

  addLeafCircle(node, 0, -centerLeafX, leafRadius, `https://youtube.com/${d.raw.youtube_id}`);
  addLeafCircle(node, sideLeafX, -mainRadius, leafRadius, `https://twitter.com/${d.raw.twitter_id}`);
  addLeafCircle(node, -sideLeafX, -mainRadius, leafRadius, `https://facebook.com/${d.raw.facebook_account}`);

  addLeafCircle(node, -sideLeafX, mainRadius, leafRadius, d.raw.url);
  addLeafCircle(node, sideLeafX, mainRadius, leafRadius, `https://votesmart.org/candidate/${d.raw.votesmart_id}`);
  addLeafCircle(node, 0, centerLeafX, leafRadius, `https://www.govtrack.us/congress/members/${d.raw.govtrack_id}`);

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

  /*
  node
    .append('path')
    .attr('d', attendedVotewArc)
    .attr('class', 'node-arc')
    .style('opacity', 0.5)
    .style('fill', 'black');

  node
    .append('path')
    .attr('d', partyVotewArc)
    .attr('class', 'node-arc')
    .style('opacity', 0.5)
    .style('fill', 'white');

  const innerText = node.select('.node-text');
  innerText
    .transition()
    .style('opacity', 0)
    .on('end', () => {
      const radius = d.radius;
      innerText
        .attr('style', d => `height: ${radius * 2}px; font-size: ${radius / 6}px; line-height:${radius / 4}px;`)
        .text('');
      innerText
        .append('div')
        .text(`Party: ${d.raw.party}`)
        .append('div')
        .text(`Gender: ${d.raw.gender}`)
        // .append('div')
        // .text(`Votes with party: ${d.raw.detail.roles[0].votes_with_party_pct}%`)
        .append('div')
        .text(`Bills (co-)sponsored: ${d.raw.detail.roles[0].bills_sponsored + d.raw.detail.roles[0].bills_cosponsored}`)
        .append('div')
        .text(`Role: ${d.raw.role}`)
        // .append('div')
        // .text(`Seniority: ${d.raw.seniority}`)
        // .append('div')
        // .text(`Missed Votes: ${d.raw.detail.roles[0].missed_votes_pct}%`)
        .transition()
        .style('opacity', 1);
    });
    */
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

  /*
  node.selectAll('.node-arc').remove();
  node.select('.node-text')
    .transition()
    .style('opacity', 0)
    .on('end', (d, i, e) => {
      select(e[i])
        .attr('style', d => `height: ${radius * 2}px; font-size: ${radius / 4}px;`)
        .text(text)
        .transition()
        .style('opacity', 1);
    });
  */
};

const renderCircles = (clusterData, linkData) => {
  const myLines = select('#viz-container')
    .append('g')
    .attr('id', 'line-container')
    .selectAll('g')
    .data(linkData)
    .enter()
    .append('g')
    .attr('class', 'cluster-line');

  myLines
    .append('line')
    .attr('class', 'vote-line')
    .attr('x1', 0)
    .attr('x2', 0)
    .attr('y1', 0)
    .attr('y2', 0)
    .style('stroke', 'black')
    .style('opacity', 0.3)
    .style('stroke-width', 3);

  const myNodes = select('#viz-container')
    .append('g')
    .attr('id', 'circle-container')
    .selectAll('g')
    .data(clusterData)
    .enter()
    .append('g')
    .attr('class', 'cluster-node');

  myNodes
    .on('mouseenter', enterNode)
    .on('mouseleave', exitNode);

  myNodes
    .append('circle')
    .attr('class', 'cluster-circle')
    .attr('vector-effect', 'non-scaling-stroke')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', d => d.radius)
    .style('fill', d => d.color)
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
    .text(d => d.text);

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

  return {
    myNodes,
    myLines
  };
}

export {
  renderCircles,
  getForce
};
