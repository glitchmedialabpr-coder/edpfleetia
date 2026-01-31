Deno.serve(async (req) => {
  try {
    const { pin } = await req.json();
    const ADMIN_PIN = Deno.env.get('ADMIN_PIN');
    
    if (pin !== ADMIN_PIN) {
      return Response.json({ success: false, error: 'PIN incorrecto' }, { status: 401 });
    }
    
    return Response.json({ 
      success: true,
      user: {
        email: 'admin@edp.edu',
        full_name: 'Administrador',
        role: 'admin',
        session_expiry: Date.now() + (8 * 60 * 60 * 1000)
      }
    });
  } catch (error) {
    return Response.json({ success: false, error: 'Error' }, { status: 500 });
  }
});