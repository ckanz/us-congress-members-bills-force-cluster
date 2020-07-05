import { renderCircles, getForce } from '../src/cluster'
import { createNodeData, createLinkData } from '../src/data-processing'
const localStaticMembersAndBills = require('../src/members-and-bills.json')
const nodeData = createNodeData(localStaticMembersAndBills.nodes, 1000, 500)
const linkData = createLinkData(localStaticMembersAndBills.links)

describe('renderCircles', () => {
  it('does not fail when container is missing', () => {
    expect(renderCircles([], [])).toBeUndefined();
  });
  it('returns expected nodes and link selections', () => {
    const svg = document.createElement('SVG');
    svg.setAttribute('id', 'viz-container')
    document.body.appendChild(svg);

    const result = renderCircles(nodeData, linkData)
    expect(result.myNodes.size()).toBe(201)
    expect(result.myLines.size()).toBe(100)
  });
});
