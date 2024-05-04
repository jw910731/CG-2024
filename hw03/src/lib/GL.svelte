<script lang="ts">
	import { onMount } from "svelte";
	import vertexShader from "./vertex.hlsl?raw";
	import fragmentShader from "./fragment.hlsl?raw";
	import { tick } from "svelte";
	import { Scene } from "./Scene";

	let canvasElem: HTMLCanvasElement;
	let gl: WebGL2RenderingContext;
	let scene: Scene;
	const whcalc = (w: number, h: number) =>
		Math.min(
			Math.floor( w * devicePixelRatio),
			Math.floor( h * devicePixelRatio)
		);
	let devicePixelRatio = 1;
	let innerWidth = 0,
		innerHeight = 0;

	$: {
		if (scene && canvasElem) {
			canvasElem.height = whcalc(innerWidth, innerHeight);
			canvasElem.width = whcalc(innerWidth, innerHeight)
			scene.render();
		}
	};
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
	on:mousedown={mouseDownHandler}
	on:mouseup={mouseUpHandler}
	on:mousemove={mouseMoveHandler}
/>
