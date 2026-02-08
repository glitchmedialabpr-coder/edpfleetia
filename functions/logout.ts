import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const { session_token } = await req.json();

    if (session_token) {
      const sessions = await base44.asServiceRole.entities.UserSession.filter({
        session_token: session_token
      });

      if (sessions && sessions.length > 0) {
        await base44.asServiceRole.entities.UserSession.delete(sessions[0].id);
      }
    }

    return Response.json({
      success: true,
      message: 'Logged out successfully'
    }, {
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error) {
    console.error('[logout]', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});