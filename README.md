# Soldrop

[Soldrop](https://soldrop.xyz) lets you airdrop SPL tokens to multiple addresses with a single click

## Deployments

- Mainnet @ https://soldrop.xyz
- Devnet @ https://devnet.soldrop.xyz
- Testnet @ https://testnet.soldrop.xyz

## How to use

- Connect your Phantom Wallet using "Connect Wallet" button in the header.
- Select the SPL token you want to airdrop from the token list.
- Add the addresses in the Accounts Table with the amount you wish to transfer(with decimals if any). You can also import a CSV file with a list of addresses and amounts separated by [comma]. For example,
  ```csv
  Addresses,Amount
  Gpeqds8Nmw1JUDAYgMD7pHg1QvkTr8oyPbzH89B9Heom, 0.001
  54dZTfUJsieARGDsu6ZXei6K2S2kFpUNLZ93mwoCtGti, 0.5
  ```
- Click on "Airdrop Tokens".
- A popup will open asking you to download the temporary KeyPair generated for signing all the transactions so you won't have to.

  Please download the KeyPair file and save it somewhere safe. You will need this KeyPair to be able to withdraw your funds if something goes wrong. Read more [here](#how-it-works)
- Sign the transaction from Phantom wallet to send all the required tokens in the temporary account.
- Sit back and wait till all the transactions are completed.
- Save the Result.json file for report.

> Demo video coming soon...

## How it works

### Overview

After you submit the transaction, all the tokens gets transferred to a temporary account. 

Then the program fetches the token accounts corresponding to the addresses in the table.

Now the token transfer starts with a batch of 10 addresses/transactions at a time. 

The temporary account signs all the transactions.
### Transaction Signatures

When you try to submit the transaction, a temporary account is created for you. This temporary account is used to sign all the transactions for each of the drop so that you won't have to do it again and again.

You just have to sign 1 transaction which transfers all the required tokens to the temporary account.

The temporary account never leaves your browser and you have complete control of it. Just make sure to save the KeyPair file which contains the private key using which you can access the temporary account anytime.

### Account Fallback

The account you enter in the accounts table does not have to be the token account. You can also enter the user's wallet address and the app will drop the tokens in the 1st SPL account belonging to that wallet.

If no SPL token account exist for the wallet, a new [Associated Token Account](https://spl.solana.com/associated-token-account) is created and the tokens are deposited into that account.

## FAQs

<details>
  <summary>Are my tokens safe?</summary>

  Yes you are in control of your tokens at all time. A temporary account created which contains all the tokens to be dropped. You just have to download the KeyPair before signing the transaction.

  You can withdraw your tokens any time from the temporary account. This temporary account creation is necessary so that you won't have to sign the transaction for every airdrop.
  
</details>

<details>
  <summary>How many airdrops can I do at a time?</summary>

  Ideally, you should be able to airdrop to thousands of addresses at the same time. But since the app is still in BETA, we would encourage you to try to batch the airdrops to somewhere between 100-500.

</details>

<details>
  <summary>How much do I have to pay for using Soldrop?</summary>

  Soldrop is completely free to use. We don't charge a single SOL for using the service. You just have to have sufficient token balance for airdrops.

  You also need to have enough SOL in your signer account. This will be used to sign all the transactions, and creation of possible token accounts for the users(if they don't have one).

  Having said that, if you like our product and found it useful, we would really appreciate your donation to keep adding new features to Soldrop.

  Our SOL account address is `Gpeqds8Nmw1JUDAYgMD7pHg1QvkTr8oyPbzH89B9Heom`

</details>

<details>
  <summary>Can I airdrop NFTs with Soldrop?</summary>

  Just like you, we also are a fan of NFTs and really enjoy sharing those cute JPEGs. But as of now, you cannot send NFTs using Soldrop 😿.

  We are working on the best way to add that feature to Soldrop. NFTs will soon be supported.
</details>

<details>
  <summary>How can I reach out?</summary>

  You can drop us a DM on twitter or you can e-mail your query at [contact@soldrop.xyz](https://mail.google.com/mail/u/0/?to=contact@soldrop.xyz&tf=cm)

</details>

## Credits

🧑‍💻 Code: [@HritiqueRungta](https://twitter.com/HritiqueRungta)

🎨 Design: [@PratyushRungta](https://twitter.com/PratyushRungta)