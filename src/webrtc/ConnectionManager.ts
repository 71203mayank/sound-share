// Manages RTCPeerConnection and ICE gathering


import {
    generateSDP,
    parseSDP
} from "./sdpTemplate";

import type { PackedSDP } from "../types";

const STUN_SERVER = "stun:stun.l.google.com:19302"; // Google's publicly available STUN Server
// const STUN_SERVER = "stun:stun.cloudflare.com 3478" // Cloudflare's publicly avalaible STUN Server

export class ConnectionManager {
    private pc: RTCPeerConnection;

    constructor() {
        this.pc = new RTCPeerConnection({
            iceServers : [
                {
                    urls: STUN_SERVER,
                },
            ],
        });
    }

    public getPeerConnection() : RTCPeerConnection {
        return this.pc;
    }

    public async createOffer() : Promise<PackedSDP> {
        /**
         * Creating a data channel cause the application
         * m-line to be included in the SDP offer
         */

        this.pc.createDataChannel("file-transfer");
        const offer = await this.pc.createOffer();
        
        await this.pc.setLocalDescription(offer);

        await this.waitForIceGathering();

        const localDescription = this.pc.localDescription;
        if (!localDescription?.sdp) {
            throw new Error("Local SDP was not generated");
        }

        return parseSDP(localDescription.sdp, "offer");

    }

    private waitForIceGathering() : Promise<void> {
        if(this.pc.iceGatheringState === "complete"){
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            const handler = () => {
                if(this.pc.iceGatheringState === "complete"){
                    this.pc.removeEventListener("icegatheringstatechange", handler);
                    resolve();
                }

            }

            this.pc.addEventListener("icegatheringstatechange", handler);
        });
    }

    public async applyRemoteOffer(packedOffer : PackedSDP) : Promise<PackedSDP> {
        const sdp = generateSDP(packedOffer);

        await this.pc.setRemoteDescription({
            type: "offer",
            sdp,
        });

        const answer = await this.pc.createAnswer();

        await this.pc.setLocalDescription(answer);

        await this.waitForIceGathering();

        const localDescription = this.pc.localDescription;

        if (!localDescription?.sdp) {
            throw new Error("Local answer SDP was not generated");
        }

        return parseSDP(localDescription.sdp, "answer");
    }

    public async applyRemoteAnswer(packedAnswer : PackedSDP) : Promise<void> {
        const sdp = generateSDP(packedAnswer);
        await this.pc.setRemoteDescription({
            type: "answer",
            sdp,
        });
    }

    public close() : void {
        this.pc.close()
    }
}