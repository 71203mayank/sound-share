export type CandidateType = "host" | "srflx" | "relay";

export interface PackedCandidate {
    foundation: number;
    component: number;
    protocol: "udp" | "tcp";
    priority: number;
    ip: string;
    port: number;
    type: CandidateType;
    relatedAddress?: string;
    relatedPort?: number;
}

export interface PackedSDP {
    version: 1;
    type: "offer" | "answer";

    ufrag: string;
    pwd: string;

    fingerprint: string;
    setup: "actpass" | "active" | "passive";

    mid: string;

    candidates: PackedCandidate[];
}

export interface SignalingPacket {
    version: number;
    type: "offer" | "answer";
    payload: Uint8Array;
}