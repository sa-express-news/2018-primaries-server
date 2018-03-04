export interface AssociatedPressAPIResponse {
    electionDate: string;
    timestamp: string;
    races: APRace[];
    nextrequest: string;
}

export interface APRace {
    raceID: string; // parse to number
    raceType: string;
    raceTypeID: string;
    officeID: string; // parse to number
    officeName: string;
    seatName?: string;
    party: string;
    numRunoff?: number;
    national?: boolean;
    uncontested?: boolean;
    reportingUnits: APReportingUnit[];
}

export interface APReportingUnit {
    statePostal: string;
    stateName: string;
    level: string;
    lastUpdated: string; // parse to Date
    precinctsReporting: number;
    precinctsTotal: number;
    precinctsReportingPct: number;
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
    winner?: string;
    incumbent?: boolean;
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
    percentPrecinctsReporting?: number;
    source?: string;
    source_url?: string;
}

export interface Candidate {
    name: string;
    votes: number;
    incumbent?: boolean;
    winner?: boolean;
    runoff?: boolean;
}
