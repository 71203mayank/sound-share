import type {
    PackedSDP,
    // PackedCandidate,
} from "../types";

const encoder = new TextEncoder();
const decoder = new TextDecoder();


export class BitPacker {
    public static encode(packedSDP: PackedSDP): Uint8Array {
        const json = JSON.stringify(packedSDP);
        return encoder.encode(json);
    }

    public static decode(data: Uint8Array): PackedSDP {
        const json = decoder.decode(data);
        return JSON.parse(json) as PackedSDP;
    }
}

/**
 * This isn't compressed yet, will implement a compression algorithm after implementing transmitor and receiver.
 * The idea is to use a compression algorithm to compress the data before sending it over the network, and then decompress it on the receiving end.
 * This will help reduce the amount of data that needs to be transmitted, which can improve performance and reduce latency.
 */