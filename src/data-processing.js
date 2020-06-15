import { scaleLinear } from 'd3-scale';
import { max, min } from 'd3-array';

const getScale = data => {
  const maxValue = max(data.map(d => parseInt(d.seniority)));
  const minValue = min(data.map(d => parseInt(d.seniority)));
  return scaleLinear().range([8, 20]).domain([minValue, maxValue]); // TODO: make range dynamic to screen size
};

const getVotesWithPartyPct = d => {
  // TODO: find out why votes_with_party_pct is null on some candidates
  if (!d || !d.raw || !d.raw.votes_with_party_pct) {
    return 1;
  }
  return d.raw.votes_with_party_pct / 100;
};

const createNodeData = (data, width, height) => {
  const scale = getScale(data);
  return data.map(dataPoint => {
    if (dataPoint.bill_id) {
      return {
        id: dataPoint.bill_id,
        x: width * 0.5,
        y: height / 1.5,
        radius: !dataPoint.bill_id ? scale(parseInt(dataPoint.seniority)) : 20,
        raw: dataPoint,
        text: dataPoint.short_title,
        color: 'grey'
      }
    }
    return {
      id: dataPoint.id,
      // TODO: use gravity force for cluster locations instead?
      x: dataPoint.party === 'D' ? width * 0.25 : width * 0.75,
      y: height / 2,
      radius: scale(parseInt(dataPoint.seniority)),
      raw: dataPoint,
      text: dataPoint.name ? dataPoint.name : `${dataPoint.first_name} ${dataPoint.last_name}`,
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
