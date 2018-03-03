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
                    incumbent: true,
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
                    winner: "X",
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
            it("if a parameter object lacks a 'voteCount' property, the return objec't's votes will be 0", () => {
                results.forEach((candidate, index) => {
                    if (!mockData[index].voteCount) {
                        assert.strictEqual(candidate.votes, 0);
                    }
                });
            });
            it("if the parameter object has an 'incumbent' property set to true, return object will have same", () => {
                const mockIncumbent = results[0];
                assert.property(mockIncumbent, "incumbent");
                assert.isTrue(mockIncumbent.incumbent);
            });
            it("if parameter object lacks 'incumbent' property, return object will lack same", () => {
                const mockChallengers = results.slice(1);
                mockChallengers.forEach((challenger) => {
                    assert.notProperty(challenger, "incumbent");
                });
            });
            it("if param object has 'winner' property set to 'X', return object will have 'winner' = true", () => {
                const mockWinner = results[2];
                assert.property(mockWinner, "winner");
                assert.isTrue(mockWinner.winner);
            });
            it("if param object lacks 'winner' property, return object will lack same", () => {
                const mockLosers = [results[0], results[1], results[3]];
                mockLosers.forEach((loser) => {
                    assert.notProperty(loser, "winner");
                });
            });
        });
    });
});
