import { getPubKeysFromAddresses } from "../src";

const address = "rJumr5e1HwiuV543H7bqixhtFreChWTaHH";

async function test() {
  const a = await getPubKeysFromAddresses([address]);
  console.log(a);
}

test();
