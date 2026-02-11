import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { identifier, attempt_type } = await req.json();

    if (!identifier || !attempt_type) {
      return Response.json({ 
        error: 'identifier and attempt_type required' 
      }, { status: 400 });
    }

    // Buscar y eliminar rate limit
    const rateLimits = await base44.asServiceRole.entities.RateLimitLog.filter({
      identifier,
      attempt_type
    });

    for (const rateLimit of rateLimits) {
      await base44.asServiceRole.entities.RateLimitLog.delete(rateLimit.id);
    }

    return Response.json({ 
      success: true,
      reset: true 
    });

  } catch (error) {
    console.error('[resetRateLimit] Error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});