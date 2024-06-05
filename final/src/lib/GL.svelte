<script lang="ts">
	import { onMount } from "svelte";
	import { Scene } from "./Scene";
	import { updated } from "$app/stores";

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
			const wh = whcalc(innerWidth, innerHeight);
			canvasElem.height = wh;
			canvasElem.width = wh;
			scene.render();
		}
	};
	$: mouseDownHandler = scene?scene.onMouseDown.bind(scene):(()=>{});
	$: mouseMoveHandler = scene?scene.onMouseMove.bind(scene):(()=>{});
	$: keyDownHandler = scene?scene.onKeyDown.bind(scene):(()=>{});

	onMount(async () => {
		gl = canvasElem.getContext("webgl2")!;
		scene = new Scene(gl);
		scene.render();
		update();
	});
	const update = () => {
		scene.render();
		scene.accumulator = (scene.accumulator + 1) % 2147483647;
		requestAnimationFrame(update);
	}
</script>

<svelte:window bind:innerHeight bind:innerWidth on:keydown={keyDownHandler} on:mousemove={mouseMoveHandler} />

<div style="display:inline-flex;flex-direction: row">
	<div>
		<canvas
			bind:this={canvasElem}
			on:mousedown={mouseDownHandler}
		/>
	</div>
	<div>
		<p><b>Move Mouse</b> to look around.</p>
		<p><b>F5</b> to switch between third and first person view.</p>
		<p></p>
	</div>
</div>
