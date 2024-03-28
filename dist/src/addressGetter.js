"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAddresses = void 0;
/* eslint-disable indent */
const xrpl_1 = require("xrpl");
const const_1 = require("./const");
const pubKeyGetter_1 = require("./pubKeyGetter");
const getXrpBalance_1 = require("./utils/getXrpBalance");
const curves_1 = require("./utils/curves");
/**
 * Get the addresses from the XRPL ledger where balance >= amountMin
 *
 * @param amountMin - The minimum amount of XRP tokens owned by each address (in the smallest unit of XRP)
 * @param listLength - The number of addresses to return
 *
 * @returns {Promise<string[]>} The addresses from the XRPL ledger where balance >= amountMin
 */
async function getAddresses(amountMin, listLength, curve) {
  let txs = await getTxHistory();
  let accounts = txs.map((tx) => {
    return {
      address: tx.Account,
      pubKey: tx.SigningPubKey,
    };
  });
  let validAddresses = [];
  while (validAddresses.length < listLength) {
    const newAddresses = [];
    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];
      if (await isSender(account)) {
        let balance;
        switch (curve) {
          case curves_1.Curve.SECP256k1:
            if (
              !account.pubKey.startsWith("02") &&
              !account.pubKey.startsWith("03")
            )
              break;
            balance = await (0, getXrpBalance_1.getXrpBalance)(account.address);
            if (balance >= amountMin) {
              newAddresses.push(account.address);
            }
            break;
          case curves_1.Curve.ED25519:
            if (!account.pubKey.startsWith("ED")) break;
            balance = await (0, getXrpBalance_1.getXrpBalance)(account.address);
            if (balance >= amountMin) {
              newAddresses.push(account.address);
            }
            break;
          case curves_1.Curve.ALL:
            balance = await (0, getXrpBalance_1.getXrpBalance)(account.address);
            if (balance >= amountMin) {
              newAddresses.push(account.address);
            }
            break;
          default:
            throw new Error("unsupported curve");
        }
      }
    }
    // remove undefined values
    const newAddressesFiltered = newAddresses.filter(
      (address) => address !== undefined,
    );
    // add new addresses to valid addresses
    validAddresses.push(...newAddressesFiltered);
    // remove duplicates
    validAddresses = [...new Set(validAddresses)];
    txs = await getTxHistory();
    accounts = txs.map((tx) => {
      return {
        address: tx.Account,
        pubKey: tx.SigningPubKey,
      };
    });
  }
  return validAddresses.slice(0, listLength);
}
exports.getAddresses = getAddresses;
/**
 * Get the last transactions from the XRPL ledger
 *
 * @returns {Promise<XrplTx[]>} The last transactions from the XRPL ledger
 */
async function getTxHistory() {
  // Define the network client
  const client = new xrpl_1.Client(const_1.xrplWssUrl);
  await client.connect();
  let data;
  try {
    data = await client.request({
      id: 5,
      /* !!! deprecated endpoint. It can be removed at anytime without notice !!! */
      command: "tx_history",
      start: 0,
    });
  } catch (e) {
    throw new Error("failed to get tx history: " + e);
  }
  await client.disconnect();
  // if data.result contains the 'txs' key, return the txs
  if (data.result.txs) {
    return data.result.txs;
  } else {
    throw new Error("failed to get tx history");
  }
}
async function isSender(account) {
  return (
    (0, pubKeyGetter_1.getAddressFromSigningPubkey)(account.pubKey) ===
    account.address
  );
}
