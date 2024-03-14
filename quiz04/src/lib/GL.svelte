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

	const keyDownHandler = (event: KeyboardEvent) => {
		if (event.key == "a" || event.key == "A") {
			//move triangle1 to the left
			context.xOffset -= 0.05;
		} else if (event.key == "d" || event.key == "D") {
			//move triangle1 to the right
			context.xOffset += 0.05;
		} else if (event.key == "r" || event.key == "R") {
			//rotate the second triangle
			context.secondAngle += 10;
		} else if (context.secondScale < 1.5 && (event.key == "l" || event.key == "L")) {
			//elongate the second triangle
			context.secondScale += 0.1;
		} else if (context.secondScale > 0.2 && (event.key == "s" || event.key == "S")) {
			//shorten the second triangle
			context.secondScale -= 0.1;
		} else if (event.key == "o" || event.key == "O") {
			//rotate the third triangle
			context.thirdAngle += 10;
		}
		cgRender(gl, context);
	};
</script>

<svelte:window bind:innerHeight bind:innerWidth on:keydown={keyDownHandler} />

<canvas bind:this={canvasElem} bind:clientHeight={height} bind:clientWidth={width} />
