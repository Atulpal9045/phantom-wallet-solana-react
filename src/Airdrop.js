import {
  Connection,
  PublicKey,
  clusterApiUrl,
  RpcResponseAndContext,
  SignatureResult,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { FC, useEffect, useRef, useState } from "react";

const network = "devnet";

const Airdrop = ({ pubkey, updatedBalance }) => {
  // Create a connection to blockchain and
  // make it persistent across renders
  const connection = useRef(new Connection(clusterApiUrl(network)));

  const [publickey] = useState(pubkey.toBase58());
  const [lamports, setLamports] = useState(100000);
  const [txid, setTxid] = useState(null);
  const [slot, setSlot] = useState(null);
 

  // Retrieve the balance when mounting the component
  useEffect(() => {
    connection.current.getBalance(pubkey).then(updatedBalance);
  }, [pubkey]);

  function handleSubmit(event) {
    event.preventDefault();
    pubkey &&
      connection.current
        .requestAirdrop(pubkey, lamports)
        .then((id) => {
          console.log(`Transaction ID ${id}`);
          setTxid(id);
          connection.current.confirmTransaction(id).then((confirmation) => {
            console.log(`Confirmation slot: ${confirmation.context.slot}`);
            setSlot(confirmation.context.slot);
            connection.current.getBalance(pubkey).then(updatedBalance);
          });
        })
        .catch(console.error);
  }

  function handleChange(event) {
    setLamports(parseInt(event.target.value));
  }

  return (
    <div>
      <h1 className="p15">Request Airdrop SOL for devnet</h1>
      <form onSubmit={handleSubmit}>
        <label>Public Key to receive airdrop</label>
        <br />
        <br />
        <input
          type="text"
          readOnly={true}
          disabled={true}
          value={publickey}
          className="input-text"
        />
        <br />
        <label>Lamports to request</label>
        <br />
        <br />
        <input
          type="number"
          value={lamports}
          onChange={handleChange}
          className="input-text"
        />
        <br />
        <input type="submit" value="Request airdrop" className="input-submit" />
      </form>

      {txid || slot ? (
        <>
          <hr />
          {txid ? (
            <h3>
              {" "}
              Transaction: <span>{txid}</span>{" "}
            </h3>
          ) : null}
          {slot || txid ? (
            <h3>
              {" "}
              Confirmation slot: <span>{slot ? slot : 'confirming....'} </span>
            </h3>
          ) : null}
          <hr />
        </>
      ) : null}
      {/* <p>Your current balance is: {balance / LAMPORTS_PER_SOL}</p> */}
    </div>
  );
};

export default Airdrop;
