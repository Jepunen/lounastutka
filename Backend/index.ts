import { serve } from "bun";

serve({
    port: 3001,
    fetch(req) {
	return new Response("Backend connection OK, I hope");
    }
});


