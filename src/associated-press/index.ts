import {APCandidate, Candidate} from "../types";

export const extractCandidates = (candidates: APCandidate[]): Candidate[] => {
    const extractedCandidates: Candidate[] = [];
    candidates.forEach((candidate: APCandidate) => {
        extractedCandidates.push({
            name: `${candidate.first} ${candidate.last}`,
            votes: candidate.voteCount ? candidate.voteCount : 0,
        });
    });

    return extractedCandidates;
};
