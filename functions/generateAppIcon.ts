import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const { url } = await base44.integrations.Core.GenerateImage({
            prompt: "App icon logo for Fleetia fleet management platform. Minimalist design with a solid teal background (#14b8a6 or similar teal color). Include a simple white bus or truck icon in the center. Professional, clean, modern style. Square format. Perfect for app branding and icon."
        });

        return Response.json({ icon_url: url });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});