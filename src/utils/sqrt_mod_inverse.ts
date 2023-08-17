import assert from "assert";
import { modulo } from "./modulo";

/**
 * Modular square root of a, mod P, P prime.
 *
 * @param a
 * @param P
 */
export function square_root_mod_prime(a: bigint, P: bigint): bigint {
  assert(0 <= a && a < P, "a must be in [0, P)");
  assert(1 < P, "P must be > 1");

  if (a === 0n) {
    return 0n;
  }
  if (P === 2n) {
    return a;
  }

  const jac = jacobi(a, P);

  if (jac === -1n) {
    throw new Error("a has no square root modulo P");
  }

  if (modulo(P, 4n) === 3n) {
    return pow(a, (P + 1n) / 4n, P);
  }

  let d: bigint;
  if (modulo(P, 8n) === 5n) {
    d = pow(a, (P + 1n) / 4n, P);
    if (d === 1n) {
      return pow(a, (P + 3n) / 8n, P);
    }
    assert(d === P - 1n, "d must be P - 1");
    return (2n * a * pow(4n * a, (P - 5n) / 8n, P)) % P;
  }

  const rangeTop = P;
  for (let i = 2n; i < rangeTop; i++) {
    let f: [bigint, bigint, bigint];
    let ff;
    if (jacobi(i * i - 4n * a, P) === -1n) {
      f = [a, -i, 1n];
      ff = polynomial_exp_mod([0n, 1n], (P + 1n) / 2n, f, P);
      if (ff[1]) {
        throw new Error("P must be prime");
      }
      return ff[0];
    }
  }
  throw new Error("No b found");
}

/**
 * Jacobi symbol
 *
 * @param a
 * @param n
 */
function jacobi(a: bigint, n: bigint): bigint {
  // TODO: test
  if (n < 3) {
    throw new Error("n must be > 2");
  }
  if (n % 2n === 0n) {
    throw new Error("n must be odd");
  }

  a = modulo(a, n);

  if (a === 0n) {
    return 0n;
  }
  if (a === 1n) {
    return 1n;
  }

  let a1 = a;
  let e = 0n;
  while (a1 % 2n === 0n) {
    a1 /= 2n;
    e++;
  }
  let s: bigint;
  if (modulo(e, 2n) == 0n || modulo(n, 8n) == 1n || modulo(n, 8n) == 7n) {
    s = 1n;
  } else {
    s = -1n;
  }

  if (a1 == 1n) {
    return s;
  }

  if (modulo(n, 4n) == 3n && modulo(a1, 4n) == 3n) {
    s = -s;
  }

  return s * jacobi(n, a1);
}

/**
 * computes base ** power mod modulus
 *
 * @param base - the base to be raised to the power
 * @param power - the power to raise the base to
 * @param modulus - the modulus
 * @returns base ** power mod modulus
 */
export function pow(base: bigint, power: bigint, modulus = 1n): bigint {
  if (power === 0n) {
    return 1n % modulus;
  }

  let result = 1n;
  while (power > 0n) {
    if (power % 2n === 1n) {
      result = (result * base) % modulus;
    }
    base = (base * base) % modulus;
    power >>= 1n;
  }
  return result;
}

/**
 * Polynomial exponentiation modulo a polynomial over ints mod p.
 *
 * @remarks
 * Polynomials are represented as lists of coefficients
 * of increasing powers of x.
 *
 * @param base - the base polynomial
 * @param exponent - the exponent
 * @param polymod - the polynomial modulus
 * @param P - the modulus
 */
function polynomial_exp_mod(
  base: bigint[],
  exponent: bigint,
  polymod: [bigint, bigint, bigint],
  P: bigint,
): bigint[] {
  assert(exponent < P, "exponent must be < P");

  if (exponent === 0n) {
    return [1n];
  }

  let G = base;
  let k = exponent;
  let s: bigint[];
  if (modulo(k, 2n) === 1n) {
    s = G;
  } else {
    s = [1n];
  }

  while (k > 1n) {
    k /= 2n;
    G = polynomial_multiply_mod(G, G, polymod, P);
    if (modulo(k, 2n) === 1n) {
      s = polynomial_multiply_mod(G, s, polymod, P);
    }
  }
  return s;
}

/**
 * Polynomial multiplication modulo a polynomial over ints mod p
 *
 * @remarks
 * Polynomials are represented as lists of coefficients
 * of increasing powers of x.
 *
 * @param m1 - the first polynomial
 * @param m2 - the second polynomial
 * @param polymod - the polynomial modulus
 * @param P - the modulus
 */
function polynomial_multiply_mod(
  m1: bigint[],
  m2: bigint[],
  polymod: [bigint, bigint, bigint],
  P: bigint,
): bigint[] {
  // set a bigint[] with a length of the product of the lengths of m1 and m2 minus 1
  // and fill it with 0n
  const prod: bigint[] = new Array(m1.length + m2.length - 1).fill(0n);

  // Add together all the cross-terms
  for (let i = 0; i < m1.length; i++) {
    for (let j = 0; j < m2.length; j++) {
      prod[i + j] = modulo(prod[i + j] + m1[i] * m2[j], P);
    }
  }
  return polynomial_reduce_mod(prod, polymod, P);
}

/**
 * Reduce poly by polymod, integer arithmetic modulo p
 *
 * @remarks
 * Polynomials are represented as lists of coefficients
 * of increasing powers of x
 *
 * @param poly - the polynomial to reduce
 * @param polymod - the polynomial modulus
 * @param P - the modulus
 */
function polynomial_reduce_mod( // needs testing
  poly: bigint[],
  polymod: [bigint, bigint, bigint],
  P: bigint,
): bigint[] {
  assert(polymod.length > 1, "polymod must have degree > 0");
  // Just to make this easy, require a monic polynomial
  assert(polymod[polymod.length - 1] === 1n, "polymod must be monic");

  while (poly.length >= polymod.length) {
    if (poly[poly.length - 1] !== 0n) {
      for (let i = 2; i < polymod.length + 1; i++) {
        poly[poly.length - i] = modulo(
          poly[poly.length - i] -
            poly[poly.length - 1] * polymod[polymod.length - i],
          P,
        ); // not sure about this. Should be like: poly[-i] = (poly[-i] - poly[-1] * polymod[-i]) % p
      }
    }
    poly = poly.slice(0, poly.length - 1);
  }
  return poly;
}
