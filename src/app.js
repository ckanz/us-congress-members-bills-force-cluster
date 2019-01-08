import './style.css';
import { getMembers } from './api-functions';
import { forceSimulation, forceCollide, forceManyBody, forceCenter } from 'd3-force';
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { max, min } from 'd3-array';
import { arc } from 'd3-shape';
import { zoom } from 'd3-zoom';

const width = window.innerWidth || 1000;
const height = window.innerHeight || 500;

const myZoom = zoom()
  .on('zoom', (d, i, elements) => {
    if (elements[i] && elements[i].__zoom) {
      select('#cluster').attr('transform', elements[i].__zoom);
    }
  })
  .scaleExtent([0.5, 5]);

const getScale = data => {
  const maxValue = max(data.map(d => d.seniority));
  const minValue = min(data.map(d => d.seniority));
  const scale = scaleLinear().range([8, 20]).domain([minValue, maxValue]); // TODO: make range dynamic to screen size
  return scale;
};

const getRadialBarScale = data => {
  const maxValue = max(data.map(d => getExpenseValue(d, 0)));
  const minValue = min(data.map(d => getExpenseValue(d, 0)));
  const scale = scaleLinear().range([0, 5]).domain([minValue, maxValue]); // TODO: make range dynamic to screen size
  return scale;
};

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

const getVotesWithPartyPct = d => {
  // TODO: find out why votes_with_party_pct is null on some candidates
  if (!d || !d.raw || !d.raw.detail || !d.raw.detail.roles) {
    return 1;
  }
  const recentRole = d.raw.detail.roles[0];
  if (!recentRole || !recentRole.votes_with_party_pct || isNaN(recentRole.votes_with_party_pct)) {
    return 1;
  }
  return recentRole.votes_with_party_pct / 100;
};

const renderCircles = (clusterData, radialBarScale) => {
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

const getExpenseValue = (dataPoint, i) => {
  if (dataPoint && dataPoint.quarterExpensesArray && dataPoint.quarterExpensesArray[i] && dataPoint.quarterExpensesArray[i][0] && dataPoint.quarterExpensesArray[i][0].amount) {
    return dataPoint.quarterExpensesArray[i][0].amount;
  }
  return 0;
};

const createNodeData = data => {
  const scale = getScale(data);
  return data.map(dataPoint => {
    return {
      x: width / 2,
      y: height / 2,
      radius: scale(dataPoint.seniority),
      radialBars: [
        getExpenseValue(dataPoint, 0),
        getExpenseValue(dataPoint, 1),
        getExpenseValue(dataPoint, 2),
        getExpenseValue(dataPoint, 3)
      ],
      raw: dataPoint,
      text: dataPoint.name,
      color: dataPoint.party === 'D' ? '#3333FF' : '#E81B23' // TODO: do a better check (other parties?)
    }
  })
};

document.getElementById('loading').innerHTML = 'Loading...';
getMembers(data => {
  console.log(data);
  const nodeData = createNodeData(data);
  const radialBarScale = getRadialBarScale(data);
  const clusterElement = renderCircles(nodeData, radialBarScale);
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
