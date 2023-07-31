const express = require("express");
const { secp256k1 } = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "033edb72df630ba323b59372066fea4907ab12ce980af206df421264e6563b2151": 100,
  "03074c456b3e1c45d5bb4323117837007f09887c28ddb9da5e8f3fab6ecbe7b0a7": 50,
  "034dc9ed90f640d0126297f6f2196a23901ca7806860fd07feac9febdd9f0176f9": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { signature, sender , message } = req.body;
  const {recipient, amount} = message

  const isSigned = secp256k1.verify(signature,  keccak256(Uint8Array.from(message)), sender);

  if (isSigned === false) {
    res.status(400).send({ message: "Wrong Signature!" });
  }

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
