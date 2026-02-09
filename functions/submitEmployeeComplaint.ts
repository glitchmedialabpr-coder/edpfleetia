import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    // Create complaint using service role (no authentication required)
    const complaint = await base44.asServiceRole.entities.EmployeeComplaint.create(payload);

    return Response.json({ success: true, complaint });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});