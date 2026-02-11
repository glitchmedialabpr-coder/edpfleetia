import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';

Deno.serve(async (req) => {
  try {
    const { pin } = await req.json();
    
    if (!pin || typeof pin !== 'string') {
      return Response.json({ error: 'PIN inválido' }, { status: 400 });
    }
    
    // Generar hash bcrypt
    const hash = await bcrypt.hash(pin);
    
    return Response.json({ 
      pin: pin,
      hash: hash,
      instructions: "Copia el 'hash' y configúralo como ADMIN_PIN_HASH en Settings → Secrets"
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});