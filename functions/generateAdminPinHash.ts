import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';

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

    const hash = await bcrypt.hash(pin);

    return Response.json({
      success: true,
      pin_hash: hash,
      pin_used: pin
    }, { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});