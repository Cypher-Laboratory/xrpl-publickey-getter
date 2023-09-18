import { Client } from "xrpl";
import { XrplTx } from "./interfaces/xrplTx";
import { xrplWssUrl } from "./const";
import { getAddressFromSigningPubkey } from "./pubKeyGetter";
import { getXrpBalance } from "./utils/getXrpBalance";
import { XrplAccount } from "./interfaces/xrplAccount";

/**
 * Get the addresses from the XRPL ledger where balance >= amountMin
 *
 * @param amountMin - The minimum amount of XRP tokens owned by each address (in the smallest unit of XRP)
 * @param listLength - The number of addresses to return
 *
 * @returns {Promise<string[]>} The addresses from the XRPL ledger where balance >= amountMin
 */
export async function getAddresses(
  amountMin: bigint,
  listLength: number,
): Promise<string[]> {
  let txs = await getTxHistory();
  let accounts = txs.map((tx) => {
    return {
      address: tx.Account,
      pubKey: tx.SigningPubKey,
    };
  });

  let validAddresses: string[] = [];

  while (validAddresses.length < listLength) {
    const newAddresses: string[] = [];
    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];
      if (await isSender(account)) {
        const balance = await getXrpBalance(account.address);
        if (balance >= amountMin) {
          newAddresses.push(account.address);
        }
      }
    }
    // remove undefined values
    const newAddressesFiltered = newAddresses.filter(
      (address) => address !== undefined,
    ) as unknown as string[];
    // add new addresses to valid addresses
    validAddresses.push(...newAddressesFiltered);
    // remove duplicates
    validAddresses = [...new Set(validAddresses)];
    txs = await getTxHistory();
    accounts = txs.map((tx) => {
      return {
        address: tx.Account,
        pubKey: tx.SigningPubKey,
      } as XrplAccount;
    });
  }
  return validAddresses.slice(0, listLength);
}

/**
 * Get the last transactions from the XRPL ledger
 *
 * @returns {Promise<XrplTx[]>} The last transactions from the XRPL ledger
 */
async function getTxHistory(): Promise<XrplTx[]> {
  // Define the network client
  const client = new Client(xrplWssUrl);
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
  if ((data.result as { index: number; txs: XrplTx[] }).txs) {
    return (data.result as { index: number; txs: XrplTx[] }).txs;
  } else {
    throw new Error("failed to get tx history");
  }
}

async function isSender(account: XrplAccount): Promise<boolean> {
  return getAddressFromSigningPubkey(account.pubKey) === account.address;
}
