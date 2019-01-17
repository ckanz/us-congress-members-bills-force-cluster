import { scaleLinear } from 'd3-scale';
import { max, min } from 'd3-array';

const getScale = data => {
  const maxValue = max(data.map(d => d.seniority));
  const minValue = min(data.map(d => d.seniority));
  return scaleLinear().range([8, 20]).domain([minValue, maxValue]); // TODO: make range dynamic to screen size
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

const createNodeData = (data, width, height) => {
  const scale = getScale(data);
  return data.map(dataPoint => {
    return {
      id: dataPoint.id,
      x: dataPoint.party === 'D' ? width * 0.25 : width * 0.75,
      y: height / 2,
      radius: scale(dataPoint.seniority),
      raw: dataPoint,
      text: dataPoint.name,
      color: dataPoint.party === 'D' ? '#3333FF' : '#E81B23' // TODO: do a better check (in case of other parties, e.g. green?)
    }
  });
};

const createLinkData = data => {
  // TODO: find more meaningful connection between nodes
  return {};
  let linkData = [];
  let linkedIds = [];
  data.forEach(dataRow => {
    data.forEach(nextRow => {
      if (dataRow.id != nextRow.id) {
        linkData.push({
          source: dataRow.id,
          target: nextRow.id,
          value: dataRow.seniority
        });
      }
    })
  });
  return linkData;
};

export {
  createNodeData,
  createLinkData,
  getVotesWithPartyPct
};
