import { Client } from "xrpl";
import { xrplWssUrl } from "../const";

export async function getXrpBalance(address: string): Promise<bigint> {
  // Define the network client
  const client = new Client(xrplWssUrl);
  await client.connect();

  // Get the balance of the address
  const response = await client.request({
    command: "account_info",
    account: address,
    ledger_index: "validated",
  });
  await client.disconnect();
  return BigInt(response.result.account_data.Balance);
}
