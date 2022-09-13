import * as solanaWeb3 from "@solana/web3.js";
import { useEffect, useState } from "react";
import Airdrop from "./Airdrop";
import "./App.css";
import TransferSol from "./Transfer";

const network = "devnet";
const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl(network));

const App = () => {
  const [walletAvail, setWalletAvail] = useState(false);
  const [provider, setProvider] = useState(null);
  const [connected, setConnected] = useState(false);
  const [pubKey, setPubKey] = useState(null);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if ("solana" in window) {
      const solWindow = window;
      if (solWindow?.solana?.isPhantom) {
        setProvider(solWindow.solana);
        setWalletAvail(true);
        // Attemp an eager connection
        solWindow.solana.connect({ onlyIfTrusted: true });
      }
    }
  }, []);

  useEffect(() => {
    provider?.on("connect", async (publicKey) => {
      console.log(`connect event: ${publicKey}`);
      setConnected(true);
      setPubKey(publicKey);
      let balance = await connection.getBalance(publicKey);
      console.log("balance", balance);
      setBalance(balance);
    });
    provider?.on("disconnect", () => {
      console.log("disconnect event");
      setConnected(false);
      setPubKey(null);
    });
  }, [provider]);

  const connectHandler = (event) => {
    console.log(`connect handler`);
    provider?.connect().catch((err) => {
      console.error("connect ERROR:", err);
    });
  };

  const disconnectHandler = (event) => {
    console.log("disconnect handler");
    provider?.disconnect().catch((err) => {
      console.error("disconnect ERROR:", err);
    });
  };

  return (
    <div className="App">
      {" "}
      <h1>Wallet connection transfer Sol</h1>
      {walletAvail ? (
        <>
          {!connected ? (
            <button onClick={connectHandler}>Connect to Phantom</button>
          ) : (
            <button onClick={disconnectHandler}>
              Disconnect from Phantom
            </button>
          )}
          {connected ? (
            <h3>
              Your public key is : <span>{pubKey?.toBase58()}</span>
            </h3>
          ) : null}

          {pubKey ? (
            <h3>
              {" "}
              Balance :{" "}
              <span>{balance / solanaWeb3.LAMPORTS_PER_SOL} SOL </span>
            </h3>
          ) : (
            ""
          )}
        </>
      ) : (
        <>
          <p>
            Opps!!! Phantom is not available. Go get it{" "}
            <a href="https://phantom.app/">https://phantom.app/</a>.
          </p>
        </>
      )}
      {pubKey ? <Airdrop pubkey={pubKey} updatedBalance={setBalance}/> : null}

      {pubKey ? <TransferSol provider={provider}/> : null}
    </div>
  );
};

export default App;
