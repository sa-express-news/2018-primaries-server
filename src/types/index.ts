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
    source: string;
    source_url: string;
}

export interface Candidate {
    name: string;
    votes: number;
}
