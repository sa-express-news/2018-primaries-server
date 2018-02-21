require("dotenv").config();

import { fetchGoogleSheetData } from "./google-sheets";

const main = async () => {
    if (process.env.SPREADSHEET_ID) {
        const spreadsheetData: string[][] = await
            fetchGoogleSheetData(process.env.SPREADSHEET_ID, "Election Data!A2:E");
        spreadsheetData[0].forEach((datum) => {
            console.log(datum, typeof datum);
        });
    }
};

main();
