import { assert } from "chai";
import * as gs from "./index";

describe("Google Sheets", () => {
    // describe("fetchGoogleSheetData", () => {
    //     it("exists", () => {
    //         assert.isDefined(fetchGoogleSheetData);
    //     });
    // });
    describe("buildCandidates", () => {
        describe("Correctly formatted data", () => {
            const data = ["John Smith", "500", "Jane Smith", "1000"];
            const candidates = gs.buildCandidates(data);

            it("returns an array of objects", () => {
                assert.isArray(candidates);
                candidates.forEach((candidate) => {
                    assert.isObject(candidate);
                });
            });
            it("each object in the array has a 'name' string property", () => {
                candidates.forEach((candidate) => {
                    assert.property(candidate, "name");
                    assert.isString(candidate.name);
                });
            });
            it("each object in the array has a 'votes' number property", () => {
                candidates.forEach((candidate) => {
                    assert.property(candidate, "votes");
                    assert.isNumber(candidate.votes);
                });
            });
        });
        describe("Incorrectly formatted data", () => {
            it("returns 0 for any vote count not parseable as a number", () => {
                const data = ["John Smith", "foobar", "Jane Smith", "1000"];
                const candidates = gs.buildCandidates(data);

                assert.strictEqual(candidates[0].votes, 0);
            });
            it("omits a candidate if the name field is empty", () => {
                const data = ["John Smith", "500", "", "1000"];
                const candidates = gs.buildCandidates(data);

                assert.lengthOf(candidates, 1);
                assert.strictEqual(candidates[0].name, "John Smith");
                assert.strictEqual(candidates[0].votes, 500);
            });
        });
    });
});
