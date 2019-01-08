import { token } from './creds.json';

const loadingMessage = document.getElementById('loading');

const getApiData = (url, callback) => {
  fetch(url,  { headers: {
      'X-API-Key': token
    }}).then(res => {
    res.json().then(data => {
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
      loadingMessage.innerHTML = `Fetching details of all members (${index + 1}/${memberArray.length}) ...`;
      member.detail = response.results[0];
      if (index === memberArray.length - 1) {
        loadingMessage.style.display = 'none';
        callback(memberArray);
      }
      // const memberVoteUrl = `https://api.propublica.org/congress/v1/members/${member.id}/votes.json`;
      // getApiData(memberVoteUrl, response => {
      //   loadingMessage.innerHTML = `Fetching votes of all members (${index + 1}/${memberArray.length}) ...`;
      //   member.votes = response.results[0].votes;
      //   if (index === memberArray.length - 1) {
      //     loadingMessage.style.display = 'none';
      //     callback(memberArray);
      //   }
      // });
    });
  });
};

const getMembers = (callback) => {
  const membersSenate = 'https://api.propublica.org/congress/v1/members/senate/CA/current.json';
  const membersHouse = 'https://api.propublica.org/congress/v1/members/house/CA/current.json';
  let membersArray = [];

  loadingMessage.innerHTML = 'Fetching Senate members ...';
  getApiData(membersHouse, response => {
    membersArray = membersArray.concat(response.results);
    membersArray.forEach(member => {
      member.type = 'house';
    });
    loadingMessage.innerHTML = 'Fetching House members ...';
    getApiData(membersSenate, response => {
      membersArray = membersArray.concat(response.results);
      membersArray.forEach(member => {
        member.type = 'senate';
      });
      // callback(membersArray); loadingMessage.style.display = 'none';
      enrichMembersData(membersArray, enrichedMembersArray => {
	      callback(enrichedMembersArray);
      });
    });
  });
};

export {
  getMembers
}
