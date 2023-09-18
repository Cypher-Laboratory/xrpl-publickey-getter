"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const elliptic_1 = require("elliptic");
function calculateYCoordinate(x) {
  const ed25519 = new elliptic_1.ec("ed25519");
  const A = BigInt(ed25519.curve.a.toString());
  const p = BigInt(ed25519.curve.p.toString());
  const xBuf = Buffer.from(x.toString(16), "hex");
  const rhsBuf = ed25519.curve.g
    .mul(xBuf)
    .add(ed25519.curve.pointFromX(A, Buffer.alloc(32, 1)))
    .getY();
  const rhs = BigInt(`0x${rhsBuf.toString("hex")}`);
  const y = modSqrt(rhs, p);
  if ((y ** BigInt(2) - rhs) % p === BigInt(0)) {
    return y;
  } else {
    return null;
  }
}
function modSqrt(a, p) {
  if (p % BigInt(4) !== BigInt(3)) {
    throw new Error("Invalid modulus for square root calculation");
  }
  const power = (p + BigInt(1)) / BigInt(4);
  return BigInt(Math.pow(Number(a), Number(power))) % p;
}
// Example usage
const xCoordinate = BigInt(
  "0x" + "F34B2C5A199A5D86FAAEF992E018DE8E1502780E26E6EAD083E306A6E7393825",
);
const yCoordinate = calculateYCoordinate(xCoordinate);
if (yCoordinate !== null) {
  console.log(`Calculated y-coordinate: ${yCoordinate}`);
} else {
  console.log("Invalid x-coordinate");
}
