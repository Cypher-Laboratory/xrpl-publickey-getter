"use strict";
// IMPORTANT LINK : https://github.com/XRPLF/xrpl-dev-portal/blob/master/content/_code-samples/address_encoding/js/encode_address.js
// IMPORTANT LINK : https://xrpl.org/accounts.html#addresses
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAddressFromXPubkey =
  exports.getXPubkeyFromLatestTx =
  exports.getLatestTx =
  exports.getPubKeysFromAddresses =
    void 0;
const xrpl_1 = require("xrpl");
const assert = require("assert");
const R_B58_DICT = "rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz";
const baseX = require("base-x");
const elliptic_1 = require("elliptic");
const const_1 = require("./const");
const node_crypto_1 = require("node:crypto");
const base58 = baseX(R_B58_DICT);
const secp256k1 = new elliptic_1.ec("secp256k1");
const ed25519 = new elliptic_1.ec("ed25519");
async function getPubKeysFromAddresses(addresses) {
  // get the xPubKeys from the addresses
  const xPubKeys = await Promise.all(
    addresses.map(async (address) => {
      const latestTx = await getLatestTx(address);
      const xPubkey = getXPubkeyFromLatestTx(latestTx);
      return xPubkey;
    }),
  );
  // get the Y values from the xPubKeys
  const yValues = getYPubKeys(xPubKeys);
  return addresses.map((address, index) => {
    return {
      address,
      publicKey: [BigInt("0x" + xPubKeys[index]), yValues[index][0]],
      curve: yValues[index][1],
    };
  });
}
exports.getPubKeysFromAddresses = getPubKeysFromAddresses;
/**
 * Get the latest transaction from an address
 *
 * @param address - The address to get the latest transaction from
 * @returns A promise which resolves to an array of AccountTxTransaction objects
 */
async function getLatestTx(address) {
  // Define the network client
  const client = new xrpl_1.Client(const_1.xrplWssUrl);
  await client.connect();
  const response = await client.request({
    command: "account_tx",
    account: address,
    binary: false,
    limit: 2,
    forward: false,
  });
  await client.disconnect();
  return response.result.transactions;
}
exports.getLatestTx = getLatestTx;
/**
 * Get the pubkey from the latest transaction
 *
 * @param latestTx - The latest transaction from an address
 * @returns The pubkey from the latest transaction
 */
function getXPubkeyFromLatestTx(latestTx) {
  for (let i = 0; i < latestTx.length; i++) {
    // Check if the Account in the .tx is the address derived from the pubkey
    const signingPubKey = latestTx[i]?.tx?.SigningPubKey ?? "0x";
    if (getAddressFromXPubkey(signingPubKey) === latestTx[i].tx?.Account) {
      return signingPubKey;
    }
  }
  throw new Error("No valid pubkey found in the latest transactions");
}
exports.getXPubkeyFromLatestTx = getXPubkeyFromLatestTx;
/**
 * Get the XRPL address from the xPubkey
 *
 * @param pubkeyHex - The pubkey to get the XRPL address from
 * @returns The XRPL address (base58 encoded)
 */
function getAddressFromXPubkey(pubkeyHex) {
  const pubkey = Buffer.from(pubkeyHex, "hex");
  assert(pubkey.length == 33);
  // Calculate the RIPEMD160 hash of the SHA-256 hash of the public key
  //   This is the "Account ID"
  const pubkey_inner_hash = (0, node_crypto_1.createHash)("sha256").update(
    pubkey,
  );
  const pubkey_outer_hash = (0, node_crypto_1.createHash)("ripemd160");
  pubkey_outer_hash.update(pubkey_inner_hash.digest());
  const account_id = pubkey_outer_hash.digest();
  // Prefix the Account ID with the type prefix for an XRPL Classic Address, then
  //   calculate a checksum as the first 4 bytes of the SHA-256 of the SHA-256
  //   of the Account ID
  const address_type_prefix = Buffer.from([0x00]);
  const payload = Buffer.concat([address_type_prefix, account_id]);
  const chksum_hash1 = (0, node_crypto_1.createHash)("sha256")
    .update(payload)
    .digest();
  const chksum_hash2 = (0, node_crypto_1.createHash)("sha256")
    .update(chksum_hash1)
    .digest();
  const checksum = chksum_hash2.slice(0, 4);
  // Concatenate the address type prefix, the payload, and the checksum.
  // Base-58 encode the encoded value to get the address.
  const dataToEncode = Buffer.concat([payload, checksum]);
  const address = base58.encode(dataToEncode);
  return address;
}
exports.getAddressFromXPubkey = getAddressFromXPubkey;
/**
 * Get the corresponding Y values from the xPubKeys for the SECP256k1 curve
 *
 * @param xPubKeys - The xPubKeys to get the Y values from
 *
 * @returns The Y values from the xPubKeys
 */
function getYPubKeys(xPubKeys) {
  return xPubKeys.map((xPubKey) => {
    // Check which curve we are on
    if (xPubKey.startsWith("ED")) {
      // Compute on ed25519
      try {
        // Use the `curve.pointFromX()` method to retrieve the point on the curve
        // Get ride of the ED prefix indicating that the curve is on ed25519
        const point = ed25519.curve.pointFromX(xPubKey.slice(2));
        // Access the y-coordinate from the retrieved point
        const yValue = point.getY().toString();
        return [BigInt(yValue), "ed25519"];
      } catch (error) {
        throw new Error("Invalid x-coordinate value: " + error);
      }
    } else {
      // Compute on secp256k1
      try {
        // Use the `curve.pointFromX()` method to retrieve the point on the curve
        // Get ride of the prefix (02/03) that indicate if y coordinate is odd or not
        // see xrpl doc here : https://xrpl.org/cryptographic-keys.html
        const point = secp256k1.curve.pointFromX(xPubKey.slice(2));
        // Access the y-coordinate from the retrieved point
        const yValue = point.getY().toString();
        return [BigInt(yValue), "secp256k1"];
      } catch (error) {
        throw new Error("Invalid x-coordinate value: " + error);
      }
    }
  });
}
