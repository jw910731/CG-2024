<script lang="ts">
	import { onMount } from "svelte";
	import { cgRender, cgPrepare } from "./GL";
	import { type RenderContext } from "./RenderContext";
	import vertexShader from "./vertex.hlsl?raw";
	import fragmentShader from "./fragment.hlsl?raw";
	import { tick } from "svelte";
	import { mat4, vec3 } from "gl-matrix";
	import { draw } from "svelte/transition";

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
	
	const drawWrapper = (gl: WebGL2RenderingContext, context: RenderContext) => {
		const mvpgen1 = (xoff: number, yoff: number, zoff: number) => {
			// prepare mvp
			const modelMat = mat4.create(),
				viewMat = mat4.create(),
				persMat = mat4.create();
			// Model
			mat4.rotateX(modelMat, modelMat, Math.PI * (-context.angleY / 180));
			mat4.rotateY(modelMat, modelMat, Math.PI * (context.angleX / 180));
			mat4.translate(modelMat, modelMat, vec3.fromValues(xoff, yoff, zoff));
			// View
			mat4.lookAt(viewMat, vec3.fromValues(0, 0, -10), vec3.fromValues(0, 0, 100), vec3.fromValues(0, 1, 0));
			// Perspective
			mat4.perspective(persMat, Math.PI * (30 / 180), context.vpwidth / context.vpheight, 1, 100);
			// Set uniform
			mat4.multiply(persMat, persMat, viewMat);
			mat4.multiply(persMat, persMat, modelMat);
			return persMat;
		};
		context.mvpGen = mvpgen1;
		context.background = [0.7, 0.7, 0.7, 1];
		context.vpwidth = canvasElem.width;
		context.vpheight = canvasElem.height/2;
		context.vpx = 0;
		context.vpy = canvasElem.height/2;
		cgRender(gl, context);
		const mvpgen2 = (xoff: number, yoff: number, zoff: number) => {
			// prepare mvp
			const modelMat = mat4.create(),
				viewMat = mat4.create(),
				persMat = mat4.create();
			// Model
			mat4.rotateX(modelMat, modelMat, Math.PI * (-context.angleY / 180));
			mat4.rotateY(modelMat, modelMat, Math.PI * (context.angleX / 180));
			mat4.translate(modelMat, modelMat, vec3.fromValues(xoff, yoff, zoff));
			// View
			mat4.lookAt(viewMat, vec3.fromValues(0, 0, 10), vec3.fromValues(0, 0, -100), vec3.fromValues(0, 1, 0));
			// Perspective
			mat4.perspective(persMat, Math.PI * (30 / 180), context.vpwidth / context.vpheight, 1, 100);
			// Set uniform
			mat4.multiply(persMat, persMat, viewMat);
			mat4.multiply(persMat, persMat, modelMat);
			return persMat;
		};
		context.mvpGen = mvpgen2;
		context.background = [0.1, 0.1, 0.1, 1];
		context.vpwidth = canvasElem.width/2;
		context.vpheight = canvasElem.height/2;
		context.vpx = 0;
		context.vpy = 0;
		cgRender(gl, context);
		const mvpgen3 = (xoff: number, yoff: number, zoff: number) => {
			// prepare mvp
			const modelMat = mat4.create(),
				viewMat = mat4.create(),
				persMat = mat4.create();
			// Model
			mat4.rotateX(modelMat, modelMat, Math.PI * (-context.angleY / 180));
			mat4.rotateY(modelMat, modelMat, Math.PI * (context.angleX / 180));
			mat4.translate(modelMat, modelMat, vec3.fromValues(xoff, yoff, zoff));
			// View
			mat4.lookAt(viewMat, vec3.fromValues(0, 0, -10), vec3.fromValues(0, 0, 100), vec3.fromValues(0, 1, 0));
			// Perspective
			// mat4.perspective(persMat, Math.PI * (30 / 180), context.vpwidth / context.vpheight, 1, 100);
			mat4.ortho(persMat, -2, 2, -2, 2, 1, 100);
			// Set uniform
			mat4.multiply(persMat, persMat, viewMat);
			mat4.multiply(persMat, persMat, modelMat);
			return persMat;
		};
		context.mvpGen = mvpgen3;
		context.background = [0.5, 0.5, 0.5, 1];
		context.vpwidth = canvasElem.width/2;
		context.vpheight = canvasElem.height/2;
		context.vpx = canvasElem.width/2;
		context.vpy = 0;
		cgRender(gl, context);
	}

	onMount(async () => {
		gl = canvasElem.getContext("webgl2")!;
		context = cgPrepare(gl, vertexShader, fragmentShader);
		drawWrapper(gl, context);
	});

	let mouseLastX = 0, mouseLastY = 0, mouseDragging = false;
	function mouseDown(ev: MouseEvent){ 
		const x = ev.clientX;
		const y = ev.clientY;
		const rect: DOMRect = ev.target!.getBoundingClientRect();
		if( rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom){
			mouseLastX = x;
			mouseLastY = y;
			mouseDragging = true;
		}
	}

	function mouseUp(ev: MouseEvent){ 
		mouseDragging = false;
	}

	function mouseMove(ev: MouseEvent){ 
		const x = ev.clientX;
		const y = ev.clientY;

		if( mouseDragging ){
			const factor = 100/canvasElem.height; //100 determine the spped you rotate the object
			const dx = factor * (x - mouseLastX);
			const dy = factor * (y - mouseLastY);

			context.angleX += dx; //yes, x for y, y for x, this is right
			context.angleY += dy;
		}
		mouseLastX = x;
		mouseLastY = y;

		drawWrapper(gl, context);
	}
</script>

<svelte:window bind:innerHeight bind:innerWidth />

<canvas bind:this={canvasElem} bind:clientHeight={height} bind:clientWidth={width} on:mousedown={mouseDown} on:mouseup={mouseUp} on:mousemove={mouseMove} />

