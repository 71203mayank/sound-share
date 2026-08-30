                  DEVICE A
                     │
             RTCPeerConnection
                     │
               createOffer()
                     │
            setLocalDescription()
                     │
                     ▼
                ICE gathering
                     │
            ┌────────┴────────┐
            │                 │
          STUN              local
            │              candidates
            ▼                 │
       srflx candidate        │
            │                 │
            └────────┬────────┘
                     ▼
                 local SDP
                     │
                     ▼
              SDP → PackedSDP
                     │
                     ▼
                 BitPacker
                     │
                     ▼
                  ggwave
                     │
                  🔊 audio
                     │
                  🔊 audio
                     │
                     ▼
                 BitPacker
                     │
                     ▼
              PackedSDP → SDP
                     │
                     ▼
          setRemoteDescription()
                     │
                     ▼
                 WebRTC