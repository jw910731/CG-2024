<script lang="ts">
	import { onMount } from "svelte";
	import { cgRender, cgPrepare } from "./GL";
	import type { RenderContext } from "./GL";
	import vertexShader from "./vertex.glsl?raw";
	import fragmentShader from "./fragment.glsl?raw";
	import { tick } from "svelte";

	let canvasElem: HTMLCanvasElement;
	let gl: WebGLRenderingContext;
	let context: RenderContext;

	onMount(async () => {
		gl = canvasElem.getContext("webgl")!;
		context = cgPrepare(gl, vertexShader, fragmentShader);
		cgRender(gl, context);
	});

	let devicePixelRatio = 1;
	let innerWidth = 0,
		innerHeight = 0;

	let height = Math.min(
			Math.floor(innerWidth * devicePixelRatio),
			Math.floor(innerHeight * devicePixelRatio)
		),
		width = Math.min(
			Math.floor(innerWidth * devicePixelRatio),
			Math.floor(innerHeight * devicePixelRatio)
		);
	$: (height = Math.min(
		Math.floor(innerWidth * devicePixelRatio),
		Math.floor(innerHeight * devicePixelRatio)
	)),
		(width = Math.min(
			Math.floor(innerWidth * devicePixelRatio),
			Math.floor(innerHeight * devicePixelRatio)
		)),
		(async () => {
			if (context && canvasElem) {
				canvasElem.width = width;
				canvasElem.height = height;
				await tick();
				cgRender(gl, context);
				console.log(width, height);
			}
		})();
</script>

<svelte:window bind:innerHeight bind:innerWidth />

<canvas bind:this={canvasElem} bind:clientHeight={height} bind:clientWidth={width} />
