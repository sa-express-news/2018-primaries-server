const racePrimaryMap = new Map();

// Data comes in from both AP and Google sheets by race.
// This map lets primary-creating functions check on race ID
// to get the proper title for the primary.

racePrimaryMap.set(44010, "Governor");
racePrimaryMap.set(48466, "Governor");
racePrimaryMap.set(48428, "U.S. Senate");
racePrimaryMap.set(49021, "U.S. Senate");
racePrimaryMap.set(44175, "U.S. House - District 21");
racePrimaryMap.set(48456, "U.S. House - District 21");
racePrimaryMap.set(48458, "U.S. House - District 23");
racePrimaryMap.set(44177, "U.S. House - District 23");
racePrimaryMap.set(44015, "Land Commissioner");
racePrimaryMap.set(48652, "Land Commissioner");
racePrimaryMap.set(49394, "U.S. House - District 35");
racePrimaryMap.set(49395, "U.S. House - District 35");
racePrimaryMap.set(44011, "Lieutenant Governor");
racePrimaryMap.set(48468, "Lieutenant Governor");
racePrimaryMap.set(44016, "Agriculture Commissioner");
racePrimaryMap.set(48650, "Agriculture Commissioner");
racePrimaryMap.set(44017, "Railroad Commissioner");
racePrimaryMap.set(49050, "Railroad Commissioner");
racePrimaryMap.set(48606, "State Representative - District 121");
racePrimaryMap.set(48960, "State Representative - District 121");
racePrimaryMap.set(48607, "State Representative - District 122");
racePrimaryMap.set(48961, "State Representative - District 122");
racePrimaryMap.set(48961, "State Representative - District 122");
racePrimaryMap.set(44347, "State Representative - District 116");
racePrimaryMap.set(48806, "State Representative - District 116");
racePrimaryMap.set(48602, "State Representative - District 117");
racePrimaryMap.set(44348, "State Representative - District 117");
racePrimaryMap.set(44349, "State Representative - District 118");
racePrimaryMap.set(48808, "State Representative - District 118");
racePrimaryMap.set(49006, "State Representative - District 124");
racePrimaryMap.set(44355, "State Representative - District 124");

export default racePrimaryMap;
