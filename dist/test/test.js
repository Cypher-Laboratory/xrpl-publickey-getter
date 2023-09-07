"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pubKeyGetter_1 = require("../src/pubKeyGetter");
const addressGetter_1 = require("../src/addressGetter");
//address on ed25519 : rJuGxtNrgy6MDwD7cAJBkwyzceJ31YytCG
//address on secp256k1 : rH7NWezPqw5xmguR27C847ZjSmtHnLkt2B
const addresses = [
  "rJuGxtNrgy6MDwD7cAJBkwyzceJ31YytCG",
  "rH7NWezPqw5xmguR27C847ZjSmtHnLkt2B", // address on secp256k1
];
(async () => {
  // indep calls to getAddresses and getPubKeysFromAddresses
  console.log(await (0, pubKeyGetter_1.getPubKeysFromAddresses)(addresses));
  console.log(await (0, addressGetter_1.getAddresses)(10n, 2));
  // combined calls to getAddresses and getPubKeysFromAddresses
  const retrievedAddresses = await (0, addressGetter_1.getAddresses)(10n, 2);
  console.log("addresses: ", retrievedAddresses);
  console.log(
    await (0, pubKeyGetter_1.getPubKeysFromAddresses)(retrievedAddresses),
  );
})();
