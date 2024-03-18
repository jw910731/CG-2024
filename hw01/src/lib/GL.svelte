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
	const mouseDonwHandler = (ev: MouseEvent) => {
		const { left, top } = canvasElem.getClientRects()[0];
		const { width, height } = canvasElem;
		const normalize = (x: number, y: number) => [
			((x - left) * 2) / width - 1,
			-1 * (((y - top) * 2) / height - 1),
		];
		const [x, y] = normalize(ev.clientX, ev.clientY);
		context.currentManager.addPoint([x, y]);
		cgRender(gl, context);
	};
	const keyDownHandler = (ev: KeyboardEvent) => {
		if (ev.key.toUpperCase() == "C") {
			context.currentManager = context.managers.circle;
		} else if (ev.key.toUpperCase() == "S") {
			context.currentManager = context.managers.square;
		} else if (ev.key.toUpperCase() == "P") {
			context.currentManager = context.managers.point;
		} else if (ev.key.toUpperCase() == "T") {
			context.currentManager = context.managers.triangle;
		} else if (ev.key.toUpperCase() == "L") {
			context.currentManager = context.managers.line;
		}
		Object.values(context.managers).forEach((manager) => manager.keyDown(ev));
	};
</script>

<svelte:window bind:innerHeight bind:innerWidth on:keydown={keyDownHandler} />

<canvas
	bind:this={canvasElem}
	bind:clientHeight={height}
	bind:clientWidth={width}
	on:mousedown={mouseDonwHandler}
/>
