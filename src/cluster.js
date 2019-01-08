import { select } from 'd3-selection';
import { forceSimulation, forceCollide, forceManyBody, forceCenter } from 'd3-force';
import { getVotesWithPartyPct } from './data-processing';

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

const renderCircles = (clusterData) => {
  const myNodes = select('#cluster')
    .selectAll('g')
    .data(clusterData)
    .enter()
    .append('g')
    .attr('class', 'cluster-node');

  myNodes
    .on('mouseenter', (d, i, e) => {
      const innerText = select(e[i]).select('.node-text');
      innerText
        .transition()
        .style('opacity', 0)
        .on('end', () => {
          innerText
            .attr('style', d => `height: ${d.radius * 2}px; font-size: ${d.radius / 6}px; line-height:${d.radius / 4}px;`)
            .text('');

          innerText
            .append('div')
            .text(`Party: ${d.raw.party}`)
            .append('div')
            .text(`Gender: ${d.raw.gender}`)
            .append('div')
            .text(`Votes with party: ${d.raw.detail.roles[0].votes_with_party_pct}%`)
            .append('div')
            .text(`Bills (co-)sponsored: ${d.raw.detail.roles[0].bills_sponsored + d.raw.detail.roles[0].bills_cosponsored}`)
            .append('div')
            .text(`Role: ${d.raw.role}`)
            .append('div')
            .text(`Seniority: ${d.raw.seniority}`)
            .append('div')
            .text(`Missed Votes: ${d.raw.detail.roles[0].missed_votes_pct}%`)
            .transition()
            .style('opacity', 1);
        });
      /*
      <a href="${d.raw.times_topics_url}" target="_blank">Times Topics |</a>
      <a href="https://twitter.com/${d.raw.twitter_id}" target="_blank">Twitter Account |</a>
      <a href="https://facebook.com/${d.raw.facebook_account}" target="_blank">Facebook Account |</a>
      <a href="https://youtube.com/${d.raw.youtube_id}" target="_blank">Youtube Account |</a>
      <a href="${d.raw.detail.rss_url}" target="_blank">RSS Feeed |</a>
      */
    })
    .on('mouseleave', (d, i, e) => {
      const innerText = select(e[i]).select('.node-text');
      innerText
        .transition()
        .style('opacity', 0)
        .on('end', () => {
          innerText
            .attr('style', d => `height: ${d.radius * 2}px; font-size: ${d.radius / 4}px;`)
            .text(d.text)
            .transition()
            .style('opacity', 1);
        });
    });

  myNodes
    .append('circle')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', d => d.radius)
    .style('fill', d => d.color)
    .style('opacity', d => getVotesWithPartyPct(d));

  myNodes
    .append('foreignObject')
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