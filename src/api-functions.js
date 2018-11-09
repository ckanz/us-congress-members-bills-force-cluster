import { token } from './creds.json';

const membersUrl = 'https://api.propublica.org/congress/v1/members/senate/CA/current.json';

const getMembers = (callback) => {
  fetch(membersUrl,  { headers: {
      'X-API-Key': token
    }}).then(res => {
    res.json().then(data => {
      if (callback) {
        callback(data);
      }
    });
  });
};

export {
  getMembers
}
