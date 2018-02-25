import { assert } from "chai";
import * as ap from "./index";

describe("Associated Press", () => {
    describe("extractCandidates", () => {
        describe("Correctly formatted data", () => {
            const mockData = [
                {
                    first: "Adrian",
                    last: "Ocegueda",
                    party: "Dem",
                    candidateID: "60829",
                    polID: "66008",
                    ballotOrder: 4,
                    polNum: "51927",
                    voteCount: 10,
                },
                {
                    first: "Cedric",
                    last: "Davis",
                    party: "Dem",
                    candidateID: "60830",
                    polID: "66006",
                    ballotOrder: 2,
                    polNum: "50745",
                },
                {
                    first: "Lupe",
                    last: "Valdez",
                    party: "Dem",
                    candidateID: "60831",
                    polID: "66011",
                    ballotOrder: 6,
                    polNum: "51930",
                    voteCount: 30,
                },
                {
                    first: "Tom",
                    last: "Wakely",
                    party: "Dem",
                    candidateID: "60832",
                    polID: "64629",
                    ballotOrder: 7,
                    polNum: "51619",
                },
            ];

            const results = ap.extractCandidates(mockData);
            it("returns an array of objects", () => {
                assert.isArray(results);
                results.forEach((result) => {
                    assert.isObject(result);
                });
            });
            it("each object has a 'name' string property", () => {
                results.forEach((candidate) => {
                    assert.property(candidate, "name");
                    assert.isString(candidate.name);
                });
            });
            it("the name is a concatenation of the first and last name properties of the parameter data", () => {
                results.forEach((candidate, index) => {
                    const expectedString = `${mockData[index].first} ${mockData[index].last}`;
                    assert.strictEqual(candidate.name, expectedString);
                });
            });
            it("each object has a 'votes' number property", () => {
                results.forEach((candidate) => {
                    assert.property(candidate, "votes");
                    assert.isNumber(candidate.votes);
                });
            });
            it("if a parameter object has a 'voteCount' property, the return object's votes will match it", () => {
                results.forEach((candidate, index) => {
                    if (mockData[index].voteCount) {
                        assert.strictEqual(candidate.votes, mockData[index].voteCount);
                    }
                });
            });
            it("if a parameter object lacks a 'voteCount' property, the return objects votes will be 0", () => {
                results.forEach((candidate, index) => {
                    if (!mockData[index].voteCount) {
                        assert.strictEqual(candidate.votes, 0);
                    }
                });
            });
        });
    });
});
