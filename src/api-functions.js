import { token } from './creds.json'

const loadingMessage = document.getElementsByClassName('loading')
let callCounter = 0

const CONGRESS_NUMBER = 116
const CONGRESS_TYPE = 'senate'
const MAX_VOTE_MEMBER_COUNT = 50
const votes = true

const getApiData = (url, callback) => {
  fetch(url, { headers: {
    'X-API-Key': token
  } }).then(res => {
    res.json().then(data => {
      callCounter++
      if (callback) {
        callback(data)
      }
    })
  })
}

const getFullName = member => `${member.first_name} ${member.last_name}`

/*
const getVotingBehaviour = (memberArray, callback) => {
  const url = new URL(window.location)
  const voteParam = url.searchParams.get('votes') // H000874 Steny Hoyer
  // TODO: replace the below with Array.prototype.find()
  let voteMember
  if (voteParam) {
    memberArray.forEach(member => {
      if (member.first_name === voteParam || member.id === voteParam) {
        voteMember = member
      }
    })
  }
  if (!votes || !voteMember) {
    callback([])
    return
  }
  loadingMessage[0].innerHTML = `Fetching voting relations for ${getFullName(voteMember)} ...`
  const links = []
  let results = 0
  memberArray = memberArray.slice(0, MAX_VOTE_MEMBER_COUNT)
  memberArray.forEach(member => {
    if (voteMember.id !== member.id) {
      const voteUrl = `https://api.propublica.org/congress/v1/members/${voteMember.id}/votes/${member.id}/${CONGRESS_NUMBER}/${CONGRESS_TYPE}.json`
      getApiData(voteUrl, response => {
        results++
        links.push({
          source: voteMember.id,
          target: member.id,
          value: response.results[0].agree_percent || 0,
          raw: response.results[0] || {}
        })
        loadingMessage[0].innerHTML = `Fetching voting relations between ${getFullName(voteMember)} and ${getFullName(member)}`
        loadingMessage[1].innerHTML = `${results} / ${memberArray.length} (${Math.floor((results / memberArray.length) * 100)}%)`
        if (results === memberArray.length - 1) {
          callback(links)
        }
      })
    }
  })
}
*/

const getMembers = callback => {
  const membersResponse = `https://api.propublica.org/congress/v1/${CONGRESS_NUMBER}/${CONGRESS_TYPE}/members.json`
  let membersArray = []

  loadingMessage[0].innerHTML = `Fetching ${CONGRESS_TYPE} members of the ${CONGRESS_NUMBER}. Congress ...`
  getApiData(membersResponse, response => {
    membersArray = membersArray.concat(response.results[0].members)
    getApiData(`https://api.propublica.org/congress/v1/${CONGRESS_NUMBER}/${CONGRESS_TYPE}/bills/introduced.json`, response => {
      membersArray = membersArray.concat(response.results[0].bills)
      const billsArray = response.results[0].bills.map(bill => {
        // TODO: this mapping should be in data-processing.js:createLingData
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
    })

    /*
    membersArray.forEach(member => {
      const billsUrl = `https://api.propublica.org/congress/v1/members/${member.id}/votes.json`
      getApiData(billsUrl, response => {
        console.log(`bills response for ${member}`, response)
      })
    })
    callback({
      nodes: membersArray,
      links: []
    })
    loadingMessage[0].style.display = 'none'
    loadingMessage[1].style.display = 'none'
    */
    /*
    // legacy code
    getVotingBehaviour(membersArray, votedLinks => {
      console.log('Calls made:', callCounter)
      loadingMessage[0].style.display = 'none'
      loadingMessage[1].style.display = 'none'
      callback({
        nodes: membersArray,
        links: votedLinks
      })
    })
    */
  })
}

export {
  getMembers
}
