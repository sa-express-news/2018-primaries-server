# SAEN Election Results Server #

This Node.js app served results of the Texas 2018 primary elections to [a page on the Express-News website](https://www.expressnews.com/2018-primary-results/), which rendered charts using the data. This app centralized data from Google Sheets and the Associated Press elections API to fetch results for the elections we wanted to watch.

## Overview ##

The server kept an array of primaries in memory and broadcasts it to users of the Express-News page using [the Socket.IO web socket library](https://github.com/socketio/socket.io).

At a regular interval (90 seconds in production), the server fetched updated information from both Google Sheets and the Associated Press API, merged them into the data in memory and rebroadcasted that primary data.

Though the AP's API offers an amazing REST endpoint with detailed information on many races, it did not contain information on county-level races we wished to track. Google Sheets was not nearly as easy to use and required many trade-offs, described in the Google Sheets section below.

## Data Structures ##

Our lowest-level data structure is a Candidate:

```typescript
interface Candidate {
    name: string;
    votes: number;
    incumbent?: boolean;
    winner?: boolean;
    runoff?: boolean;
}
```

Every Candidate has a name and number of votes they've received. The `incumbent` and `winner` properties are self-explanatory; they are only present (and set to `true`) if they're true - so losing candidates have no `winner` property.

The `runoff` boolean property denotes whether a candidate heads to a runoff. Like the other optional properties, it is only present if `true`.

Next up the chain is a Race:

```typescript
interface Race {
    isRepublican: boolean;
    title: string;
    candidates: Candidate[];
    percentPrecinctsReporting?: number;
    source?: string;
    source_url?: string;
}
```

Both Republicans and Democrats held Texas primaries in March 2018. Because these were the only two parties we wanted to watch, we used a boolean `isRepublican` property to denote party rather than a string or enumerable.

The `title` property is typically the name of the office, i.e. `Governor` or `Attorney General`. In state and national legislative races, we appended the seat to the title - i.e. `U.S. House - District 33`.

Every Race contains an array of Candidates competing in the race.

In live election reporting, it's important to note the percentage of precincts that have reported results - as early numbers can be misleading. The `percentPrecinctsReporting` property is only optional because we didn't have time to implement it in data from Google Sheets; the AP makes it easy to obtain.

The `source` and `source_url` were simply a way to delineate between which data came from the AP and which came from the Express-News research team checking county results.

The highest-level data structure is a Primary:

```typescript
    title: string;
    id: number;
    races: Race[];
```

Since both parties held primaries, each Primary has two Races - one Democratic and one Republican. Each primary has a `title` identical to the titles on Races - it's how we know which races belong to which primaries (more on that later).

Finally, each Primary has an `id`. This is used on the front end to delineate which primaries should be featured prominently. The IDs are arbitrary.

## Development / Getting Started ##

Clone the repository and install dependencies using Yarn or NPM.

You'll need the following environment variables in a `.env` file at the root project directory:

`AP_URL` - The AP Elections API URL we used to access results for the exact races we wanted, including our API key.
`AP_KEY` - AP Elections API key broken out into a separate variable (used when running tests).
`AP_URL_BASE` - Base URL for the API Elections API, also used for testing.
`AP_URL_PARAMS` - URL parameters for our API Elections API request, used for testing.
`SPREADSHEET_ID` - The ID of the Google Spreadsheet holding election results. If you're looking at the URL of a spreadsheet, the ID is everything after the `/d/`. Note that the spreadsheet must be available for viewing by anyone with the link.
`SOCKET_PORT` - Port to run the web socket server on.

Should you need an example `.env` file to work off, contact [Kia Farhang](https://github.com/KiaFarhang) at `mfarhang@express-news.net`.

You'll also need to authenticate your machine with Google before running any tests/code.

#### Authenticating for Google Sheets Access ####

This project includes code to help you authenticate with Google via the command line, but you must first [use the Google Developers Console](https://console.developers.google.com) to generate a secret key JSON file for your machine.

Follow the instructions [in step 1 of this guide](https://developers.google.com/sheets/api/quickstart/nodejs) to do so, saving the file that results as `client_secret.json` in the root directory of this project.

After that, the first time you run the project your terminal should walk you through getting access to the Google Sheets data. The whole process should take no more than a few minutes. Future runs of the program on the same machine will use stored credentials and not require these steps.

#### Tests ####

This project uses [the Mocha testing framework](https://mochajs.org/) to run tests, including [the Nock server mocking library](https://github.com/node-nock/nock) to simulate responses from the AP API.

Run tests using the `test` script included in the `package.json` file.

## Project Structure ##

At a high level, this application does the following:

- Create an in-memory data store containing an array of Primary data structures, pulled from both Google Sheets and the AP API.
- Broadcasts the data store out to connected web socket clients.
- Sets up an interval (we used 90 seconds) to fetch new Primary data from Google Sheets and the AP, merge it with the previous data store, and send the new data store to connected clients.
- Send the current data store to clients on connection.

## Deployment ##

We ran this application on an Amazon Lightsail instance using [the PM2 process manager.](http://pm2.keymetrics.io/)

## Troubleshooting / FAQ ##

Questions, concerns or PRs? Reach out to Kia Farhang at `mfarhang@express-news.net`.