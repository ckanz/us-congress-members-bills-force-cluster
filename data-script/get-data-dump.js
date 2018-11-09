const { token } = require('./creds.json');
const fetch = require('node-fetch');
const fs = require('fs');

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
    console.log(`Fetching details, statements, votes and expenses for Congress member ${member.name} ...`);
    const memberDetailUrl = `https://api.propublica.org/congress/v1/members/${member.id}.json`;
    getApiData(memberDetailUrl, response => {
      member.detail = response.results[0];
      const memberStatementUrl = `https://api.propublica.org/congress/v1/members/${member.id}/statements.json`;
      getApiData(memberStatementUrl, response => {
	member.statements = response.results;
	const memberVoteUrl = `https://api.propublica.org/congress/v1/members/${member.id}/votes.json`;
	getApiData(memberVoteUrl, response => {
	  member.votes = response.results[0].votes;
	  const memberExpensesUrl = `https://api.propublica.org/congress/v1/members/${member.id}/office_expenses/2018/4.json`;
	  getApiData(memberExpensesUrl, response => {
	    member.expenses = response.results;
	    if (index === memberArray.length - 1) {
              console.log(`All ${memberArray.length} member records enriched.`);
	      callback(memberArray);
	    }
	  });
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
    console.log('Fetching House Members...');
    membersArray = membersArray.concat(response.results);
    membersArray.forEach(member => {
      member.type = 'house';
    });
    getApiData(membersSenate, response => {
      console.log('Fetching Senate Members...');
      membersArray = membersArray.concat(response.results);
      membersArray.forEach(member => {
        member.type = 'senate';
      });
      console.log('Enriching Congress Member Records...');
      enrichMembersData(membersArray, enrichedMembersArray => {
	callback(enrichedMembersArray);
      });
    });
  });
};

getMembers(data => {
  // console.log(JSON.stringify(data));
  fs.writeFile('./data.json', JSON.stringify(data), err => {
    console.log('Writing data to file...');
    if (err) {
        return console.log(err);
    }
    console.log('Done.');
  });
});
