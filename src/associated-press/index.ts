import * as rp from "request-promise-native";
import { APCandidate, APRace, AssociatedPressAPIResponse, Candidate, Primary, Race } from "../types";
import raceMap from "./racePrimaryMap";

import * as dotenv from "dotenv";
dotenv.config();

export interface APData {
    primaries: Primary[];
    nextURL: string;
}

export const fetchAPData = async (APIUrl: string): Promise<APData> => {
    try {
        const apiResponse: AssociatedPressAPIResponse = await fetchJSON(APIUrl);
        return {
            primaries: extractPrimariesFromAP(apiResponse.races),
            nextURL: `${apiResponse.nextrequest}&apikey=${process.env.AP_KEY as string}`,
        };
    } catch (error) {
        throw error;
    }
};

export const extractPrimariesFromAP = (data: APRace[]): Primary[] => {
    const primariesToReturn: Primary[] = [];

    data.forEach((race: APRace) => {
        // Race IDs come through from the API as strings
        const raceTitle = raceMap.get(parseInt(race.raceID, 10));
        if (raceTitle) {
            const matchingPrimary = primariesToReturn.find((primary) => primary.title === raceTitle);
            if (matchingPrimary) {

                // The race extraction expects an array of races
                // That was dumb, I will refactor if there's time

                const newRaceArray = extractRacesFromAP([race]);
                matchingPrimary.races.push(newRaceArray[0]);
            } else {
                const newRaceArray = extractRacesFromAP([race]);

                primariesToReturn.push({
                    title: raceTitle,
                    id: 0,
                    races: [newRaceArray[0]],
                });
            }
        }
    });

    return primariesToReturn;
};

export const extractRacesFromAP = (races: APRace[]): Race[] => {
    const racesToReturn: Race[] = [];

    races.forEach((race: APRace) => {
        racesToReturn.push({
            isRepublican: race.party.toLowerCase() === "gop" ? true : false,
            title: race.seatName ? `${race.officeName} - ${race.seatName}` : race.officeName,
            // We only take the first reporting unit for candidates because we only want state level results
            candidates: extractCandidates(race.reportingUnits[0].candidates),
            source: "Associated Press",
            percentPrecinctsReporting: race.reportingUnits[0].precinctsReportingPct,
        });
    });

    return racesToReturn;
};

export const extractCandidates = (candidates: APCandidate[]): Candidate[] => {
    const extractedCandidates: Candidate[] = [];
    candidates.forEach((candidate: APCandidate) => {
        const theCandidate: Candidate = {
            name: `${candidate.first} ${candidate.last}`,
            votes: candidate.voteCount ? candidate.voteCount : 0,
        };

        if (candidate.incumbent === true) {
            theCandidate.incumbent = true;
        }
        if (candidate.winner === "X") {
            theCandidate.winner = true;
        } else if (candidate.winner === "R") {
            theCandidate.runoff = true;
        }

        extractedCandidates.push(theCandidate);
    });

    return extractedCandidates;
};

export const fetchJSON = async (uri: string): Promise<any> => {
    try {
        const response = await rp({ uri, json: true });
        return response;
    } catch (error) {
        throw new Error(error);
    }
};
