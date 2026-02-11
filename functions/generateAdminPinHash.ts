Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  try {
    const { pin } = await req.json();
    
    if (!pin || typeof pin !== 'string') {
      return Response.json({ 
        error: 'PIN inválido' 
      }, { status: 400 });
    }

    // Generate hash using Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return Response.json({
      success: true,
      pin_hash: hashHex,
      pin_used: pin,
      message: 'Copia el pin_hash y actualiza el secret ADMIN_PIN_HASH en el dashboard'
    }, { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});