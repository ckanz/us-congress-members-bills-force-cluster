import { token } from './creds.json';

const loadingMessage = document.getElementById('loading');
let callCounter = 0;

const CONGRESS_NUMBER = 116;
const CONGRESS_TYPE = 'house';

const getApiData = (url, callback) => {
  fetch(url,  { headers: {
      'X-API-Key': token
    }}).then(res => {
    res.json().then(data => {
      callCounter++;
      if (callback) {
        callback(data);
      }
    });
  });
};

const enrichMembersData = (memberArray, callback) => {
  memberArray.forEach((member, index) => {
    const memberDetailUrl = `https://api.propublica.org/congress/v1/members/${member.id}.json`;
    getApiData(memberDetailUrl, response => {
      loadingMessage.innerHTML = `Fetching details of member ${member.name} (${index + 1}/${memberArray.length}) ...`;
      member.detail = response.results[0];
      if (index === memberArray.length - 1) {
        callback(memberArray);
      }
      // const memberVoteUrl = `https://api.propublica.org/congress/v1/members/${member.id}/votes.json`;
      // getApiData(memberVoteUrl, response => {
      //   loadingMessage.innerHTML = `Fetching votes of member ${member.name} (${index + 1}/${memberArray.length}) ...`;
      //   member.votes = response.results[0].votes;
      //   if (index === memberArray.length - 1) {
      //     loadingMessage.style.display = 'none';
      //     callback(memberArray);
      //   }
      // });
    });
  });
};
const getVotingBehaviour = (memberArray, callback) => {
  const voteMember = memberArray[0]; // TODO: do for all or a specified member
  loadingMessage.innerHTML = `Fetching voting relations for ${voteMember.name} ...`;
  const links = [];
  memberArray.forEach((member, index) => {
    const voteUrl = `https://api.propublica.org/congress/v1/members/${voteMember.id}/votes/${member.id}/${CONGRESS_NUMBER}/${CONGRESS_TYPE}.json`;
    getApiData(voteUrl, response => {
      links.push({
        source: voteMember.id,
        target: member.id,
        value: response.results[0].agree_percent || 0,
        raw: response.results[0] || {}
      });
      if (index === memberArray.length - 1) {
        callback(links);
      }
    });
  });
}

const getMembers = (callback) => {
  const membersHouse = 'https://api.propublica.org/congress/v1/members/house/CA/current.json';
  let membersArray = [];

  loadingMessage.innerHTML = `Fetching ${CONGRESS_TYPE} members of the ${CONGRESS_NUMBER} Congress ...`;
  getApiData(membersHouse, response => {
    membersArray = membersArray.concat(response.results);
    enrichMembersData(membersArray, enrichedMembersArray => {
      getVotingBehaviour(membersArray, votedLinks => {
	console.log('Calls made:', callCounter);
        loadingMessage.style.display = 'none';
	callback({
          nodes: enrichedMembersArray,
          links: votedLinks
        });
      });
    });
  });
};

export {
  getMembers
}
