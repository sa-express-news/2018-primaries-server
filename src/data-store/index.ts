import * as ap from "../associated-press";
import * as google from "../google-sheets";
import { DataStore } from "../types";
import * as util from "../util";

export const dataStore: DataStore = {
    primaries: [],
    nextAPRequestURL: process.env.AP_URL as string,
};

export const generateDataStore = async (previousDataStore: DataStore): Promise<DataStore> => {
    try {
        const apData = await ap.fetchAPData(previousDataStore.nextAPRequestURL, previousDataStore.primaries);
        const { primaries: apPrimaries, nextURL } = apData;
        const googleData: string[][] = await google.fetchGoogleSheetData(process.env.SPREADSHEET_ID as string, "Election Data!A2:N");
        const googlePrimaries = google.buildPrimaries(googleData);

        const mergedPrimaries = apPrimaries.concat(googlePrimaries);

        return {
            primaries: util.mergeAndUpdateArraysOfObjects(previousDataStore.primaries, mergedPrimaries, "title"),
            nextAPRequestURL: nextURL,
        };
    } catch (error) {
        throw error;
    }
};

// export const updateDataStore = async (): Promise<void> => {

//     try {
//         const apData = await ap.fetchAPData(dataStore.nextAPRequestURL);
//     }

//     // const updateAPData = async (): Promise<void> => {
//     //     const apData = await ap.fetchAPData(dataStore.nextAPRequestURL);
//     //     const { primaries, nextURL } = apData;
//     //     dataStore.nextAPRequestURL = nextURL;
//     //     if (primaries.length > 0) {
//     //         dataStore.APPrimaries = util.mergeAndUpdateArraysOfObjects(dataStore.APPrimaries, primaries, "title");
//     //     }
//     // };
// }
