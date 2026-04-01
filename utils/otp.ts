import * as OTPAuth from 'otpauth';

/**
 * Generates the current TOTP code for the given Base32-encoded secret.
 *
 * @param secret - Base32-encoded TOTP secret (e.g. from an authenticator app QR code).
 * @param digits - Number of digits in the code (default: 6).
 * @param period - Token validity window in seconds (default: 30).
 * @returns The current TOTP code as a zero-padded string.
 *
 * @example
 * import { generateTotp } from '../utils/otp';
 * import { ENV } from '../utils/env';
 *
 * const code = generateTotp(ENV.otpSecret);
 * await page.getByLabel('Code').fill(code);
 */
export function generateTotp(secret: string, digits = 6, period = 30): string {
  const totp = new OTPAuth.TOTP({
    algorithm: 'SHA1',
    digits,
    period,
    secret: OTPAuth.Secret.fromBase32(secret),
  });

  return totp.generate();
}
