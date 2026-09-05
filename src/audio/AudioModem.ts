export interface AudioModem {
    transmit(data: Uint8Array): Promise<void>;
    receive(): Promise<Uint8Array>;
}