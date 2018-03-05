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

    // var arr3 = [];
    // for (var i in arr1) {
    //     var shared = false;
    //     for (var j in arr2)
    //         if (arr2[j].name == arr1[i].name) {
    //             shared = true;
    //             break;
    //         }
    //     if (!shared) arr3.push(arr1[i])
    // }
    // arr3 = arr3.concat(arr2);
};
