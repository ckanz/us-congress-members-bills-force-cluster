import { select, selectAll } from 'd3-selection';
import { arc } from 'd3-shape';
import { forceSimulation, forceCollide, forceManyBody } from 'd3-force';
import { getVotesWithPartyPct } from './data-processing';

const getForce = (nodeData, clusterElement) => {
  const myForce = forceSimulation()
    .force('charge', forceManyBody().strength(0.2))
    .force('collide', forceCollide(d => d.radius * 1.2).strength(.1));

  const layoutTick = () => {
    clusterElement.attr('transform', d => `translate(${d.x},${d.y})`);
  };
  myForce.nodes(nodeData).on('tick', layoutTick);
  return myForce;
};

const attendedVotewArc = arc()
  .innerRadius(d => d.radius - (d.radius * .05))
  .outerRadius(d => d.radius)
  .cornerRadius(12)
  .startAngle(0)
  .endAngle(d => {
    const attendedVotesPct = d.raw.detail && d.raw.detail.roles ? (100 - d.raw.detail.roles[0].missed_votes_pct) : 0;
    return (attendedVotesPct / 100) * Math.PI * 1.999;
  });

const partyVotewArc = arc()
  .innerRadius(d => d.radius)
  .outerRadius(d => d.radius + (d.radius * .05))
  .cornerRadius(12)
  .startAngle(0)
  .endAngle(d => {
    const partyVotesPct = d.raw.detail && d.raw.detail.roles ? d.raw.detail.roles[0].votes_with_party_pct : 0;
    return ((partyVotesPct / 100) * Math.PI * 1.999);
  });

const addLeafCircle = (node, x, y, r, url) => {
  node
    .insert('circle', 'circle')
    .on('click', () => {
      if (url) {
        window.open(url);
      } else {
        // alert('No URL for this page available :-(');
      }
    })
    .attr('class', 'leaf-circle')
    .attr('vector-effect', 'non-scaling-stroke')
    .attr('r', r)
    .attr('cx', 0)
    .attr('cy', 0)
    .transition()
    .attr('cx', x)
    .attr('cy', y);
}

const addLeaves = (node, d) => {
  const mainRadius = d.radius;
  const leafRadius = mainRadius / 4;
  const centerLeafX = mainRadius + (mainRadius / 3);
  const sideLeafX = mainRadius - leafRadius / 2;

  addLeafCircle(node, 0, -centerLeafX, leafRadius, `https://youtube.com/${d.raw.youtube_id}`);
  addLeafCircle(node, 0, centerLeafX, leafRadius, `https://www.govtrack.us/congress/members/${d.raw.detail.govtrack_id}`);

  addLeafCircle(node, sideLeafX, -mainRadius, leafRadius, `https://twitter.com/${d.raw.twitter_id}`);
  addLeafCircle(node, sideLeafX, mainRadius, leafRadius, `https://votesmart.org/candidate/${d.raw.detail.votesmart_id}`);

  addLeafCircle(node, -sideLeafX, -mainRadius, leafRadius, `https://facebook.com/${d.raw.facebook_account}`);
  addLeafCircle(node, -sideLeafX, mainRadius, leafRadius, d.raw.detail.url);

  node
    .insert('circle', 'circle')
    .attr('class', 'hover-circle')
    .style('opacity', 0)
    .attr('r', centerLeafX + leafRadius)
    .attr('cx', 0)
    .attr('cy', 0);
};

const enterNode = (d, i, e) => {
  selectAll('.cluster-node').transition().style('opacity', 0.3);
  const node = select(e[i]);
  node.raise();
  node.transition().style('opacity', 1);
  addLeaves(node, d);
  node
    .append('path')
    .attr('d', attendedVotewArc)
    .attr('class', 'node-arc')
    .style('fill', 'orange');

  node
    .append('path')
    .attr('d', partyVotewArc)
    .attr('class', 'node-arc')
    .style('fill', 'green');

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
};

const exitNode = ({ radius, text }, i, e) => {
  selectAll('.cluster-node').transition().style('opacity', 1);
  const node = select(e[i]);
  selectAll('.leaf-circle')
    .transition()
    .attr('r', 0)
    .on('end', function() { this.remove(); });
  selectAll('.hover-circle').remove();
  selectAll('.node-arc').remove();
  const innerText = node.select('.node-text');
    innerText
      .transition()
      .style('opacity', 0)
      .on('end', () => {
        innerText
          .attr('style', d => `height: ${radius * 2}px; font-size: ${radius / 4}px;`)
          .text(text)
          .transition()
          .style('opacity', 1);
      });
};

const renderCircles = clusterData => {
  const myNodes = select('#cluster')
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
    .style('opacity', d => getVotesWithPartyPct(d));

  myNodes
    .append('foreignObject')
    .style('pointer-events', 'none')
    .attr('x', d => -d.radius)
    .attr('y', d => -d.radius)
    .attr('width', d => d.radius * 2)
    .attr('height', d => d.radius * 2)
    .append('xhtml:div')
    .attr('class', 'node-text')
    .attr('style', d => `height: ${d.radius * 2}px; font-size: ${d.radius / 4}px;`)
    .text(d => d.text);

  return myNodes;
}

export {
  renderCircles,
  getForce
};