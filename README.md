# XRPL-pubKey-getter

Public Key Retrieval for XRPL Accounts
This repository provides functionality to retrieve the public key from XRPL (XRP Ledger) addresses that meet specific characteristics.
The purpose is to identify accounts that satisfy certain criteria, such as holding a specific amount of XRP or having a specific trustline established. To use them in a ring-signature scheme.

## How it Works

The code in this repository utilizes XRPL APIs and libraries to interact with the XRP Ledger and retrieve the public key of XRPL accounts. By specifying the desired characteristics, such as the amount of XRP or a particular trustline, the code scans the XRPL ledger to identify accounts that meet these criteria.

## Usage

```typescript
import { Currencies } from "./currencies";
import {
  Account,
  getAddresses,
  getPubKeysFromAddresses,
  Curve,
} from "@cypherlab/xrpl-publicKey-getter/dist/src";

/**
 * Get some addresses and their public key from the XRPL ledger where balance >= balanceMin
 *
 * @param balanceMin - The minimum amount of tokens owned by each address (in the smallest unit of XRP)
 * @param datasetSize - The number of addresses to return
 * @param currency - The currency to retrieve data for
 *
 * @returns {Promise<Account>} datasetSize addresses and their public key from the XRPL ledger where balance >= balanceMin
 */
async function getAccounts(
  balanceMin: bigint,
  datasetSize: number,
  currency = Currencies.XRP,
  curve = Curve.ALL,
): Promise<Account[]> {
  if (currency !== Currencies.XRP) {
    throw new Error("Only XRP is supported for now");
  }

  const addresses: string[] = await getAddresses(
    balanceMin,
    datasetSize,
    curve,
  );

  return await getPubKeysFromAddresses(addresses);
}
```
