
import * as fs from "fs";
import * as readlineSync from "readline-sync";
import { promisify } from 'util';
const google = require("googleapis");
const googleAuth = require("google-auth-library");
import { GoogleCredentials } from '../types';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
const TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';



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
}


/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */

const getNewToken = async (oauth2Client: any): Promise<any> => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });

    console.log('Authorize this app by visiting this url: ', authUrl);
    const code = readlineSync.question("Enter the code from that page here: ");

    try {
        const token = await oauth2Client.getToken(code);
        oauth2Client.credentials = token;
        await storeToken(token);
        return token;
    } catch (error) {
        console.log(`Error while trying to receive access token: ${error}`);
    }
}



/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */

const storeToken = async (token: object): Promise<void> => {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code != 'EEXIST') {
            throw err;
        }
    }

    try {
        await writeFile(TOKEN_PATH, JSON.stringify(token));
        console.log(`Token stored to ${TOKEN_PATH}`);
    } catch (error) {
        console.log(`Error storing token: ${error}`);
    }
}


// Load client secrets from a local file.
const loadGoogleCredentials = async (): Promise<GoogleCredentials> => {
    try {
        const rawCredentials = await readFile('client_secret.json');
        const credentials: GoogleCredentials = JSON.parse(rawCredentials.toString());
        return credentials;
    } catch (e) {
        throw new Error(`Error loading credentials file: ${e}`);
    }
}


/**
 * Print the names and majors of students in a sample spreadsheet:
 * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 */

const fetchData = async (auth: any, spreadsheetId: string, range: string): Promise<string[][]> => {
    const sheets = google.sheets('v4');

    const get = promisify(sheets.spreadsheets.values.get);
    try {
        const data: { values: string[][] } = await get({
            auth,
            spreadsheetId,
            range
        });

        return data.values;
    } catch (error) {
        throw error;
    }
}

export const fetchGoogleSheetData = async (spreadsheetID: string, spreadsheetRange: string): Promise<string[][]> => {
    try {
        const credentials = await loadGoogleCredentials();
        const oAuthClient = await authorize(credentials);
        const data = await fetchData(oAuthClient, spreadsheetID, spreadsheetRange);
        return data;

    } catch (error) {
        throw new Error(`Error fetching data from Google Sheets: ${error}`);
    }
}