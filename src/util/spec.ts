import { assert } from "chai";
import * as util from "./index";

describe("mergeAndUpdateArraysOfObjects", () => {
    interface Person {
        name: string;
        age: number;
    }

    const array1: Person[] = [
        {
            name: "Kia",
            age: 25,
        },
        {
            name: "Jim",
            age: 53,
        },
    ];

    const array2: Person[] = [
        {
            name: "Mary",
            age: 40,
        },
        {
            name: "Jim",
            age: 40,
        },
    ];

    const merged: Person[] = util.mergeAndUpdateArraysOfObjects(array1, array2, "name");

    it("returns an array of objects", () => {
        assert.isArray(merged);
        merged.forEach((object) => {
            assert.isObject(object);
        });
    });
    it("the resulting array has length = number of unique objects in params based on prop passed", () => {
        // 3 unique names, so length should be 3
        assert.lengthOf(merged, 3);
    });
    it("items with duplicates on the passed prop are replaced with their copies in the 2nd passed array", () => {
        const jim = merged.find((object: Person) => object.name === "Jim") as Person;
        assert.strictEqual(jim.age, 40);
    });
});
