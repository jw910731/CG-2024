<script lang="ts">
	import { onMount } from "svelte";
	import { Scene } from "./Scene";

	let canvasElem: HTMLCanvasElement;
	let gl: WebGL2RenderingContext;
	let scene: Scene;
	let renderMode = true;
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
	$: mouseUpHandler = scene?scene.onMouseUp.bind(scene):(()=>{});
	$: mouseMoveHandler = scene?scene.onMouseMove.bind(scene):(()=>{});
	$: {
		if(scene){
			scene.renderMode = renderMode;
			scene.render();
		}
	};

	onMount(async () => {
		gl = canvasElem.getContext("webgl2")!;
		scene = new Scene(gl, renderMode);
		scene.render();
	});
</script>

<svelte:window bind:innerHeight bind:innerWidth />

<div style="display:inline-flex;flex-direction: row">
	<div>
		<canvas
			bind:this={canvasElem}
			on:mousedown={mouseDownHandler}
			on:mouseup={mouseUpHandler}
			on:mousemove={mouseMoveHandler}
		/>
	</div>
	<div>
		<select bind:value={renderMode}>
			<option value={true}>Normal</option>
			<option value={false}>Depth</option>
		</select>
	</div>
</div>
