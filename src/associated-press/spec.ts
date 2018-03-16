import { assert } from "chai";
import * as nock from "nock";
import primaryIDMap from "../data-store/primaryIDMap";
import { AssociatedPressAPIResponse, Candidate, Primary, Race } from "../types";
import * as ap from "./index";

import * as dotenv from "dotenv";
dotenv.config();

// This code runs from dist/associated-press, hence the long relative path
const mockAPResponse: AssociatedPressAPIResponse = require("../../src/associated-press/races-we-want.json");

describe("Associated Press", () => {
    describe("fetchAPData", () => {
        after(() => {
            nock.cleanAll();
        });

        const apURL = process.env.AP_URL as string;

        let fakeServer;
        let data: ap.APData;

        before(async () => {
            fakeServer = nock(process.env.AP_URL_BASE as string)
                .persist()
                .get(process.env.AP_URL_PARAMS as string)
                .reply(200, mockAPResponse);
            data = await ap.fetchAPData(apURL);
        });

        describe("Working request", () => {
            it("returns an object", async () => {
                assert.isObject(data);
            });
            it("the object has a string 'nextURL' property", () => {
                assert.property(data, "nextURL");
                assert.isString(data.nextURL);
            });
            it("the 'nextURL' property = value returned from API + our API key param", () => {
                const expectedString = `${mockAPResponse.nextrequest}&apikey=${process.env.AP_KEY as string}`;
                assert.strictEqual(data.nextURL, expectedString);
            });
            it("the object has a 'primaries' property, which is an array of objects", () => {
                assert.property(data, "primaries");
                assert.isArray(data.primaries);
                data.primaries.forEach((primary) => {
                    assert.isObject(primary);
                });
            });
            it("the 'primaries' array length = number of races in returned data / 2", () => {
                assert.strictEqual(data.primaries.length, mockAPResponse.races.length / 2);
            });
        });
    });
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
            it("if param object has 'winner' property 'R', return object 'runoff' will = true and no 'winner'", () => {
                const runoffData = [
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
                        winner: "R",
                    },
                    {
                        first: "Cedric",
                        last: "Davis",
                        party: "Dem",
                        candidateID: "60830",
                        polID: "66006",
                        ballotOrder: 2,
                        polNum: "50745",
                        winner: "R",
                    },
                ];

                const runoffResults = ap.extractCandidates(runoffData);

                runoffResults.forEach((candidate) => {
                    assert.property(candidate, "runoff");
                    assert.isTrue(candidate.runoff);
                    assert.notProperty(candidate, "winner");
                });
            });
            it("if param object lacks 'winner' property, return object will lack same", () => {
                const mockLosers = [results[0], results[1], results[3]];
                mockLosers.forEach((loser) => {
                    assert.notProperty(loser, "winner");
                });
            });
        });
    });
    describe("extractRacesFromAP", () => {
        describe("Correctly formatted data", () => {
            const mockData =
                [
                    {
                        test: true,
                        raceID: "44015",
                        raceType: "Primary",
                        raceTypeID: "D",
                        officeID: "0",
                        officeName: "Land Commissioner",
                        party: "Dem",
                        reportingUnits: [
                            {
                                statePostal: "TX",
                                stateName: "Texas",
                                level: "state",
                                lastUpdated: "2018-03-02T19:12:00.063Z",
                                precinctsReporting: 7797,
                                precinctsTotal: 7797,
                                precinctsReportingPct: 100.0,
                                candidates: [
                                    {
                                        first: "Miguel",
                                        last: "Suazo",
                                        party: "Dem",
                                        candidateID: "60924",
                                        polID: "0",
                                        ballotOrder: 2,
                                        polNum: "51984",
                                        voteCount: 545096,
                                        winner: "X",
                                    },
                                    {
                                        first: "Tex",
                                        last: "Morgan",
                                        party: "Dem",
                                        candidateID: "61159",
                                        polID: "0",
                                        ballotOrder: 1,
                                        polNum: "52179",
                                        voteCount: 445989,
                                        incumbent: true,
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        test: true,
                        raceID: "44016",
                        raceType: "Primary",
                        raceTypeID: "D",
                        officeID: "0",
                        officeName: "U.S. House",
                        seatName: "District 9",
                        party: "GOP",
                        uncontested: true,
                        reportingUnits: [
                            {
                                statePostal: "TX",
                                stateName: "Texas",
                                level: "state",
                                lastUpdated: "2018-03-02T18:32:15.460Z",
                                precinctsReporting: 0,
                                precinctsTotal: 0,
                                precinctsReportingPct: 0.0,
                                candidates: [
                                    {
                                        first: "Kim",
                                        last: "Olson",
                                        party: "Dem",
                                        candidateID: "60898",
                                        polID: "0",
                                        ballotOrder: 1,
                                        polNum: "51933",
                                        voteCount: 0,
                                        winner: "X",
                                    },
                                ],
                            },
                        ],
                    },
                ];

            const results = ap.extractRacesFromAP(mockData);
            it("returns an array", () => {
                assert.isArray(results);
            });
            it("each object in the array has a boolean 'isRepublican' property", () => {
                results.forEach((race) => {
                    assert.property(race, "isRepublican");
                    assert.isBoolean(race.isRepublican);
                });
            });
            it("If param object's 'party' property = 'Dem', return object's 'isRepublican' = false", () => {
                const dem = results[0];
                assert.isFalse(dem.isRepublican);
            });
            it("If param object's 'party' property = 'GOP', return object's is'Republican' = true", () => {
                const rep = results[1];
                assert.isTrue(rep.isRepublican);
            });
            it("each object in the array has a 'title' string property", () => {
                results.forEach((race) => {
                    assert.property(race, "title");
                    assert.isString(race.title);
                });
            });
            it("if param object has only an 'officeName' priority, return object's 'title' matches it", () => {
                assert.strictEqual(results[0].title, mockData[0].officeName);
            });
            it("if param object has 'officeName' and 'seatName', return object's 'title' is a concat of them", () => {
                assert.strictEqual(results[1].title, "U.S. House - District 9");
            });
            it("each object has a 'candidates' property, which is an array of objects", () => {
                results.forEach((race) => {
                    assert.property(race, "candidates");
                    assert.isArray(race.candidates);
                    race.candidates.forEach((candidate) => {
                        assert.isObject(candidate);
                    });
                });
            });
            it("the length of the 'candidates' array matches the length in the param data", () => {
                assert.lengthOf(results[0].candidates, mockData[0].reportingUnits[0].candidates.length);
                assert.lengthOf(results[1].candidates, mockData[1].reportingUnits[0].candidates.length);
            });
            it("each candidate in the array matches the 'candidate' structure", () => {
                results[0].candidates.forEach((candidate, index) => {
                    if (index === 0) {
                        assert.strictEqual(candidate.name, "Miguel Suazo");
                        assert.strictEqual(candidate.votes, 545096);
                        assert.isTrue(candidate.winner);
                        assert.isUndefined(candidate.incumbent);
                        assert.isUndefined(candidate.runoff);
                    } else if (index === 1) {
                        assert.strictEqual(candidate.name, "Tex Morgan");
                        assert.strictEqual(candidate.votes, 445989);
                        assert.isUndefined(candidate.winner);
                        assert.isTrue(candidate.incumbent);
                        assert.isUndefined(candidate.runoff);
                    }
                });

                const secondRaceCandidate = results[1].candidates[0];

                assert.strictEqual(secondRaceCandidate.name, "Kim Olson");
                assert.strictEqual(secondRaceCandidate.votes, 0);
                assert.isTrue(secondRaceCandidate.winner);
                assert.isUndefined(secondRaceCandidate.incumbent);
                assert.isUndefined(secondRaceCandidate.runoff);
            });
            it("each object has a 'source' property set to 'Associated Press'", () => {
                results.forEach((race) => {
                    assert.strictEqual(race.source, "Associated Press");
                });
            });
            it("each object has a 'percentPrecintsReporting' number property", () => {
                results.forEach((race) => {
                    assert.property(race, "percentPrecinctsReporting");
                    assert.isNumber(race.percentPrecinctsReporting);
                });
            });
            it("the 'percentPrecinctsReporting' value matches the param's RU's value", () => {
                assert.strictEqual(results[0].percentPrecinctsReporting,
                    mockData[0].reportingUnits[0].precinctsReportingPct);
                assert.strictEqual(results[1].percentPrecinctsReporting,
                    mockData[1].reportingUnits[0].precinctsReportingPct);
            });
        });
    });
    describe("extractPrimariesFromAP", () => {
        const results = ap.extractPrimariesFromAP(mockAPResponse.races);
        it("returns an array", () => {
            assert.isArray(results);
        });
        it("each item in the array is an object", () => {
            results.forEach((primary) => {
                assert.isObject(primary);
            });
        });
        describe("Return objects", () => {
            it("the number of objects matches the number of param races / 2", () => {
                assert.strictEqual(results.length, mockAPResponse.races.length / 2);
            });
            it("each object has a string 'title', and each one matches the title of the races in param", () => {
                const expectedTitles = [
                    "Land Commissioner",
                    "Agriculture Commissioner",
                    "U.S. House - District 21",
                    "Governor",
                    "U.S. Senate",
                    "U.S. House - District 35",
                    "Lieutenant Governor",
                    "Railroad Commissioner",
                    "U.S. House - District 23",
                ];

                expectedTitles.forEach((title) => {
                    assert.isDefined(results.find((result) => result.title === title));
                });
            });
            it("each object has a 'races' property, which is an array of length 2", () => {
                results.forEach((primary) => {
                    assert.isArray(primary.races);
                    assert.lengthOf(primary.races, 2);
                });
            });
            it("there is one Democrat and one Republican race in each primary", () => {
                results.forEach((primary) => {
                    const dem = primary.races.filter((race) => race.isRepublican === false);
                    const rep = primary.races.filter((race) => race.isRepublican === true);

                    assert.isDefined(dem);
                    assert.isDefined(rep);
                });
            });
            it("each primary has a number 'id' property, which matches the id in the master map", () => {
                results.forEach((primary) => {
                    const expectedID = primaryIDMap.get(primary.title);
                    assert.strictEqual(expectedID, primary.id);
                });
            });
            // it("the title for each of the two races matches the primary's title", () => {
            //     results.forEach((primary) => {
            //         assert.strictEqual(primary.title, primary.races[0].title);
            //         assert.strictEqual(primary.title, primary.races[1].title);
            //     });
            // });
        });
    });
    describe("mergeAndUpdatePrimaries", () => {
        const oldPrimaries: Primary[] = [
            {
                title: "A",
                id: 1,
                races: [
                    {
                        isRepublican: true,
                        title: "A",
                        candidates: [
                            {
                                name: "John Smith",
                                votes: 0,
                            },
                            {
                                name: "Jane Smith",
                                votes: 0,
                            },
                        ],
                    },
                    {
                        isRepublican: false,
                        title: "A",
                        candidates: [
                            {
                                name: "Smith John",
                                votes: 0,
                            },
                            {
                                name: "Smith Jane",
                                votes: 0,
                            },
                        ],
                    },
                ],
            },
            {
                title: "B",
                id: 1,
                races: [
                    {
                        isRepublican: true,
                        title: "B",
                        candidates: [
                            {
                                name: "A person",
                                votes: 0,
                            },
                            {
                                name: "B person",
                                votes: 0,
                            },
                        ],
                    },
                    {
                        isRepublican: false,
                        title: "B",
                        candidates: [
                            {
                                name: "C person",
                                votes: 0,
                            },
                            {
                                name: "D person",
                                votes: 0,
                            },
                        ],
                    },
                ],
            },
        ];
        const newPrimaries: Primary[] = [
            {
                title: "B",
                id: 1,
                races: [
                    {
                        isRepublican: true,
                        title: "B",
                        candidates: [
                            {
                                name: "A person",
                                votes: 500,
                            },
                            {
                                name: "B person",
                                votes: 500,
                            },
                        ],
                    },
                    {
                        isRepublican: false,
                        title: "B",
                        candidates: [
                            {
                                name: "C person",
                                votes: 500,
                            },
                            {
                                name: "D person",
                                votes: 500,
                            },
                        ],
                    },
                ],
            },
        ];

        const merged = ap.mergeAndUpdatePrimaries(oldPrimaries, newPrimaries);
        it("returns an array", () => {
            assert.isArray(merged);
        });
        it("each item in the array is a Primary", () => {
            merged.forEach((primary) => {
                assert.isString(primary.title);
                assert.isNumber(primary.id);
                assert.isArray(primary.races);
            });
        });
        it("the array's length = the number of unique primaries", () => {
            assert.lengthOf(merged, 2);
        });
        it("data not present in the second array maintains its state from the first", () => {
            const primaryA = merged.find((primary) => primary.title === "A") as Primary;
            primaryA.races.forEach((race) => {
                race.candidates.forEach((candidate) => {
                    assert.strictEqual(candidate.votes, 0);
                });
            });
        });
        it("data present in both arrays returns its copy from the second", () => {
            const primaryB = merged.find((primary) => primary.title === "B") as Primary;
            primaryB.races.forEach((race) => {
                race.candidates.forEach((candidate) => {
                    assert.strictEqual(candidate.votes, 500);
                });
            });
        });
    });
});
