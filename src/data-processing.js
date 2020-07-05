import { scaleLinear } from 'd3-scale';
import { max, min } from 'd3-array';

const getScaleForKey = (data, key) => scaleLinear()
  .range([200, 1000])
  .domain([
    min(data.map(d => parseInt(d[key]))),
    max(data.map(d => parseInt(d[key])))
  ]);

const getVotesWithPartyPct = d => {
  if (!d || !d.raw || !d.raw.votes_with_party_pct) {
    return 1;
  }
  return d.raw.votes_with_party_pct / 100;
};

const createNodeData = (data, width, height) => {
  const cosponsorScale = getScaleForKey(data, 'seniority')
  const seniorityScale = getScaleForKey(data, 'cosponsors')
  return data.map(dataPoint => {
    if (dataPoint.bill_id) {
      return {
        id: dataPoint.bill_id,
        x: width * 0.5,
        y: height / 2,
        radius:  Math.sqrt(cosponsorScale(parseInt(dataPoint.cosponsors))),
        raw: dataPoint,
        text: dataPoint.short_title,
        color: 'grey'
      }
    }
    let color = 'white';
    if (dataPoint.party === 'D') {
      color ='#3333FF'
    }
    if (dataPoint.party === 'R') {
      color ='#E81B23'
    }
    return {
      id: dataPoint.id,
      x: dataPoint.party === 'D' ? width * 0.33 : width * 0.66,
      y: height / 2,
      radius: Math.sqrt(seniorityScale(parseInt(dataPoint.seniority))),
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
