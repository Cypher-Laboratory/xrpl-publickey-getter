import { getPubKeysFromAddresses } from "../src/pubKeyGetter";
import { getAddresses } from "../src/addressGetter";
//address on ed25519 : rJuGxtNrgy6MDwD7cAJBkwyzceJ31YytCG
//address on secp256k1 : rH7NWezPqw5xmguR27C847ZjSmtHnLkt2B
const addresses = [
  "rJuGxtNrgy6MDwD7cAJBkwyzceJ31YytCG", // address on ed25519
  "rH7NWezPqw5xmguR27C847ZjSmtHnLkt2B", // address on secp256k1
];
(async () => {
  // indep calls to getAddresses and getPubKeysFromAddresses
  //console.log(await getPubKeysFromAddresses(addresses));
  //console.log(await getAddresses(10n, 2));

  // combined calls to getAddresses and getPubKeysFromAddresses
  const retrievedAddresses = await getAddresses(10n, 5);
  console.log("addresses: ", retrievedAddresses);
  console.log(await getPubKeysFromAddresses(retrievedAddresses));
})();
