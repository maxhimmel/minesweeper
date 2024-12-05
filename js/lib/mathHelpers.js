/**
 * Modulus that wraps negative numbers.
 */
export function modulo(lhs, rhs) {
  return ((lhs % rhs) + rhs) % rhs;
}
