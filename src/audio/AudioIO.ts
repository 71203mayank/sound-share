export class AudioPlayer {
    private context?: AudioContext;

    async play(samples: Float32Array, sampleRate: number): Promise<void> {
        if(!this.context){
            this.context = new AudioContext({ sampleRate });
        }

        const context = this.context;
        
        await context.resume();

        const buffer = context.createBuffer(1, samples.length, sampleRate);

        buffer.copyToChannel(new Float32Array(samples), 0);

        const source = context.createBufferSource();

        source.buffer = buffer;

        source.connect(context.destination);

        return new Promise((resolve) => {
            source.onended = () => {
                resolve();
            };

            source.start();
        });
    }

    async close (): Promise<void> {
        if(this.context){
            await this.context.close();
            this.context = undefined;
        }
    }
}