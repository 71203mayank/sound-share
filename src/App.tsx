import { useEffect, useState } from "react";
import type { PackedSDP } from "./types";
import { ConnectionManager } from "./webrtc/ConnectionManager";

export async function createHandshake(): Promise<PackedSDP> {
  const connection = new ConnectionManager();

  const packedOffer = await connection.createOffer();
  connection.close();

  // const encoded = BitPacker.encode(packedOffer);
  // await modem.transmit(encoded);

  return packedOffer;
}

// acceptHandShake
// finish handshake

function App() {
  const [packedOffer, setPackedOffer] = useState<PackedSDP | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      </div>
    </div>
  );
}

export default App;