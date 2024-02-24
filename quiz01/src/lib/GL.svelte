<script lang="ts">
	import { onMount } from "svelte";
	import { cgRender, cgPrepare } from "./GL";
	import type { RenderContext } from "./GL";
	import vertexShader from "./vertex.glsl?raw";
	import fragmentShader from "./fragment.glsl?raw";
	import { tick } from "svelte";
	import { mat2 } from "gl-matrix";

	let canvasElem: HTMLCanvasElement;
	let gl: WebGLRenderingContext;
	let context: RenderContext;

	onMount(async () => {
		gl = canvasElem.getContext("webgl")!;
		context = cgPrepare(gl, vertexShader, fragmentShader);
		mat2.fromRotation(context.accMat, Math.PI);
		cgRender(gl, context);
		const update = () => {
			const clone = mat2.clone(context.accMat);
			mat2.rotate(context.accMat, clone, Math.PI * 0.01);
			cgRender(gl, context);
			requestAnimationFrame(update);
		};
		requestAnimationFrame(update);
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
			}
		})();
</script>

<svelte:window bind:innerHeight bind:innerWidth />

<canvas bind:this={canvasElem} bind:clientHeight={height} bind:clientWidth={width} />
