import { token } from './creds.json';

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
      member.detail = response.results[0];
      const memberStatementUrl = `https://api.propublica.org/congress/v1/members/${member.id}/statements.json`;
      getApiData(memberStatementUrl, response => {
	member.statements = response.results;
	const memberVoteUrl = `https://api.propublica.org/congress/v1/members/${member.id}/votes.json`;
	getApiData(memberVoteUrl, response => {
	  member.votes = response.results[0].votes;
	  for (let i=1;i<=4;i++) {
	    member.quarterExpensesArray = [];
	    const memberExpensesUrl = `https://api.propublica.org/congress/v1/members/${member.id}/office_expenses/2018/${i}.json`;
	    getApiData(memberExpensesUrl, response => {
	      member.quarterExpensesArray.push(response.results);
	      if (index === memberArray.length - 1 && i === 4) {
		callback(memberArray);
	      }
	    });
	  }
	});
      });
    });
  });
};

const getMembers = (callback) => {
  const membersSenate = 'https://api.propublica.org/congress/v1/members/senate/CA/current.json';
  const membersHouse = 'https://api.propublica.org/congress/v1/members/house/CA/current.json';
  let membersArray = [];

  getApiData(membersHouse, response => {
    membersArray = membersArray.concat(response.results);
    membersArray.forEach(member => {
      member.type = 'house';
    });
    getApiData(membersSenate, response => {
      membersArray = membersArray.concat(response.results);
      membersArray.forEach(member => {
        member.type = 'senate';
      });
      enrichMembersData(membersArray, enrichedMembersArray => {
	callback(enrichedMembersArray);
      });
    });
  });
};

export {
  getMembers
}
