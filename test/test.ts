import { getPubKeysFromAddresses } from "../src/pubKeyGetter";
//address on ed25519 : rJuGxtNrgy6MDwD7cAJBkwyzceJ31YytCG
//address on secp256k1 : rH7NWezPqw5xmguR27C847ZjSmtHnLkt2B
const addresses = [
  "rJuGxtNrgy6MDwD7cAJBkwyzceJ31YytCG", // address on ed25519
  "rH7NWezPqw5xmguR27C847ZjSmtHnLkt2B", // address on secp256k1
];
async function test() {
  console.log(await getPubKeysFromAddresses(addresses));
}
test();
