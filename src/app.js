import './style.css'
import 'mini.css'
import { fetchData } from './api-functions'
import { createNodeData, createLinkData } from './data-processing'
import { renderCircles, getForce } from './cluster'
import { select } from 'd3-selection'
import { zoom } from 'd3-zoom'

const localStaticMembersAndBills = require('./members-and-bills.json')
const live = true
const mySvg = select('svg')
const width = window.innerWidth || 1000
const height = window.innerHeight || 500

document.getElementById('congress').onchange = e => { init(live) }
document.getElementById('chamber').onchange = e => { init(live) }
// document.getElementById('bills').onclick = e => { init(live) }

const myZoom = zoom()
  .on('zoom', (d, i, elements) => {
    if (elements[i] && elements[i].__zoom) {
      select('#viz-container').attr('transform', elements[i].__zoom)
    }
  })
  .scaleExtent([0.5, 10])

const handleError = e => {
  document.getElementById('show-error').click()
  document.getElementById('error-message').innerHTML = e.reason.message
}

const createForceCluster = data => {
  const nodeData = createNodeData(data.nodes, width, height)
  const linkData = createLinkData(data.links)
  const { myNodes, myLines } = renderCircles(nodeData, linkData)

  setTimeout(() => {
    getForce(nodeData, linkData, myNodes, myLines)
  }, 200)

  mySvg.call(myZoom)
  return mySvg
}

mySvg.style('height', height)

export const init = useLocalData => {
  select('#viz-container').selectAll('*').remove()
  if (useLocalData) {
    fetchData(data => {
      createForceCluster(data)
    })
  } else {
    createForceCluster(localStaticMembersAndBills)
  }
}

window.addEventListener('error', handleError)
window.addEventListener('unhandledrejection', handleError)

init(live)
