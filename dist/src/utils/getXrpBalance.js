"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getXrpBalance = void 0;
const xrpl_1 = require("xrpl");
const const_1 = require("../const");
async function getXrpBalance(address) {
  // Define the network client
  const client = new xrpl_1.Client(const_1.xrplWssUrl);
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
exports.getXrpBalance = getXrpBalance;
