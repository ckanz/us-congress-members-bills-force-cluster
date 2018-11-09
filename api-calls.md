https://api.propublica.org/congress/v1/members/senate/CA/current.json / https://api.propublica.org/congress/v1/members/house/CA/current.json
```
{
  "id": "F000062",
  "name": "Dianne Feinstein",
  "first_name": "Dianne",
  "middle_name": null,
  "last_name": "Feinstein",
  "suffix": null,
  "role": "Senator, 1st Class",
  "gender": "F",
  "party": "D",
  "times_topics_url": "http://topics.nytimes.com/top/reference/timestopics/people/f/dianne_feinstein/index.html",
  "twitter_id": "SenFeinstein",
  "facebook_account": "senatorfeinstein",
  "youtube_id": "SenatorFeinstein",
  "seniority": "25",
  "next_election": "2018",
  "api_uri": "https://api.propublica.org/congress/v1/members/F000062.json"
},
```

---

https://api.propublica.org/congress/v1/members/F000062/statements.json
```
{
  "url": "https://www.feinstein.senate.gov//public/index.cfm/press-releases?ContentRecord_id=F408E2AD-5689-41B2-AB71-001FED0F6F19",
  "date": "2018-11-08",
  "title": "Feinstein: Tools to Reduce Mass Shootings Available, Just Lacking Republican Leadership",
  "statement_type": "Press Release",
  "congress": 115
},
```

---

https://api.propublica.org/congress/v1/members/F000062/votes.json
```
 {
  "member_id": "F000062",
  "chamber": "Senate",
  "congress": "115",
  "session": "2",
  "roll_call": "239",
  "vote_uri": "https://api.propublica.org/congress/v1/115/senate/sessions/2/votes/239.json",
  "bill": {
      "bill_id": "pn1644-115",
      "number": "PN1644",
      "api_uri": null,
      "title": null,
      "latest_action": null
  },
  "amendment": {},
  "nomination": {
      "nomination_id": "PN1644-115",
      "number": "PN1644",
      "name": "Thomas S. Kleeh",
      "agency": "The Judiciary"
  },
  "description": "Thomas S. Kleeh, of West Virginia, to be United States District Judge for the Northern District of West Virginia",
  "question": "On the Nomination",
  "result": "Nomination Confirmed",
  "date": "2018-10-11",
  "time": "19:01:00",
  "total": {
      "yes": 65,
      "no": 30,
      "present": 0,
      "not_voting": 5
  },
  "position": "Not Voting"
},
```
For more information about the bill itself using bill id: [https://projects.propublica.org/api-docs/congress-api/bills/](https://projects.propublica.org/api-docs/congress-api/bills/).

---

