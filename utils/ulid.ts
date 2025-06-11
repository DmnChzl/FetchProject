const ENCODING = "0123456789abcdefghjkmnpqrstvwxyz";
const TIME_LEN = 10;
const RANDOM_LEN = 16;

/**
 * Convert Int Value -> Base32 Encoded Str
 *
 * @param {number} value
 * @param {number} length
 * @returns Base32 Encoded Str
 */
function encodeBase32(value: number, length: number) {
  let encoded = "";

  while (length--) {
    encoded = ENCODING[value % 32] + encoded;
    value = Math.floor(value / 32);
  }
  return encoded;
}

/**
 * @method getTimePart
 * @returns ULID 'timePart'
 */
function getTimePart(): string {
  const time = Date.now();
  return encodeBase32(time, TIME_LEN);
}

/**
 * @method getRandomPart
 * @returns ULID 'randomPart'
 */
function getRandomPart(): string {
  let randomPart = "";

  for (let idx = 0; idx < RANDOM_LEN; idx++) {
    randomPart += ENCODING[Math.floor(Math.random() * 32)];
  }
  return randomPart;
}

/**
 * Concat 'timePart' + 'randomPart'
 *
 * @returns ULID
 */
export const ulid = (): string => getTimePart() + getRandomPart();

/**
 * Convert Base32 Encoded Str -> Int Value
 *
 * @param {string} encoded Base32 Str
 * @returns Int Value
 */
function decodeBase32(encoded: string): number {
  let value = 0;

  for (let i = 0; i < encoded.length; i++) {
    value = value * 32 + ENCODING.indexOf(encoded[i]);
  }
  return value;
}

/**
 * Read 'timePart'
 *
 * @param {string} ulid
 * @returns {number} Millis
 */
export const getTimeFromUlid = (ulid: string): number => {
  // Extract the time part...
  const timePart = ulid.substring(0, TIME_LEN);
  return decodeBase32(timePart);
};
