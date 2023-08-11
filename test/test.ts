import { getPubKeysFromAddresses } from "../src/pubKeyGetter";

const address = "rJuGxtNrgy6MDwD7cAJBkwyzceJ31YytCG";
async function test() {
  console.log(await getPubKeysFromAddresses([address]));
}
test();
