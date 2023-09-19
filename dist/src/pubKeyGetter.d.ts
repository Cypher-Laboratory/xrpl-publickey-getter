import { AccountTxTransaction } from "xrpl";
export interface Account {
  address: string;
  publicKey: [bigint, bigint];
  curve: string;
}
export declare function getPubKeysFromAddresses(
  addresses: string[],
): Promise<Account[]>;
/**
 * Get the latest transaction from an address
 *
 * @param address - The address to get the latest transaction from
 * @returns A promise which resolves to an array of AccountTxTransaction objects
 */
export declare function getLatestTx(
  address: string,
): Promise<AccountTxTransaction[]>;
/**
 * Get the pubkey from the latest transaction
 * https://xrpl.org/tx.html#tx
 *
 * @param latestTx - The latest transaction from an address
 * @returns The signing pubkey from the latest transaction
 */
export declare function getSigningPubkeyFromLatestTx(
  latestTx: AccountTxTransaction[],
): string;
/**
 * Get the XRPL address from the xPubkey
 *
 * @param pubkeyHex - The pubkey to get the XRPL address from
 * @returns The XRPL address (base58 encoded)
 */
export declare function getAddressFromSigningPubkey(pubkeyHex: string): string;
