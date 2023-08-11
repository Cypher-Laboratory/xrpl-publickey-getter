// IMPORTANT LINK : https://github.com/XRPLF/xrpl-dev-portal/blob/master/content/_code-samples/address_encoding/js/encode_address.js
// IMPORTANT LINK : https://xrpl.org/accounts.html#addresses

import { Client, AccountTxTransaction, deriveXAddress } from "xrpl";
import assert from 'assert';
import crypto from 'crypto';
const R_B58_DICT = 'rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz';
import baseX from 'base-x';
import { promises } from "dns";
const base58 = baseX(R_B58_DICT);

// get the lastest Tx from an address
// return AccountTxTransaction[], an array of object representing a Tx
async function getLatestTx(address: string): Promise<AccountTxTransaction[]> {

    // Define the network client
    const client = new Client("wss://s.altnet.rippletest.net:51233/")
    await client.connect();

    const response = await client.request(
        {
            "command": "account_tx",
            "account": address,
            "binary": false,
            "limit": 2,
            "forward": false
        }
    )

    await client.disconnect();
    return response.result.transactions;

}

function getPubkeyFromLatestTx( latestTx : AccountTxTransaction[]):string{
    
    //check if the Account in the .tx is the address derived from the pubkey
    for(let i=0; i<latestTx.length; i++){
        
        if(getAddressFromPubkey(latestTx[i]?.tx?.SigningPubKey ?? "0x") === latestTx[i].tx?.Account){
            return latestTx[i]?.tx?.SigningPubKey ?? "0x"; 
        }
    }
    return("0x")

}

function getAddressFromPubkey(pubkey_hex: string):string {
    const pubkey = Buffer.from(pubkey_hex, 'hex');
    assert(pubkey.length == 33);

    // Calculate the RIPEMD160 hash of the SHA-256 hash of the public key
    //   This is the "Account ID"
    const pubkey_inner_hash = crypto.createHash('sha256').update(pubkey);
    const pubkey_outer_hash = crypto.createHash('ripemd160');
    pubkey_outer_hash.update(pubkey_inner_hash.digest());
    const account_id = pubkey_outer_hash.digest();

    // Prefix the Account ID with the type prefix for an XRPL Classic Address, then
    //   calculate a checksum as the first 4 bytes of the SHA-256 of the SHA-256
    //   of the Account ID
    const address_type_prefix = Buffer.from([0x00]);
    const payload = Buffer.concat([address_type_prefix, account_id]);
    const chksum_hash1 = crypto.createHash('sha256').update(payload).digest();
    const chksum_hash2 = crypto.createHash('sha256').update(chksum_hash1).digest();
    const checksum = chksum_hash2.slice(0, 4);

    // Concatenate the address type prefix, the payload, and the checksum.
    // Base-58 encode the encoded value to get the address.
    const dataToEncode = Buffer.concat([payload, checksum]);
    const address = base58.encode(dataToEncode);
    return address; 
}

//getAddressFromPubkey("EDF34B2C5A199A5D86FAAEF992E018DE8E1502780E26E6EAD083E306A6E7393825"); 

async function getPubKeyFromAddress(address : string) : Promise<string>{
    const latestTx = await getLatestTx(address); 
    const pubkey = getPubkeyFromLatestTx(latestTx);
    console.log(pubkey); 
    return pubkey; 
}

getPubKeyFromAddress("rJuGxtNrgy6MDwD7cAJBkwyzceJ31YytCG"); 
