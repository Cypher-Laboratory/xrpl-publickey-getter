// IMPORTANT LINK : https://github.com/XRPLF/xrpl-dev-portal/blob/master/content/_code-samples/address_encoding/js/encode_address.js
// IMPORTANT LINK : https://xrpl.org/accounts.html#addresses

import { Client, AccountTxTransaction } from "xrpl";
import assert from "assert";
import crypto from "crypto";
const R_B58_DICT = "rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz";
import baseX from "base-x";
import { ec } from "elliptic";

const base58 = baseX(R_B58_DICT);
const secp256k1 = new ec("secp256k1");
const ed25519 = new ec("ed25519");

export interface Account {
  address: string;
  publicKey: [bigint, bigint];
}

export async function getPubKeysFromAddresses(
  addresses: string[],
): Promise<Account[]> {
  // get the xPubKeys from the addresses
  const xPubKeys = await Promise.all(
    addresses.map(async (address) => {
      const latestTx = await getLatestTx(address);
      const xPubkey = getXPubkeyFromLatestTx(latestTx);
      return xPubkey;
    }),
  );

  // get the Y values from the xPubKeys
  const yValues: bigint[] = getYPubKeys(xPubKeys);

  return addresses.map((address, index) => {
    return {
      address,
      publicKey: [BigInt("0x" + xPubKeys[index]), yValues[index]],
    };
  });
}

/**
 * Get the latest transaction from an address
 *
 * @param address - The address to get the latest transaction from
 * @returns A promise which resolves to an array of AccountTxTransaction objects
 */
export async function getLatestTx(
  address: string,
): Promise<AccountTxTransaction[]> {
  // Define the network client
  const client = new Client("wss://s.altnet.rippletest.net:51233/");
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

/**
 * Get the pubkey from the latest transaction
 *
 * @param latestTx - The latest transaction from an address
 * @returns The pubkey from the latest transaction
 */
export function getXPubkeyFromLatestTx(
  latestTx: AccountTxTransaction[],
): string {
  for (let i = 0; i < latestTx.length; i++) {
    //check if the Account in the .tx is the address derived from the pubkey
    if (
      getAddressFromXPubkey(latestTx[i]?.tx?.SigningPubKey ?? "0x") ===
      latestTx[i].tx?.Account
    ) {
      return latestTx[i]?.tx?.SigningPubKey ?? "0x";
    }
  }

  return "0x";
}

/**
 * Get the XRPL address from the xPubkey
 *
 * @param pubkeyHex - The pubkey to get the XRPL address from
 * @returns The XRPL address (base58 encoded)
 */
export function getAddressFromXPubkey(pubkeyHex: string): string {
  const pubkey = Buffer.from(pubkeyHex, "hex");
  assert(pubkey.length == 33);
  // Calculate the RIPEMD160 hash of the SHA-256 hash of the public key
  //   This is the "Account ID"
  const pubkey_inner_hash = crypto.createHash("sha256").update(pubkey);
  const pubkey_outer_hash = crypto.createHash("ripemd160");
  pubkey_outer_hash.update(pubkey_inner_hash.digest());
  const account_id = pubkey_outer_hash.digest();
  // Prefix the Account ID with the type prefix for an XRPL Classic Address, then
  //   calculate a checksum as the first 4 bytes of the SHA-256 of the SHA-256
  //   of the Account ID
  const address_type_prefix = Buffer.from([0x00]);
  const payload = Buffer.concat([address_type_prefix, account_id]);
  const chksum_hash1 = crypto.createHash("sha256").update(payload).digest();
  const chksum_hash2 = crypto
    .createHash("sha256")
    .update(chksum_hash1)
    .digest();
  const checksum = chksum_hash2.slice(0, 4);
  // Concatenate the address type prefix, the payload, and the checksum.
  // Base-58 encode the encoded value to get the address.
  const dataToEncode = Buffer.concat([payload, checksum]);
  const address = base58.encode(dataToEncode);
  return address;
}

/**
 * Get the corresponding Y values from the xPubKeys for the secp256k1 curve
 *
 * @param xPubKeys - The xPubKeys to get the Y values from
 * @returns The Y values from the xPubKeys
 */
function getYPubKeys(xPubKeys: string[]): bigint[] {
  console.log(`"getYPubKeys" Function not implemented.`);
  return xPubKeys.map((xPubKey) => {
    console.log(xPubKey);
    //check on wich curve we are
    if (xPubKey.startsWith("ED")) {
      //delete the ED prefix
      //compute on ed255919
      try {
        // Use the `curve.pointFromX()` method to retrieve the point on the curve
        const point = ed25519.curve.pointFromX(xPubKey.slice(2));
        // Access the y-coordinate from the retrieved point
        const yValue = point.getY().toString();
        return BigInt(yValue);
      } catch (error) {
        console.error("Invalid x-coordinate value:", error);
      }
    } else {
      //compute on secp256k1
      try {
        // Use the `curve.pointFromX()` method to retrieve the point on the curve
        const point = secp256k1.curve.pointFromX(xPubKey);
        // Access the y-coordinate from the retrieved point
        const yValue = point.getY().toString();
        return BigInt(yValue);
      } catch (error) {
        console.error("Invalid x-coordinate value:", error);
      }
    }
    return 0n;
  });
}
