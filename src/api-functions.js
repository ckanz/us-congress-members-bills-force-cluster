import { token } from './creds.json'

const loadingMessage = document.getElementsByClassName('loading')
const apiCalls = []
const MAX_NUM_BILLS = 100

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

const fetchBills = (billsArray = [], callback) => {
  const CONGRESS_NUMBER = document.getElementById('congress').value || 116
  const CONGRESS_TYPE = document.getElementById('chamber').value || 'senate'
  const billsUrl = `https://api.propublica.org/congress/v1/${CONGRESS_NUMBER}/${CONGRESS_TYPE}/bills/introduced.json?offset=${billsArray.length}`
  console.log('calling', billsUrl)
  getApiData(billsUrl, response => {
    billsArray = billsArray.concat(response.results[0].bills)
    loadingMessage[1].value = billsArray.length
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
  loadingMessage[0].style.opacity = 1
  loadingMessage[1].style.opacity = 1
  loadingMessage[1].value = 0

  setInterval(() => {
    loadingMessage[1].value += .1
  }, 100)

  const membersUrl = `https://api.propublica.org/congress/v1/${CONGRESS_NUMBER}/${CONGRESS_TYPE}/members.json`
  let billsArray = []

  loadingMessage[0].innerHTML = `Fetching ${CONGRESS_TYPE} members of the ${CONGRESS_NUMBER}th Congress ...`

  getApiData(membersUrl, response => {
    loadingMessage[1].max = MAX_NUM_BILLS
    loadingMessage[1].value = 10
    const membersArray = response.results[0].members
    fetchBills([], billsArray => {
      const membersAndBills = membersArray.concat(billsArray)
      callback({
        nodes: membersAndBills,
        links: billsArray
      })

      loadingMessage[0].style.opacity = 0
      loadingMessage[1].style.opacity = 0
      console.log('API calls made:', apiCalls)
    })
    /*
    const billsUrl = `https://api.propublica.org/congress/v1/${CONGRESS_NUMBER}/${CONGRESS_TYPE}/bills/introduced.json`
    getApiData(billsUrl, response => {
      loadingMessage[1].value = 66
      membersArray = membersArray.concat(response.results[0].bills)
      billsArray = billsArray.concat(response.results[0].bills)

      getApiData(billsUrl + '?offset=20', response => {
        loadingMessage[1].value = 99
        membersArray = membersArray.concat(response.results[0].bills)
        billsArray = billsArray.concat(response.results[0].bills)

        callback({
          nodes: membersArray,
          links: billsArray
        })

        loadingMessage[0].style.display = 'none'
        loadingMessage[1].style.display = 'none'
        console.log('API calls made:', apiCalls)
      })
    })
    */
  })
}

export {
  fetchData
}
