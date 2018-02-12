import { fetchGoogleSheetData } from "./google-sheets";

const main = async () => {
    const spreadsheetData = await
        fetchGoogleSheetData("1U2abauDTK8zTsoEqAV60TSNAyHGP8NGtmBDiObvSp24", "Election Data!A2:E");
    console.log(spreadsheetData);
};

main();
