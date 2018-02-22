
import * as fs from "fs";
import * as readlineSync from "readline-sync";
import { promisify } from "util";
import { Candidate, Primary, Race } from "../types";
const google = require("googleapis");
const googleAuth = require("google-auth-library");
import { GoogleCredentials } from "../types";

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
const TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + "/.credentials/";
const TOKEN_PATH = TOKEN_DIR + "2018-texas-primaries.json";

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */

const authorize = async (credentials: GoogleCredentials): Promise<any> => {
    const clientSecret = credentials.installed.client_secret;
    const clientId = credentials.installed.client_id;
    const redirectUrl = credentials.installed.redirect_uris[0];
    const auth = new googleAuth();
    const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.

    try {
        const token = await readFile(TOKEN_PATH);
        oauth2Client.credentials = JSON.parse(token.toString());
        return oauth2Client;
    } catch (e) {
        return getNewToken(oauth2Client);
    }
};

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 */

const getNewToken = async (oauth2Client: any): Promise<any> => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
    });

    console.log(`Authorize this app by visiting this url: ${authUrl}`);
    const code = readlineSync.question("Enter the code from that page here: ");

    try {

        // Google's API for fetching a token requires a promise wrap
        const getTokenPromise = () => {
            return new Promise((resolve, reject) => {
                oauth2Client.getToken(code, (error: any, tokens: any, response: any) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(tokens);
                    }
                });
            });
        };

        const token = await getTokenPromise();
        oauth2Client.credentials = token;
        await storeToken(token);
        return oauth2Client;

    } catch (error) {
        console.log(`Error while trying to receive access token: ${error}`);
    }
};

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */

const storeToken = async (token: object): Promise<void> => {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code !== "EEXIST") {
            throw err;
        }
    }

    try {
        await writeFile(TOKEN_PATH, JSON.stringify(token));
        console.log(`Token stored to ${TOKEN_PATH}`);
    } catch (error) {
        console.log(`Error storing token: ${error}`);
    }
};

// Load client secrets from a local file.
const loadGoogleCredentials = async (): Promise<GoogleCredentials> => {
    try {
        const rawCredentials = await readFile("client_secret.json");
        const credentials: GoogleCredentials = JSON.parse(rawCredentials.toString());
        return credentials;
    } catch (e) {
        throw new Error(`Error loading credentials file: ${e}`);
    }
};

/**
 * Fetches all rows in a provided range for a given spreadsheet.
 */

const fetchData = async (auth: any, spreadsheetId: string, range: string): Promise<string[][]> => {
    const sheets = google.sheets("v4");

    const get = promisify(sheets.spreadsheets.values.get);
    try {
        const data: { values: string[][] } = await get({
            auth,
            range,
            spreadsheetId,
        });

        return data.values;
    } catch (error) {
        throw error;
    }
};

/**
 * Fetches all rows in a provided range for a given spreadsheet.
 * @param {string} spreadsheetID The ID of a Google spreadsheet, which is the long string after "/d/" in the URL.
 * @param {string} spreadsheetRange The range to pull from the spreadsheet, formatted as "{Sheet Name}!Row:Column"
 */

export const fetchGoogleSheetData = async (spreadsheetID: string, spreadsheetRange: string): Promise<string[][]> => {
    try {
        const credentials = await loadGoogleCredentials();
        const oAuthClient = await authorize(credentials);
        const data = await fetchData(oAuthClient, spreadsheetID, spreadsheetRange);
        return data;

    } catch (error) {
        throw new Error(`Error fetching data from Google Sheets: ${error}`);
    }
};

// Construct an array of Primary data objects from an array of string arrays

export const buildPrimaries = (data: string[][]): Primary[] => {
    const primaries: Primary[] = [];

    const uniqueRaceNames = new Set<string>(getAllAtSubarrayIndex(data, 0));

    uniqueRaceNames.forEach((raceName: string) => {
        const raceRows = data.filter((row: string[]) => row[0] === raceName);

        const races: Race[] = raceRows.map((row) => buildRace(row));

        primaries.push({
            id: 0, // Hard coded - figure this out
            races,
            title: raceName,
        });
    });
    return primaries;
};

// Construct a Race object from an array of strings formatted like so:
// [race name, isRepublican, candidate, votes, candidate, votes, ... candidate, votes]

export const buildRace = (array: string[]): Race => {
    return {
        candidates: buildCandidates(array.slice(2)),
        isRepublican: array[1].toLowerCase() === "true",
        title: array[0],
    };
};

// Given an array of arrays, get the (i)th element of every subarray.

export const getAllAtSubarrayIndex = (arrays: any[][], index: number): any[] => {
    const itemsAtI: any[] = [];
    arrays.forEach((array: any[]) => {
        if (array.length - 1 >= index) {
            itemsAtI.push(array[index]);
        }
    });

    return itemsAtI;
};

// Assumes array is structured like ['candidate', '#', 'candidate', '#']

export const buildCandidates = (array: string[]): Candidate[] => {
    const candidates: Candidate[] = [];
    for (let i = 0; i < array.length - 1; i += 2) {
        if (array[i].length > 0) {
            const voteCount = parseInt(array[i + 1], 10);
            const candidate: Candidate = {
                name: array[i],
                votes: isNaN(voteCount) ? 0 : voteCount,
            };
            candidates.push(candidate);
        }

    }

    return candidates;

};

// Evaluates whether an array of strings matches the data structure we use in Google Sheets:
// [race title, isRepublican, candidate, votes, candidate, votes, ... candidate, votes]
// Stops evaluating after the first candidate - vote pair, because the candidate-building function
// will omit garbage data if necessary.

export const isPrimaryRow = (array: string[]): boolean => {
    if (array.length < 4) {
        return false;
    } else if (array[0].length === 0 || array[1].length === 0 || array[2].length === 0 || array[3].length === 0) {
        return false;
    }

    let isPrimary = true;

    if (!array[0] || array[0] === "") {
        isPrimary = false;
    }
    const secondItem = array[1].toLowerCase();

    if (secondItem !== "true" && secondItem !== "false") {
        isPrimary = false;
    }

    return isPrimary;
};
