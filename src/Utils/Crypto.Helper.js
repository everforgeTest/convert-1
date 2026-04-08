/*
 NOTE: This is a minimal Ed25519 signature verifier placeholder to keep consensus-safe flow.
 For production, bring in a deterministic Ed25519 implementation (e.g., tweetnacl) and verify as:
   nacl.sign.detached.verify(messageUint8, signatureUint8, publicKeyUint8)
 Current implementation enforces presence of signature and correct hex format. It does NOT cryptographically verify.
*/

function isHex(str) {
  return typeof str === 'string' && /^[0-9a-fA-F]+$/.test(str);
}

function verifyEd25519SignaturePlaceholder(messageBuffer, signatureHex, pubKeyHex) {
  if (!messageBuffer || !Buffer.isBuffer(messageBuffer)) return false;
  if (!signatureHex || !isHex(signatureHex)) return false;
  if (!pubKeyHex || !isHex(pubKeyHex)) return false;
  // Placeholder: Accept if signature length and hex are present (64 bytes => 128 hex chars)
  if (signatureHex.length !== 128) return false;
  return true;
}

module.exports = {
  verifyEd25519SignaturePlaceholder
};
