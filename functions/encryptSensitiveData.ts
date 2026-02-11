import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const ENCRYPTION_KEY = Deno.env.get('ENCRYPTION_KEY') || 'default-key-change-in-production';

async function encryptData(data, key) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key.padEnd(32, '0').slice(0, 32));
  const cryptoKey = await crypto.subtle.importKey('raw', keyData, { name: 'AES-GCM' }, false, ['encrypt']);
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const dataEncoded = encoder.encode(JSON.stringify(data));
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    dataEncoded
  );
  
  const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
  const encryptedHex = Array.from(new Uint8Array(encrypted)).map(b => b.toString(16).padStart(2, '0')).join('');
  
  return `${ivHex}:${encryptedHex}`;
}

async function decryptData(encryptedData, key) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key.padEnd(32, '0').slice(0, 32));
  const cryptoKey = await crypto.subtle.importKey('raw', keyData, { name: 'AES-GCM' }, false, ['decrypt']);
  
  const [ivHex, encryptedHex] = encryptedData.split(':');
  const iv = new Uint8Array(ivHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  const encrypted = new Uint8Array(encryptedHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    encrypted
  );
  
  const decryptedStr = new TextDecoder().decode(decrypted);
  return JSON.parse(decryptedStr);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    const base44 = createClientFromRequest(req);
    const { action, data } = await req.json();

    if (action === 'encrypt') {
      const encrypted = await encryptData(data, ENCRYPTION_KEY);
      return Response.json({ success: true, encrypted }, { status: 200 });
    }
    
    if (action === 'decrypt') {
      const decrypted = await decryptData(data, ENCRYPTION_KEY);
      return Response.json({ success: true, decrypted }, { status: 200 });
    }

    return Response.json({ success: false, error: 'Acción inválida' }, { status: 400 });
  } catch (error) {
    console.error('[encryptSensitiveData] Error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});