import { renderCircles, getForce } from '../src/js/cluster'
import { createNodeData, createLinkData } from '../src/js/data-processing'

const localStaticMembersAndBills = require('../src/js/members-and-bills.json')
const nodeData = createNodeData(localStaticMembersAndBills.nodes, 1000, 500)
const linkData = createLinkData(localStaticMembersAndBills.links)

let svg

beforeEach(() => {
  svg = document.createElement('SVG')
  svg.setAttribute('id', 'viz-container')
  document.body.appendChild(svg)
})

afterEach(() => {
  svg.remove()
})

describe('renderCircles', () => {
  it('handles missing container', () => {
    svg.remove()
    expect(renderCircles([], [])).toBeUndefined()
  })
  it('handles empty data', () => {
    const result = renderCircles()
    expect(result.myNodes.size()).toBe(0)
    expect(result.myLines.size()).toBe(0)
  })
  it('returns expected nodes and link selections', () => {
    const result = renderCircles(nodeData, linkData)
    expect(result.myNodes.size()).toBe(201)
    expect(result.myLines.size()).toBe(100)
  })
})

describe('getForce', () => {
  it('returns the force', () => {
    const forceResult = getForce()
    expect(forceResult.force).toBeTruthy()

  })
})
