import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // List complaints using service role (no authentication required)
    const complaints = await base44.asServiceRole.entities.EmployeeComplaint.list('-created_date');

    return Response.json(complaints);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});