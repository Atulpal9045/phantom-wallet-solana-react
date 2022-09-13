import {
  clusterApiUrl,
  Connection,
  PublicKey,
  RpcResponseAndContext,
  SignatureResult,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { FC, useEffect, useRef, useState } from "react";

const network = "devnet";

const defaultDest = "A3gWSs3vB6T1hwbEP5ENJgnydBJzH3TL1QjPWASYkDbK";

const TransferSol = (props) => {
  // Create a connection to blockchain and
  // make it persistent across renders
  const connection = useRef(new Connection(clusterApiUrl(network)));

  const [destAddr, setDestAddr] = useState(defaultDest);
  const [lamports, setLamports] = useState(10000);
  const [txid, setTxid] = useState(null);
  const [slot, setSlot] = useState(null);
  const [myBalance, setMyBalance] = useState(0);
  const [rxBalance, setRxBalance] = useState(0);

  // Get the balance the first time the component is mounted
  useEffect(() => {
    connection.current.getBalance(props.provider.publicKey).then(setMyBalance);
  }, [props.provider.publicKey]);

  useEffect(() => {
    connection.current.getBalance(new PublicKey(destAddr)).then(setRxBalance);
  }, [destAddr]);

  const handleChangeAddr = (event) => {
    setDestAddr(event.target.value);
  };

  const handleChangeLamp = (event) => {
    setLamports(parseInt(event.target.value));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Create a TX object
    let transaction = new Transaction({
      feePayer: props.provider.publicKey,
      blockhash: await connection.current.getLatestBlockhash(),
      lastValidBlockHeight: await connection.current.getBlockHeight(),
    });

    // Add instructions to the tx
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: props.provider.publicKey,
        toPubkey: new PublicKey(destAddr),
        lamports: lamports,
      })
    );

    // Get the TX signed by the wallet (signature stored in-situ)
    await props.provider.signTransaction(transaction);

    // Send the TX to the network
    connection.current
      .sendRawTransaction(transaction.serialize())
      .then((id) => {
        console.log(`Transaction ID: ${id}`);
        setTxid(id);
        connection.current.confirmTransaction(id).then((confirmation) => {
          console.log(`Confirmation slot: ${confirmation.context.slot}`);
          setSlot(confirmation.context.slot);
          connection.current
            .getBalance(props.provider.publicKey)
            .then(setMyBalance);
          connection.current
            .getBalance(new PublicKey(destAddr))
            .then(setRxBalance);
        });
      })
      .catch(console.error);
  };

  return (
    <div>
      <h1>Transfer Sol to other Account</h1>
      <form onSubmit={handleSubmit}>
        <label>Enter address of destination</label>
        <br />
        <br />
        <input
          type="text"
          className="input-text"
          value={destAddr}
          onChange={handleChangeAddr}
        />
        <br />
        <label>Amount of lamports</label>
        <br />
        <br />
        <input
          type="number"
          value={lamports}
          className="input-text"
          onChange={handleChangeLamp}
        />
        <br />
        <br />
        <input type="submit" value="Send lamports" className="input-submit" />
        <hr />
        <h3>
          My Balance: <span>{myBalance} lamports</span>
        </h3>
        <h3>
          Recipient Balance: <span>{rxBalance} lamports</span>
        </h3>
        <hr />
        {txid ? (
          <p>
            Transaction id: <span style={{ fontSize: "0.7em" }}>{txid}</span>
          </p>
        ) : null}
        {slot ? (
          <h3>
            Confirmation slot: <span>{slot}</span>
          </h3>
        ) : null}
      </form>
    </div>
  );
};

export default TransferSol;
