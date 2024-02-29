<script lang="ts">
	import { onMount } from "svelte";
	import { cgRender, cgPrepare } from "./GL";
	import type { RenderContext } from "./GL";
	import vertexShader from "./vertex.hlsl?raw";
	import fragmentShader from "./fragment.hlsl?raw";
	import { tick } from "svelte";
	import { Color } from "./Dot";

	let canvasElem: HTMLCanvasElement;
	let gl: WebGLRenderingContext;
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

	const mouseDonwHandler = (ev: MouseEvent) => {
		const { left, top } = canvasElem.getClientRects()[0];
		const { width, height } = canvasElem;
		const normalize = (x: number, y: number) => [
			((x - left) * 2) / width - 1,
			-1 * (((y - top) * 2) / height - 1),
		];
		const color = (x: number, y: number) => {
			if (x >= 0 && y >= 0) return Color.RED;
			if (x >= 0 && y < 0) return Color.WHITE;
			if (x < 0 && y >= 0) return Color.BLUE;
			return Color.GREEN;
		};
		const [x, y] = normalize(ev.clientX, ev.clientY);
		context.dots.push({
			color: color(x, y),
			position: [x, y, 0, 1],
		});
		cgRender(gl, context);
	};
</script>

<svelte:window bind:innerHeight bind:innerWidth />

<canvas
	bind:this={canvasElem}
	on:mousedown={mouseDonwHandler}
	bind:clientHeight={height}
	bind:clientWidth={width}
/>
