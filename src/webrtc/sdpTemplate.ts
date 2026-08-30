// Hydrates template text string from decoded bytes


import type {
    PackedSDP,
    PackedCandidate,
    CandidateType 
} from "../types"


// PackedCandidate -> string (candidate)
function formatCandidate (candidate: PackedCandidate) : string {
    let value = 
        `candidate:${candidate.foundation} `+
        `${candidate.component} `+
        `${candidate.protocol.toUpperCase()} `+
        `${candidate.priority} `+
        `${candidate.ip} `+
        `${candidate.port} `+
        `typ ${candidate.type}`;
    
    if (candidate.relatedAddress){
        value += ` raddr ${candidate.relatedAddress}`;
    }

    if(candidate.relatedPort){
        value += ` rport ${candidate.relatedPort}`;
    }

    return `a=${value}`;
}

// PackedSDP -> string (sdp)
export function generateSDP(data: PackedSDP) : string {
    const setup = 
        data.type === "offer"
            ? "actpass"
            : data.setup;
    
    const lines = [
        "v=0",

        // Fixed session information.
        "o=- 0 0 IN IP4 0.0.0.0",
        "s=-",
        "t=0 0",

        // DataChannel.
        "m=application 9 UDP/DTLS/SCTP webrtc-datachannel",
        "c=IN IP4 0.0.0.0",

        // ICE.
        `a=ice-ufrag:${data.ufrag}`,
        `a=ice-pwd:${data.pwd}`,

        // DTLS.
        `a=fingerprint:sha-256 ${data.fingerprint}`,
        `a=setup:${setup}`,

        // Media identification.
        `a=mid:${data.mid}`,

        // SCTP.
        "a=sctp-port:5000",

        // ICE candidates.
        ...data.candidates.map(formatCandidate),
    ];

    return lines.join("\r\n") + "\r\n";

}
//NOTE: The candidate itself contains the original IP address, not c=IN IP4 0.0.0.0


/**
 * Browser generatedSDP -> extract fields -> PackedSDP
 */

// sdp -> PackedSDP
export function parseSDP (
    sdp: string,
    type: "offer" | "answer"
) : PackedSDP {
    
    const lines = sdp
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
    
    const find = (prefix: string) : string => {
        const line = lines.find((line) => line.startsWith(prefix));

        if(!line){
            throw new Error(`Missing SDP field: ${prefix}`);
        }

        return line.slice(prefix.length);
    }

    const ufrag = find("a=ice-ufrag:");
    const pwd = find("a=ice-pwd:");

    const fingerprint = find("a=fingerprint:sha-256 ");
    
    const setup = 
        (lines.find((line) => line.startsWith("a=setup:"))
        ?.slice("a=setup:".length) as PackedSDP["setup"]) ??
        (type === "offer" ? "actpass" : "active");
    
    const mid = find("a=mid:");

    const candidates = lines
        .filter((line) => line.startsWith("a=candidate:"))
        .map(parseCandidate);

    return {
        version: 1,
        type,
        ufrag,
        pwd,
        fingerprint,
        setup,
        mid,
        candidates
    }
}

// candidate -> PackedCandidate
export function parseCandidate (line : string) : PackedCandidate {
    const value = line.startsWith("a=")
        ? line.slice(2)
        : line;
    
     const parts = value.split(" ");

     const candidateParts = parts[0].split(":");

     const foundation = Number(candidateParts[1]);

     const component = Number(parts[1]);

     const protocol = parts[2].toLowerCase() as "udp" | "tcp";

     const priority = Number(parts[3]);

     const ip = parts[4];

     const port = Number(parts[5]);

     const typeIndex = parts.indexOf("typ");

    if (typeIndex === -1 || !parts[typeIndex + 1]) {
        throw new Error("Invalid ICE candidate: missing type");
    }

    const type = parts[typeIndex + 1] as CandidateType;

    const raddrIndex = parts.indexOf("raddr");
    const rportIndex = parts.indexOf("rport");

    return {
        foundation,
        component,
        protocol,
        priority,
        ip,
        port,
        type,

        relatedAddress:
        raddrIndex !== -1
            ? parts[raddrIndex + 1]
            : undefined,

        relatedPort:
        rportIndex !== -1
            ? Number(parts[rportIndex + 1])
            : undefined,
    };

}


// stun.l.google.com 19302
// stun.cloudflare.com 3478