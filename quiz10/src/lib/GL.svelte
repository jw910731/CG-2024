<script lang="ts">
	import { onMount } from "svelte";
	import vertexShader from "$assets/vertex.hlsl?raw";
	import fragmentShader from "$assets/fragment.hlsl?raw";
	import { tick } from "svelte";
	import { Scene } from "./Scene";

	let canvasElem: HTMLCanvasElement;
	let gl: WebGL2RenderingContext;
	let scene: Scene;
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
			if (scene && canvasElem) {
				canvasElem.width = width;
				canvasElem.height = height;
				await tick();
				scene.render();
			}
		})();
	$: mouseDownHandler = scene?scene.onMouseDown.bind(scene):(()=>{});
	$: mouseUpHandler = scene?scene.onMouseUp.bind(scene):(()=>{});
	$: mouseMoveHandler = scene?scene.onMouseMove.bind(scene):(()=>{});

	onMount(async () => {
		gl = canvasElem.getContext("webgl2")!;
		scene = new Scene(gl, {vertexShaderSrc: vertexShader, fragmentShaderSrc: fragmentShader});
		update();
	});

	const update = () => {
		scene.render();
	}

</script>

<svelte:window bind:innerHeight bind:innerWidth />

<canvas
	bind:this={canvasElem}
	bind:clientHeight={height}
	bind:clientWidth={width}
	on:mousedown={mouseDownHandler}
	on:mouseup={mouseUpHandler}
	on:mousemove={mouseMoveHandler}
/>
