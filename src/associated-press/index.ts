import { APCandidate, Candidate } from "../types";

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
        }

        extractedCandidates.push(theCandidate);
    });

    return extractedCandidates;
};
