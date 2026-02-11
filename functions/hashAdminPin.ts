import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';

Deno.serve(async (req) => {
  try {
    const { pin } = await req.json();
    
    if (!pin || typeof pin !== 'string') {
      return Response.json({ error: 'PIN required' }, { status: 400 });
    }
    
    // Generar hash con bcrypt (cost factor 12)
    const hash = await bcrypt.hash(pin, 12);
    
    return Response.json({
      success: true,
      hash,
      message: 'Set this hash as ADMIN_PIN_HASH environment variable'
    });
    
  } catch (error) {
    console.error('[hashAdminPin] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});