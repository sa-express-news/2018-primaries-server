export const mergeAndUpdateArraysOfObjects = <T>(array1: T[], array2: T[], mergeProperty: string): T[] => {
    let newArray: T[] = [];
    array1.forEach((object1: T) => {
        let shared = false;
        array2.forEach((object2: T) => {
            if (object2[mergeProperty] === object1[mergeProperty]) {
                shared = true;
            }
        });
        if (!shared) {
            newArray.push(object1);
        }
    });

    newArray = newArray.concat(array2);

    return newArray;
};
