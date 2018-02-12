import { assert } from "chai";
import { fetchGoogleSheetData } from "./index";

describe("Google Sheets", () => {
    describe("fetchGoogleSheetData", () => {
        it("exists", () => {
            assert.isDefined(fetchGoogleSheetData);
        });
    });
});
