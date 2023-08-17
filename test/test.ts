import { getPubKeysFromAddresses } from "../src";
import { P_SECP256k1 as P } from "../src/utils";
import { modulo } from "../src/utils";

const address = "rBtttd61FExHC68vsZ8dqmS3DfjFEceA1A"; // "rJumr5e1HwiuV543H7bqixhtFreChWTaHH";

async function test() {
  const account = await getPubKeysFromAddresses([address]);
  console.log(account);
  const x = account[0].publicKey[0];
  const y = account[0].publicKey[1];
  console.log("Is point on curve: ", modulo(y ** 2n - x ** 3n - 7n, P) === 0n);
}

test();
