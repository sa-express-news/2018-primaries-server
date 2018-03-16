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

The following sections will explore those tasks in depth.

## Fetching Data From Google Sheets ##

To capture county-level elections data, we needed a tool that was a) Accessible from an appliaction like this one, and b) Simple enough so non-developers could update the data.

We settled on Google Sheets. This required some compromises, mainly in how rigidly the data had to be structured.

If you take a look at [the spreadsheet we used,](https://docs.google.com/spreadsheets/d/1U2abauDTK8zTsoEqAV60TSNAyHGP8NGtmBDiObvSp24/edit?usp=sharing) you'll see a collection of races in the first sheet (which is the only one this application touched).

Each primary required two rows - one for the Republican race and one for the Democratic one. Here's how a row is structured:

`Title` - Self-explanatory.
`isRepublican` - See the Race data structure above. Note that this comes into the application as a string; we had to parse it to use a boolean instead.
`Candidate` + `Votes` - The rest of the spreadsheet is just a repetition of these columns, one each for every candidate in a race.

If you take a look in `src/google-sheets/index.ts`, you'll see lots of code to parse this hard-coded structure into the data we need.

You'll also notice some notations in the names of some candidates in the spreadsheet. These are special (again, hard coded) symbols we used to parse additional data:

- The checkmark denotes the candidate won, and we attached `winner: true` accordingly if we found it.
- The (i) denotes an incumbent and resulted in `incumbent: true`.
- The (runoff) denotes the candidate headed to a runoff, which led to `runoff: true`.

Again, none of this is ideal, but it got the job done and meant we didn't have to update election results but could leave it to others in the newsroom while we monitored the page and this application.

## Working With the AP API ##

The [Associated Press Elections API](https://developer.ap.org/ap-elections-api) is a great, easy-to-use service that doesn't require much explanation. The Express-News purchased access to it and obtained an API key.

Most of the work this application does with the AP API is simple. The AP provides more information than we need, so `src/associated-press-index.ts` includes code to extract what we need from those results.

The API also sends data by race, so there's code in that file that consults a map of AP race IDs (`src/associated-press/racePrimaryMap.ts`) and creates Primaries containing the two Races for each one.

Note that with every response, the AP API sends a URL that, when pinged, will return _only the results for races that have been updated_. Working with this URL was a nightmare, so we decided at the last minute to forgo the AP's recommendation and just request the full payload every time. Since we were only requesting a couple dozen races, we had no problems whatsoever.

## Deployment ##

We ran this application on an Amazon Lightsail instance using [the PM2 process manager.](http://pm2.keymetrics.io/)

## Troubleshooting / FAQ ##

Questions, concerns or PRs? Reach out to Kia Farhang at `mfarhang@express-news.net`.