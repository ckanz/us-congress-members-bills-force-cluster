import { scaleLinear } from 'd3-scale';
import { max, min } from 'd3-array';

const getScale = data => {
  const maxValue = max(data.map(d => parseInt(d.seniority)));
  const minValue = min(data.map(d => parseInt(d.seniority)));
  return scaleLinear().range([8, 30]).domain([minValue, maxValue]);
};

const getVotesWithPartyPct = d => {
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
        y: height / 2,
        radius: !dataPoint.bill_id ? Math.sqrt(scale(parseInt(dataPoint.seniority))) : 20,
        raw: dataPoint,
        text: dataPoint.short_title,
        color: 'grey'
      }
    }
    return {
      id: dataPoint.id,
      x: dataPoint.party === 'D' ? width * 0.33 : width * 0.66,
      y: height / 2,
      radius: scale(parseInt(dataPoint.seniority)),
      raw: dataPoint,
      text: dataPoint.name ? dataPoint.name : `${dataPoint.first_name} ${dataPoint.last_name}`,
      color: dataPoint.party === 'D' ? '#3333FF' : '#E81B23' // TODO: do a better check (in case of other parties, e.g. green?)
    };
  });
};

const createLinkData = data => data.map(d => ({
  source: d.sponsor_id,
  target: d.bill_id,
  value: 10,
  raw: d
}));

export {
  createNodeData,
  createLinkData,
  getVotesWithPartyPct
};
