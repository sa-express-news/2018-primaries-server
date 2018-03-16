import * as ap from "../associated-press";
import * as google from "../google-sheets";
import { DataStore } from "../types";
import * as util from "../util";

export const dataStore: DataStore = {
    primaries: [],
};

export const generateDataStore = async (previousDataStore: DataStore): Promise<DataStore> => {
    try {
        const apData = await ap.fetchAPData(process.env.AP_URL as string);
        const { primaries: apPrimaries } = apData;
        const googleData: string[][] = await google.fetchGoogleSheetData(process.env.SPREADSHEET_ID as string, "Election Data!A2:N");
        const googlePrimaries = google.buildPrimaries(googleData);

        const mergedPrimaries = apPrimaries.concat(googlePrimaries);

        return {
            primaries: util.mergeAndUpdateArraysOfObjects(previousDataStore.primaries, mergedPrimaries, "title"),
        };
    } catch (error) {
        throw error;
    }
};