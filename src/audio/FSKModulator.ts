import { FSK_CONFIG } from "./FSKConfig";

export class FSKModulator {
    private readonly sampleRate = FSK_CONFIG.sampleRate;
    
    private readonly symbolSamples = Math.floor(FSK_CONFIG.sampleRate * FSK_CONFIG.symbolDuration);

    modulate(data: Uint8Array) : Float32Array {
        const symbolCount = data.length * 4;

        const output = new Float32Array(symbolCount * this.symbolSamples);

        let symbolIndex = 0;

        for(const byte of data){
            // 4 FSK: 00, 01, 10, 11

            for(let shift = 6; shift >= 0; shift -= 2){
                const symbol = (byte >> shift) & 0b11;

                const frequency = FSK_CONFIG.frequencies[symbol];

                this.generateSymbol(output, symbolIndex++, frequency);
            }
        }

        return output;
    }

    private generateSymbol(output: Float32Array, symbolIndex: number, frequency: number) : void {
        const offset = symbolIndex * this.symbolSamples;
        
        const amplitude = FSK_CONFIG.amplitude;

        for(let i = 0; i < this.symbolSamples; i++){
            const t = i / this.sampleRate;
            output [offset + i] = amplitude * Math.sin(2 * Math.PI * frequency * t);
        }
    }
}

/**
 * One potential improvement:
 * This resets the sine-wave phase at every symbol. But later make the phase continuous and add a small ramp to prevent clicks.
 */