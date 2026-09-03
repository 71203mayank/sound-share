export const FSK_CONFIG = {
    sampleRate: 48_000, // 48 kHz

    // Four frequencies:
    // 00: 1800 Hz
    // 01: 2400 Hz
    // 10: 3000 Hz
    // 11: 3600 Hz
    frequencies: [1800, 2400, 3000, 3600],

    // 5ms per sybmol, 200 symbols/sec, 400 bits/sec
    symbolDuration: 0.005, // 5 ms
    amplitude: 0.5, // 50% of max amplitude

    // Number of repeated 0xAA bytes at beginning
    preambleBytes: 8,

    // sync bytes
    syncBytes: new Uint8Array([0xD3, 0x91, 0x7E, 0x4A]),
} as const;