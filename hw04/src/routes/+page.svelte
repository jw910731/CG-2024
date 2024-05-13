<script>
	import GL from "$lib/GL.svelte";
	import { browser } from "$app/environment";
	if (browser) {
		(async () => {
			await import("webgl-lint/webgl-lint");
		})();
	}
</script>

<div>
	<GL />
</div>
