export interface AssociatedPressAPIResponse {
    electionDate: string;
    timestamp: string;
    races: APRace[];
    nextrequest: string;
}

export interface APRace {
    raceID: string; // parse to number
    statePostal: string;
    raceTypeID: string;
    officeID: string;
    officeName: string;
    party: string;
    numRunoff: number;
    national: boolean;
    lastUpdated: string; // parse to Date
    candidates: APCandidate[];
}

export interface APCandidate {
    first: string;
    last: string;
    party: string;
    candidateID: string; // parse to number
    polID: string; // parse to number
    ballotOrder: number;
    polNum: string; // parse to number
    voteCount?: number;
    winner?: "X";
}

export interface GoogleCredentials {
    installed: {
        client_id: string;
        project_id: string;
        auth_uri: string;
        token_uri: string;
        auth_provider_x509_cert_url: string;
        client_secret: string;
        redirect_uris: string[];
    };
}

export interface Primary {
    title: string;
    id: number;
    races: Race[];
}

export interface Race {
    isRepublican: boolean;
    title: string;
    candidates: Candidate[];
    source?: string;
    source_url?: string;
}

export interface Candidate {
    name: string;
    votes: number;
}
