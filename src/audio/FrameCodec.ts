/**
┌──────────┬──────┬────────┬────────────┬─────────┐
│ Preamble │ Sync │ Length │ Payload    │ CRC32   │
│ 8 bytes  │4 B   │2 B     │ N bytes    │4 bytes  │
└──────────┴──────┴────────┴────────────┴─────────┘

 */


// crc32 implementation.

export class FrameCodec {
    private static readonly PREAMBLE_BYTE = 0xAA;

    private static readonly SYNC = new Uint8Array([0xD3, 0x91, 0x7E, 0x4A]);

    encode(payload: Uint8Array): Uint8Array {
        if(payload.length > 0xFFFF) {
            throw new Error("Payload too large");
        }

        const length = payload.length;
        const frameWithoutCrc = new Uint8Array(8 + FrameCodec.SYNC.length + 2 + length);

        let offset = 0;

        // Preamble: fill the first 8 bytes with the preamble byte
        frameWithoutCrc.fill(FrameCodec.PREAMBLE_BYTE, offset, offset + 8); // (value, start, end)
        offset += 8;

        // Sync: set the next 4 bytes to the sync sequence
        frameWithoutCrc.set(FrameCodec.SYNC, offset); // (value, start)
        offset += FrameCodec.SYNC.length;

        // Length: unit 16, big-endian (most significant byte at the lowest address)
        frameWithoutCrc[offset++] =
            (length >> 8) & 0xff;

        frameWithoutCrc[offset++] =
            length & 0xff;

        // Payload: set the payload bytes
        frameWithoutCrc.set(payload, offset);
        
        // CRC32: calculate the CRC32 of the frameWithoutCrc
        const crc = crc32(frameWithoutCrc);

        // Create the final frame
        const output = new Uint8Array(frameWithoutCrc.length + 4);
        output.set(frameWithoutCrc);

        output[frameWithoutCrc.length] = (crc >>> 24) & 0xff;
        output[frameWithoutCrc.length + 1] = (crc >>> 16) & 0xff;
        output[frameWithoutCrc.length + 2] = (crc >>> 8) & 0xff;
        output[frameWithoutCrc.length + 3] = crc & 0xff;

        return output;
    }

    decode(frame: Uint8Array) : Uint8Array {

        const minimumLength = 8 + FrameCodec.SYNC.length + 2 + 4; // Preamble + Sync + Length + CRC32

        if (frame.length < minimumLength) {
            throw new Error("Frame too short");
        }

        let offset = 8;

        // verify sync
        for (let i = 0; i < FrameCodec.SYNC.length; i++) {
            if (
                frame[offset + i] !==
                FrameCodec.SYNC[i]
            ) {
                throw new Error("Invalid sync");
            }
        }

        offset += FrameCodec.SYNC.length;

        // Read the length of the playload (2 bytes, big-endian)
        const payloadLength =
            (frame[offset] << 8) |
            frame[offset + 1];
        
        offset += 2;

        const expectedLenth = 8 + FrameCodec.SYNC.length + 2 + payloadLength + 4; // Preamble + Sync + Length + Payload + CRC32

        if (frame.length !== expectedLenth) {
            throw new Error("Frame length mismatch");
        }

         const payload = frame.slice(offset, offset + payloadLength);

         const crcOffset = offset + payloadLength;

         const receivedCrc =
            ((frame[crcOffset] << 24) >>> 0) |
            (frame[crcOffset + 1] << 16) |
            (frame[crcOffset + 2] << 8) |
            frame[crcOffset + 3];

        const calculatedCrc = crc32(frame.slice(0, crcOffset));

        if (receivedCrc !== calculatedCrc) {
            throw new Error("CRC mismatch");
        }

        return payload;
    }
}

export function crc32 (data: Uint8Array) : number {
    let crc = 0xFFFFFFFF;

    for(const byte of data) {
        crc ^= byte;

        for (let i = 0; i < 8; i++) {
            const mask = -(crc & 1);
            crc = (crc >>> 1) ^ (0xEDB88320 & mask);
        }
    }

    return (crc ^ 0xFFFFFFFF) >>> 0;
}