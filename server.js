const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Replace with your token's actual contract address
const tokenAddress = "0x58975e551370D0BccfEa3b4e092084CB89504d84";
const requiredBalance = ethers.parseUnits("1000000", 18); // Adjust token amount/decimals if needed

const abi = [
  "function balanceOf(address) view returns (uint256)",
];

const provider = new ethers.JsonRpcProvider("https://api.avax.network/ext/bc/C/rpc"); // Or Alchemy/RPC

app.post("/verify", async (req, res) => {
  const { address, message, signature } = req.body;

  try {
    // Recover signer from message
    const recovered = ethers.verifyMessage(message, signature);
    if (recovered.toLowerCase() !== address.toLowerCase()) {
      return res.json({ success: false, error: "Signature does not match wallet address." });
    }

    // Query token balance
    const tokenContract = new ethers.Contract(tokenAddress, abi, provider);
    const balance = await tokenContract.balanceOf(address);

    if (balance >= requiredBalance) {
      return res.json({ success: true });
    } else {
      return res.json({ success: false, error: "Insufficient token balance." });
    }
  } catch (err) {
    console.error("Verification failed:", err);
    return res.json({ success: false, error: "Error verifying wallet." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.send("Server is running. Try POSTing to /verify");
});
