
# Xyxyx Tokenization Boilerplate (XTB)

## Overview
Xyxyx Tokenization Boilerplate (XTB) is a text-based tokenization boilerplate designed to run on the Xyxyx API.

XTB is a script that streamlines the process of minting a text-based token arbitraged by a # system via the Xyxyx API and a `#` system‘s ERC-721F contract incorporated for the task — where `#` is any existing system.

By default, this script is designed to run as a Google Cloud Function and be triggered periodically using Google Cloud Scheduler. However, Google Cloud is only a suggested option — users can adapt the script to run on other automation tools like AWS Lambda, Azure Functions, or a custom cron job.

Additionally, this script is designed to run with the X (Formerly Twitter) API as the default # system. However, the boilerplate can be integrated with any other API as a # system. X API is used as an example of a Proof of Concept (POC) of the Xyxyx API.

For an in-depth overview of XTB and the POC execution, read our blog post [Introducing Xyxyx Tokenization Boilerplate (XTB)](https://mirror.xyz/0xB42dD0878219c3fC356ABe8F7c0800b80147B7a1/kOIjUA-ka7apI-Z0X5eX7_Qv2-9z0qT-pXqZybAe8GU)

## Features
- Fetches the next available `tokenId` from Google Cloud Storage.
- Deploy an ERC-721F contract if no contract address is found.
- Mints a token on the Xyxyx API.
- Tweets the token content using the Twitter API.
- Stores and retrieves token and contract details from Google Cloud Storage.
- Designed to be executed via a scheduled trigger.

## Requirements
To use this script, you must provide API credentials for the following services:

### Xyxyx API
- Required to mint tokens and interact with the ERC-721F smart contract.
- Users must provide the private key of their ETH address that holds the Xyxyx API Key(s) and/or XIN(s).

### Twitter API
- Used to tweet the minted token details.
- Requires Twitter API credentials (App Key, App Secret, Access Token, and Access Secret).

Please note that the Twitter API is only a suggested data source for retrieving text data to be tokenized on-chain. Developers can modify the script to use any other API or custom integration.

## Environment Setup
1. Install dependencies:
   ```sh
   npm install @google-cloud/functions-framework twitter-api-v2 axios @google-cloud/storage
   ```

2. Set up Google Cloud Storage:
   - Create a bucket (or use an existing one).
   - Store `tokenId.json` and `contractAddress.json` files in the bucket for tracking token IDs and contract deployment details.

3. Configure API credentials:
   - Replace placeholder API keys and secrets in the script.

## Running the Script Locally
To test the function locally:
```sh
npx functions-framework --target=executeAndTweet
```

## Deploying on Google Cloud Functions
1. Authenticate Google Cloud CLI:
   ```sh
   gcloud auth login
   gcloud config set project [PROJECT_ID]
   ```
2. Deploy the function:
   ```sh
   gcloud functions deploy executeAndTweet \
     --runtime nodejs18 \
     --trigger-http \
     --allow-unauthenticated
   ```
3. Set up Google Cloud Scheduler to trigger the function periodically:
   ```sh
   gcloud scheduler jobs create http my-scheduled-job \
     --schedule "0 * * * *" \
     --uri [FUNCTION_URL] \
     --http-method=POST
   ```

## Alternative Deployment Options
Instead of using Google Cloud, you can adapt this script for:
- **AWS Lambda:** Modify the function to use AWS S3 and API Gateway.
- **Azure Functions:** Use Azure Blob Storage instead of Google Cloud Storage.
- **Cron Jobs on a VPS:** Schedule execution with `cron` or a task scheduler.

## Customization
- **Switching to a different API:** Replace the Twitter API section with another API integration.
- **Using a different storage service:** Replace Google Cloud Storage with AWS S3, Azure Blob, or another storage provider.

## License
This project is provided as-is, with no warranty. Modify and use at your own risk.
