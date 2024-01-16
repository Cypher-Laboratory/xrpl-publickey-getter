import { Curve } from "./utils/curves";
/**
 * Get the addresses from the XRPL ledger where balance >= amountMin
 *
 * @param amountMin - The minimum amount of XRP tokens owned by each address (in the smallest unit of XRP)
 * @param listLength - The number of addresses to return
 *
 * @returns {Promise<string[]>} The addresses from the XRPL ledger where balance >= amountMin
 */
export declare function getAddresses(amountMin: bigint, listLength: number, curve: Curve): Promise<string[]>;
