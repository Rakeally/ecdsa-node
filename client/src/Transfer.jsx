import { useState } from "react";
import server from "./server";
import {secp256k1} from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);
  const hashMsg = hash => keccak256(Uint8Array.from(hash));
  const trxSignature = message => secp256k1.sign(hashMsg(message), privateKey);

  async function transfer(evt) {
    evt.preventDefault();

    try {    
      const message = { amount: parseInt(sendAmount), recipient };
      const sign = trxSignature(message, privateKey);

      const sender = sign.recoverPublicKey(hashMsg(message)).toHex();

      const {
        data: {balance},
      } = await server.post(`send`, {
        signature: sign.toCompactHex(),
        sender,
        message
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
