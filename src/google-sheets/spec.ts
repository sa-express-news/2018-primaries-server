import { assert } from "chai";
import { Candidate } from "../types";
import * as gs from "./index";

describe("Google Sheets", () => {
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
    describe("buildRace", () => {
        const data = ["Bexar County DA", "FALSE", "Jane Smith", "500", "John Smith", "200"];
        const race = gs.buildRace(data);
        it("returns an object", () => {
            assert.isObject(race);
        });
        it("the object has a 'title' string property", () => {
            assert.property(race, "title");
            assert.isString(race.title);
        });
        it("the object has an 'isRepublican' boolean property", () => {
            assert.property(race, "isRepublican");
            assert.isBoolean(race.isRepublican);
        });
        it("the object has a 'candidates' property, which is an array of Candidate objects", () => {
            assert.property(race, "candidates");
            race.candidates.forEach((candidate: Candidate) => {
                assert.property(candidate, "name");
                assert.isString(candidate.name);
                assert.property(candidate, "votes");
                assert.isNumber(candidate.votes);
            });
        });
    });
    describe("buildPrimaries", () => {
        describe("Properly formatted data", () => {
            const data = [
                ["Bexar County DA", "TRUE", "John Smith", "100", "Jane Smith", "101"],
                ["Bexar County DA", "FALSE", "Smith Jones", "102", "Smith Janes", "103"],
                ["County Clerk", "TRUE", "Bob Luther", "104"],
            ];

            const primaries = gs.buildPrimaries(data);

            it("returns an array", () => {
                assert.isArray(primaries);
            });
            it("each item in the array is an object", () => {
                primaries.forEach((primary) => {
                    assert.isObject(primary);
                });
            });
            it("each Primary object has a 'title' string property", () => {
                primaries.forEach((primary) => {
                    assert.property(primary, "title");
                    assert.isString(primary.title);
                });
            });
            it("each Primary object has an 'id' number property", () => {
                primaries.forEach((primary) => {
                    assert.property(primary, "id");
                    assert.isNumber(primary.id);
                });
            });
            it("each Primary object has a 'races' property, which is an array of Race objects", () => {
                primaries.forEach((primary) => {
                    assert.property(primary, "races");
                    primary.races.forEach((race) => {
                        assert.isObject(race);
                        assert.property(race, "title");
                        assert.isString(race.title);
                        assert.property(race, "isRepublican");
                        assert.isBoolean(race.isRepublican);
                        assert.property(race, "candidates");
                        assert.isArray(race.candidates);
                    });
                });
            });
        });
    });
    describe("isPrimaryRow", () => {
        it("returns a boolean", () => {
            const data = ["Bexar County DA", "TRUE", "John Smith", "100", "Jane Smith", "101"];

            assert.isBoolean(gs.isPrimaryRow(data));
        });
        it("returns false if the array's length is < 4", () => {
            const data = ["Bexar County DA", "TRUE", "John Smith"];

            assert.isFalse(gs.isPrimaryRow(data));
        });
        it("returns false if any of the first four strings in the array are empty", () => {
            const data = ["Bexar County DA", "TRUE", "John Smith", ""];

            assert.isFalse(gs.isPrimaryRow(data));
        });
        it("returns false if the first item in the array is undefined or an empty string", () => {
            const first: string[] = [];
            const second = [""];

            assert.isFalse(gs.isPrimaryRow(first));
            assert.isFalse(gs.isPrimaryRow(second));
        });
        it("returns false if the second item is not the string 'true' or 'false', case not important", () => {
            const data = ["Bexar County DA", "foo", "John Smith", "100", "Jane Smith", "101"];

            assert.isFalse(gs.isPrimaryRow(data));
        });
        it("returns false if the fourth item in the array can't be converted to an integer", () => {
            const data = ["Bexar County DA", "foo", "John Smith", "fark", "Jane Smith", "101"];
            assert.isFalse(gs.isPrimaryRow(data));

        });
    });
    describe("getAllAtSubarrayIndex", () => {
        const data = [
            ["John Smith", 0, { foo: "bar" }],
            ["Jane Smith", 1, { foo: "bar" }],
            ["Jack Smith", 2, { foo: "bar" }],
            ["Joan Smith", 3, { foo: "bar" }],
        ];
        it("returns an array", () => {
            const result = gs.getAllAtSubarrayIndex(data, 1);
            assert.isArray(result);
        });
        it("the array contains every element at the (i)th index of each subarray", () => {
            const result = gs.getAllAtSubarrayIndex(data, 1);
            result.forEach((datum: number, index: number) => {
                assert.strictEqual(datum, index);
            });
        });
        it("if a subarray doesn't reach the (i)th index, it is skipped", () => {
            const varyingSize = [
                [1, "foo"],
                [2],
                [3, "bar"],
            ];

            const result = gs.getAllAtSubarrayIndex(varyingSize, 1);
            assert.lengthOf(result, 2);
            assert.strictEqual(result[0], "foo");
            assert.strictEqual(result[1], "bar");
        });
    });
});
