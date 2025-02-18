const functions = require("@google-cloud/functions-framework");
const { TwitterApi } = require("twitter-api-v2");
const axios = require("axios");
const { Storage } = require("@google-cloud/storage");

// Initialize Cloud Storage
const storage = new Storage();
const bucketName = "tokenid-xyxyx"; // Replace with your bucket name
const tokenIdFile = "tokenId.json"; // File to store the tokenId
const contractAddressFile = "contractAddress.json"; // File to store the contract address

// Twitter API credentials
const twitterClient = new TwitterApi({
  appKey: "your_app_key",
  appSecret: "your_app_secret",
  accessToken: "your_access_token",
  accessSecret: "your_access_secret",
});

// Function to fetch and increment the tokenId from Google Cloud Storage
async function getNextTokenId() {
  const file = storage.bucket(bucketName).file(tokenIdFile);
  let tokenId = 1; // Default starting tokenId

  try {
    const [content] = await file.download();
    const data = JSON.parse(content.toString());
    tokenId = data.tokenId + 1; // Increment tokenId
  } catch (err) {
    if (err.code !== 404) {
      // If the error isn't "file not found", rethrow it
      throw err;
    }
  }

  // Save the updated tokenId back to the file
  await file.save(JSON.stringify({ tokenId }), {
    contentType: "application/json",
  });

  return tokenId;
}

async function getContractAddress() {
  const file = storage.bucket(bucketName).file(contractAddressFile);

  try {
    const [content] = await file.download();
    const data = JSON.parse(content.toString());
    return data.contractAddress;
  } catch (err) {
    if (err.code === 404) {
      // No address stored yet
      return null;
    }
    // If it's another error, rethrow
    throw err;
  }
}

/**
 * Saves the contractAddress to GCS for later retrieval.
 */
async function saveContractAddress(address) {
  const file = storage.bucket(bucketName).file(contractAddressFile);

  await file.save(JSON.stringify({ contractAddress: address }), {
    contentType: "application/json",
  });
}

// Function to execute API request and send a tweet
async function executeAndTweet() {
  try {
    // Set formatted time
    const currentDate = new Date();
    const formattedTime =
      currentDate.toLocaleString("en-US", {
        timeZone: "UTC",
        hour12: true,
      }) + " (UTC)";

    // Fetch the next tokenId
    const tokenId = await getNextTokenId();
    let contractAddress = await getContractAddress();

    if (tokenId === 1) {
      const deployPayload = {
        name: "xtbpoc",
        ticker: "XTBPOC",
        supply: 0, // set 0 for unlimited supply
        mintPrice: 0, // set 0 for free minting
        walletPrivateKey: "your_wallet_private_key",
        onlyOwnerMint: true,
      };

      const deployResponse = await axios.post(
        "http://api.xyxyx.pro/api/v1/ERC721F/arbitrum/deploy-contract",
        deployPayload,
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      const { deploymentAddress } = deployResponse.data;

      // Store the new contract address in GCS for future calls
      await saveContractAddress(deploymentAddress);
      contractAddress = deploymentAddress;
    }

    // Prepare the POST request body
    const requestBody = {
      contractAddress: contractAddress,
      tokenId: tokenId,
      tokenText: `${formattedTime}`,
      walletPrivateKey: "your_wallet_private_key",
      showTrademark: true,
      metadata: `${formattedTime}`,
      mintCost: 0,
      background: "#FFFFFF",
      textColor: "#000000",
      borderRadius: "8px",
    };

    // Execute API request
    const response = await axios.post(
      "https://api.xyxyx.pro/api/v1/ERC721F/arbitrum/mint-token-1x1",
      requestBody,
      {
        headers: { "Content-Type": "application/json" },
      },
    );

    if (tokenId) {
      // Prepare the tweet content
      const tweetContent = `${formattedTime}\nhttps://opensea.io/item/arbitrum/${contractAddress}/${tokenId}`;

      // Send the tweet
      await twitterClient.v2.tweet(tweetContent);
    } else {
      console.error("API request failed with status:", response.status);
    }
  } catch (error) {
    console.error("Error during API request:", error.message);
    throw new Error("Execution failed");
  }
}

// Define the Google Cloud Function
functions.http("executeAndTweet", async (req, res) => {
  try {
    await executeAndTweet();
    res.status(200).send("Token mint and Tweet finished successfully");
  } catch (error) {
    res.status(500).send("Error: " + error.message);
  }
});
