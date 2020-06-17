import { token } from './creds.json'

const loadingMessage = document.getElementsByClassName('loading')
const apiCalls = []

const getApiData = (url, callback) => {
  fetch(url, { headers: {
    'X-API-Key': token
  } }).then(res => {
    res.json().then(data => {
      apiCalls.push({ url, res })
      if (callback) {
        callback(data)
      }
    })
  })
}

const fetchData = callback => {
  const CONGRESS_NUMBER = document.getElementById('congress').value || 116
  const CONGRESS_TYPE = document.getElementById('chamber').value || 'senate'
  loadingMessage[0].style.display = 'block'
  loadingMessage[1].style.display = 'block'

  const membersResponse = `https://api.propublica.org/congress/v1/${CONGRESS_NUMBER}/${CONGRESS_TYPE}/members.json`
  let membersArray = []

  // TODO: use mini.css loading bar
  loadingMessage[0].innerHTML = `Fetching ${CONGRESS_TYPE} members of the ${CONGRESS_NUMBER}th Congress ...`
  getApiData(membersResponse, response => {
    membersArray = membersArray.concat(response.results[0].members)
    getApiData(`https://api.propublica.org/congress/v1/${CONGRESS_NUMBER}/${CONGRESS_TYPE}/bills/introduced.json`, response => {
      membersArray = membersArray.concat(response.results[0].bills)
      const billsArray = response.results[0].bills.map(bill => {
        // TODO: this mapping should be in data-processing.js:createLinkData
        return {
          source: bill.sponsor_id,
          target: bill.bill_id,
          value: 100,
          raw: bill
        }
      })
      callback({
        nodes: membersArray,
        links: billsArray
      })
      loadingMessage[0].style.display = 'none'
      loadingMessage[1].style.display = 'none'
      console.log('API calls made:', apiCalls)
    })
  })
}

export {
  fetchData
}
