/**
 * Generates the headers required for SwitchBot API v1.1
 * Including the HMAC-SHA256 signature.
 */
export const generateHeaders = async (token: string, secret: string) => {
  const t = Date.now().toString();
  const nonce = crypto.randomUUID(); // Requires secure context (HTTPS or localhost)
  const data = token + t + nonce;

  const encoder = new TextEncoder();
  const secretKeyData = encoder.encode(secret);
  const stringToSignData = encoder.encode(data);

  const key = await window.crypto.subtle.importKey(
    'raw',
    secretKeyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await window.crypto.subtle.sign(
    'HMAC',
    key,
    stringToSignData
  );

  // Convert ArrayBuffer to Base64 string
  const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

  return {
    Authorization: token,
    sign: signature,
    nonce: nonce,
    t: t,
    'Content-Type': 'application/json; charset=utf8',
  };
};
