import { APCandidate, APRace, Candidate, Race } from "../types";

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
