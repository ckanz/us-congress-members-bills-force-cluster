import { token } from './creds.json'

const loadingMessage = document.getElementsByClassName('loading')
const loadingContainer = document.getElementById('loading-container')
const apiCalls = []
const MAX_NUM_BILLS = 100

const getApiData = (url, callback) => {
  fetch(url, { headers: {
    'X-API-Key': token
  } }).then(res => {
    res.json().then(data => {
      apiCalls.push({ url, res, data })
      if (callback) {
        callback(data)
      }
    })
  })
}

const fetchBills = (billsArray = [], callback) => {
  const CONGRESS_NUMBER = document.getElementById('congress').value || 116
  const CONGRESS_TYPE = document.getElementById('chamber').value || 'senate'
  const billSearchQuery = undefined // document.getElementById('bill-query').value
  const billsUrl = !billSearchQuery
    ? `https://api.propublica.org/congress/v1/${CONGRESS_NUMBER}/${CONGRESS_TYPE}/bills/introduced.json?offset=${billsArray.length}`
    : `https://api.propublica.org/congress/v1/bills/search.json?query=${billSearchQuery}&offset=${billsArray.length}`
  console.log('calling', billsUrl)
  getApiData(billsUrl, response => {
    billsArray = billsArray.concat(response.results[0].bills)
    loadingMessage[1].value = billsArray.length
    loadingMessage[2].innerHTML = `${(billsArray.length / MAX_NUM_BILLS) * 100}%`
    if (billsArray.length >= MAX_NUM_BILLS) {
      callback(billsArray)
    } else {
      fetchBills(billsArray, callback)
    }
  })
}

const fetchData = callback => {
  const CONGRESS_NUMBER = document.getElementById('congress').value || 116
  const CONGRESS_TYPE = document.getElementById('chamber').value || 'senate'
  loadingContainer.style.opacity = 1
  loadingMessage[1].value = 0
  loadingMessage[2].innerHTML = '0%'

  const membersUrl = `https://api.propublica.org/congress/v1/${CONGRESS_NUMBER}/${CONGRESS_TYPE}/members.json`
  let billsArray = []

  loadingMessage[0].innerHTML = `Fetching ${CONGRESS_TYPE} members and their most recent bills of the ${CONGRESS_NUMBER}th US Congress ...`

  getApiData(membersUrl, response => {
    loadingMessage[1].max = MAX_NUM_BILLS
    const membersArray = response.results[0].members
    fetchBills([], billsArray => {
      const membersAndBills = membersArray.concat(billsArray)
      callback({
        nodes: membersAndBills,
        links: billsArray
      })

      loadingContainer.style.opacity = 0
      console.log('API calls made:', apiCalls)
    })
  })
}

export {
  fetchData
}
