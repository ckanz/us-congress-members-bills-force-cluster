import { select, selectAll } from 'd3-selection';
import { arc } from 'd3-shape';
import { forceSimulation, forceCollide, forceManyBody, forceLink, forceCenter } from 'd3-force';
import { getVotesWithPartyPct } from './data-processing';

const getForce = (nodeData, linkData, clusterElement, lineElement) => {
  const myForce = forceSimulation()
    .force("center", forceCenter(window.innerWidth / 2, window.innerHeight / 2))
    .force("charge", forceManyBody().strength(0.7))
    .force('link', forceLink().id(d => d.id).distance(50).strength(1))
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

  const memberIdsArray = nodeData.map(n => n.id);
  const filteredLinks = linkData.filter(link => memberIdsArray.includes(link.source));
  if (linkData && linkData.length > 0) myForce.force('link').links(filteredLinks);
  return myForce;
};

const renderCircles = (nodeData, linkData) => {
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
    .style('opacity', 0)
    .transition()
    .delay((d, i) => 2000 + (nodeData.length * 3) + (i * 3))
    .style('opacity', 1)

  const myNodes = select('#viz-container')
    .append('g')
    .attr('id', 'circle-container')
    .selectAll('g')
    .data(nodeData)
    .enter()
    .append('g')
    .attr('class', 'cluster-node')

   myNodes
    .style('opacity', 0)
    .transition()
    .delay((d, i) => 1000 + (i * 3))
    .style('opacity', 1)

  myNodes
    .on('click', d => {
      if (d.raw.url) {
        window.open(d.raw.url);
      } else if (d.raw.congressdotgov_url) {
        window.open(d.raw.congressdotgov_url);
      } else {
        console.log('No URL available for this node.', d);
      }
      console.log('clicked node:', d)
    })
    .style('cursor', d => d.raw.url || d.raw.congressdotgov_url ? 'pointer' : 'default');

  myNodes
    .append('circle')
    .attr('class', 'cluster-circle')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', d => d.radius)
    .style('fill', d => d.color)

  myNodes
    .append('foreignObject')
    .style('pointer-events', 'none')
    .attr('x', d => -d.radius * .75)
    .attr('y', d => -d.radius)
    .attr('width', d => d.radius * 1.5)
    .attr('height', d => d.radius * 2)
    .append('xhtml:div')
    .attr('class', 'node-text')
    .attr('style', d => {
      if (d.raw.bill_id) {
        return `height: ${d.radius * 2}px; font-size: ${d.radius / 8}px;`;
      }
      return `height: ${d.radius * 2}px; font-size: ${d.radius / 4}px;`;
    })
    .text(d => (d.text.substring(0, 150)) + (d.text.length > 150 ? '...' : ''));

  myNodes
    .append('path')
    .attr('d', attendedVotewArc)
    .attr('class', 'node-arc')
    .style('opacity', 0.5)
    .style('fill', 'black');

  myNodes
    .append('path')
    .attr('d', cosponsorArcDem)
    .attr('class', 'node-arc')
    .style('opacity', 0.75)
    .style('fill', '#3333FF');

  myNodes
    .append('path')
    .attr('d', cosponsorArcRep)
    .attr('class', 'node-arc')
    .style('opacity', 0.75)
    .style('fill', '#E81B23');

  myNodes
    .append('path')
    .attr('d', cosponsorArcInd)
    .attr('class', 'node-arc')
    .style('opacity', 0.75)
    .style('fill', 'white');

  return {
    myNodes,
    myLines
  };
}

const cosponsorArcDem = arc()
  .innerRadius(d => d.radius - (d.radius * .05))
  .outerRadius(d => d.radius)
  .cornerRadius(12)
  .startAngle(0)
  .endAngle(d => {
    if (!d.raw.cosponsors_by_party || !d.raw.cosponsors_by_party.D) return 0
    const cosponsorsPct = d.raw.cosponsors_by_party && d.raw.cosponsors_by_party.D ? (d.raw.cosponsors_by_party.D / d.raw.cosponsors) : 0;
    return !isNaN(cosponsorsPct) ? cosponsorsPct * Math.PI * 2 : 0;
  });

const cosponsorArcRep = arc()
  .innerRadius(d => d.radius - (d.radius * .05))
  .outerRadius(d => d.radius)
  .cornerRadius(12)
  .startAngle(d => {
    if (!d.raw.cosponsors_by_party || !d.raw.cosponsors_by_party.R) return 0
    const cosponsorsPct = d.raw.cosponsors_by_party && d.raw.cosponsors_by_party.D ? (d.raw.cosponsors_by_party.D / d.raw.cosponsors) : 0;
    return !isNaN(cosponsorsPct) ? cosponsorsPct * Math.PI * 2 : 0;
  })
  .endAngle(d => {
    if (!d.raw.cosponsors_by_party || !d.raw.cosponsors_by_party.R) return 0
    const startPct = d.raw.cosponsors_by_party && d.raw.cosponsors_by_party.D ? (d.raw.cosponsors_by_party.D / d.raw.cosponsors) : 0;
    const cosponsorsPct = d.raw.cosponsors_by_party && d.raw.cosponsors_by_party.R ? (d.raw.cosponsors_by_party.R / d.raw.cosponsors) : 0;
    if (isNaN(cosponsorsPct)) return 0
    return !isNaN(cosponsorsPct) ? (cosponsorsPct + startPct) * Math.PI * 2 : 0;
  });

const cosponsorArcInd = arc()
  .innerRadius(d => d.radius - (d.radius * .05))
  .outerRadius(d => d.radius)
  .cornerRadius(12)
  .startAngle(d => {
    if (!d.raw.cosponsors_by_party || !d.raw.cosponsors_by_party.ID) return 0
    const startPct = d.raw.cosponsors_by_party && d.raw.cosponsors_by_party.D ? (d.raw.cosponsors_by_party.D / d.raw.cosponsors) : 0;
    const cosponsorsPct = d.raw.cosponsors_by_party && d.raw.cosponsors_by_party.R ? (d.raw.cosponsors_by_party.R / d.raw.cosponsors) : 0;
    if (isNaN(cosponsorsPct)) return 0
    return !isNaN(cosponsorsPct) ? (cosponsorsPct + startPct) * Math.PI * 2 : 0;
  })
  .endAngle(d => {
    if (!d.raw.cosponsors_by_party || !d.raw.cosponsors_by_party.ID) return 0
    const startPct1 = d.raw.cosponsors_by_party && d.raw.cosponsors_by_party.R ? (d.raw.cosponsors_by_party.R / d.raw.cosponsors) : 0;
    const startPct2 = d.raw.cosponsors_by_party && d.raw.cosponsors_by_party.D ? (d.raw.cosponsors_by_party.D / d.raw.cosponsors) : 0;
    const cosponsorsPct = d.raw.cosponsors_by_party && d.raw.cosponsors_by_party.ID ? (d.raw.cosponsors_by_party.ID / d.raw.cosponsors) : 0;
    if (isNaN(cosponsorsPct)) return 0
    return !isNaN(cosponsorsPct) ? (cosponsorsPct + startPct1 + startPct2) * Math.PI * 2 : 0;
  });

const attendedVotewArc = arc()
  .innerRadius(d => d.radius - (d.radius * .1))
  .outerRadius(d => d.radius - (d.radius * .05))
  .cornerRadius(12)
  .startAngle(0)
  .endAngle(d => {
    const attendedVotesPct = (100 - d.raw.missed_votes_pct) || 0;
    return (attendedVotesPct / 100) * Math.PI * 1.999;
  });

export {
  renderCircles,
  getForce
};
