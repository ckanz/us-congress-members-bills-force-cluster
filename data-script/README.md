This folder contains a node script to download a large amount of data from the API and store it in a file that can be used by the front end application. This is to avoid rate limiting by the API and long loading times. In a production scenario, this script could be used on regular intervals throughout the day according to the [data update schedule](https://projects.propublica.org/api-docs/congress-api/#data-update-schedules) and store the result on  static endpoint such as AWS S3 or Azure Blobs.

To run the node script, run `node get-data-dump.js` which will store the result in a file called `data.json`.

For the script to run successfully, a file containing the token for the API needs to be in the root of this folder called `creds.json` with the content

```
{
  "token": "{token}"
}

```
