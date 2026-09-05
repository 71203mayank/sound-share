import type { AudioModem } from "./AudioModem";
import { FSK_CONFIG } from "./FSKConfig";
import { FSKModulator } from "./FSKModulator";
import { FrameCodec } from "./FrameCodec";
import { AudioPlayer } from "./AudioIO";

export class FSKAudioModem implements AudioModem {
    private readonly modulator = new FSKModulator();
    private readonly codec = new FrameCodec()
    private readonly player = new AudioPlayer();

    async transmit(data: Uint8Array): Promise<void> {
        const frame = this.codec.encode(data);

        const waveform = this.modulator.modulate(frame);

        await this.player.play(waveform, FSK_CONFIG.sampleRate);
    }

    async receive(): Promise<Uint8Array> {
        throw new Error("Receive not implemented yet.");
    }
}