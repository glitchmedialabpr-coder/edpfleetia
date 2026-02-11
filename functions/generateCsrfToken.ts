Deno.serve(async (req) => {
  try {
    // Generar token CSRF único
    const csrfToken = crypto.randomUUID();
    
    // El token debe almacenarse en la sesión del usuario
    // y enviarse de vuelta al cliente
    return Response.json({
      csrfToken
    }, {
      headers: {
        'X-CSRF-Token': csrfToken,
        'Access-Control-Allow-Origin': req.headers.get('origin') || '*',
        'Access-Control-Allow-Credentials': 'true'
      }
    });
    
  } catch (error) {
    console.error('[generateCsrfToken] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});