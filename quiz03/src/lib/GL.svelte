<script lang="ts">
	import { onMount } from "svelte";
	import { cgRender, cgPrepare } from "./GL";
	import { type RenderContext } from "./RenderContext";
	import vertexShader from "./vertex.hlsl?raw";
	import fragmentShader from "./fragment.hlsl?raw";
	import { tick } from "svelte";

	let canvasElem: HTMLCanvasElement;
	let gl: WebGL2RenderingContext;
	let context: RenderContext;
	const whcalc = () =>
		Math.min(
			Math.floor(innerWidth * devicePixelRatio),
			Math.floor(innerHeight * devicePixelRatio)
		);
	let devicePixelRatio = 1;
	let innerWidth = 0,
		innerHeight = 0;

	let height = whcalc(),
		width = whcalc();
	$: (height = whcalc()),
		(width = whcalc()),
		(async () => {
			if (context && canvasElem) {
				canvasElem.width = width;
				canvasElem.height = height;
				await tick();
				cgRender(gl, context);
			}
		})();

	onMount(async () => {
		gl = canvasElem.getContext("webgl2")!;
		context = cgPrepare(gl, vertexShader, fragmentShader);
		cgRender(gl, context);
	});
</script>

<svelte:window bind:innerHeight bind:innerWidth />

<canvas bind:this={canvasElem} bind:clientHeight={height} bind:clientWidth={width} />
