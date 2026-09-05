import { useEffect, useState } from "react";
import type { PackedSDP } from "./types";
import { ConnectionManager } from "./webrtc/ConnectionManager";
import { BitPacker } from "./compression/BitPacker";
import { FSKAudioModem } from "./audio/FSKAudioModem";

export async function createHandshake(): Promise<PackedSDP> {
  const connection = new ConnectionManager();

  const packedOffer = await connection.createOffer();
  connection.close();

  return packedOffer;
}

// acceptHandShake
// finish handshake

function App() {
  const [packedOffer, setPackedOffer] = useState<PackedSDP | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [transmitted, setTransmitted] = useState(false);

  const transmitOffer = async () => {
    if (!packedOffer || isTransmitting) {
      return;
    }

    setError(null);
    setTransmitted(false);
    setIsTransmitting(true);

    try {
      const modem = new FSKAudioModem();
      await modem.transmit(BitPacker.encode(packedOffer));
      setTransmitted(true);
    } catch (err) {
      console.error("Failed to transmit offer:", err);
      setError("Failed to transmit audio.");
    } finally {
      setIsTransmitting(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    createHandshake()
      .then((offer) => {
        if (isMounted) {
          setPackedOffer(offer);
        }
      })
      .catch((err) => {
        console.error("Failed to create handshake:", err);

        if (isMounted) {
          setError("Failed to create packed offer.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div>
      <h1>Sound Share</h1>

      <div>
        <h2>Packed Offer</h2>

        {error ? (
          <p>{error}</p>
        ) : packedOffer ? (
          <pre>{JSON.stringify(packedOffer, null, 2)}</pre>
        ) : (
          <p>Creating packed offer...</p>
        )}

        <button
          type="button"
          onClick={transmitOffer}
          disabled={!packedOffer || isTransmitting}
        >
          {isTransmitting ? "Transmitting..." : "Transmit audio"}
        </button>

        {transmitted && <p>Audio transmission complete.</p>}
      </div>
    </div>
  );
}

export default App;