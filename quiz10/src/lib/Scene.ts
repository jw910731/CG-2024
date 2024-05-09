import { Mat4, Vec3 } from "neon-matrix";
import { GLAttribute } from "./GLAttribute";
import {
	SceneOptions,
	type RenderContext,
	type ShadowContext,
	type QuadContext,
	type OffscreenContext,
} from "./RenderContext";
import { Cube, ObjShape, Sphere } from "./Shape";
import { createProgram } from "./glutils";
import mario from "$assets/mario.obj?raw";
import vertexShader from "$assets/vertex.hlsl?raw";
import fragmentShader from "$assets/fragment.hlsl?raw";

import shadowVertShad from "$assets/shadow_vert.hlsl?raw";
import shadowFragShad from "$assets/shadow_frag.hlsl?raw";

import quadVertShad from "$assets/quad_vert.hlsl?raw";
import quadFragShad from "$assets/quad_frag.hlsl?raw";

export class Scene {
	gl: WebGL2RenderingContext;
	mainContext: RenderContext;
	shadowContext: ShadowContext;
	quadContext: QuadContext;
	offContext: OffscreenContext;
	object: ObjShape;
	floor: Cube;
	lightSphere: Sphere;
	public renderMode: boolean;

	private mouseDragging = false;
	private camera: [number, number, number] = [3, 3, 7];
	private lightSrc: [number, number, number] = [0, 2, 3];
	constructor(gl: WebGL2RenderingContext, mode: boolean) {
		this.gl = gl;
		this.renderMode = mode;
		const program = createProgram(gl, {
			vertexShaderSrc: vertexShader,
			fragmentShaderSrc: fragmentShader,
		});
		gl.useProgram(program);

		this.mainContext = {
			gl,
			program,
			sceneOpt: new SceneOptions(),
			// vshade
			mvpMatUnif: gl.getUniformLocation(program, "u_mvpMat")!,
			modelMatUnif: gl.getUniformLocation(program, "u_modelMat")!,
			normalMatUnif: gl.getUniformLocation(program, "u_normalMat")!,
			lightMvpUnif: gl.getUniformLocation(program, "u_lightMvpMat")!,
			colorAttr: new GLAttribute(gl, gl.getAttribLocation(program, "a_color")),
			vertexAttr: new GLAttribute(gl, gl.getAttribLocation(program, "a_pos")),
			normalAttr: new GLAttribute(gl, gl.getAttribLocation(program, "a_normal")),
			// fshade
			lightSrcUnif: gl.getUniformLocation(program, "u_lightPos")!,
			viewPosUnif: gl.getUniformLocation(program, "u_viewPos")!,
			kaUnif: gl.getUniformLocation(program, "u_Ka")!,
			kdUnif: gl.getUniformLocation(program, "u_Kd")!,
			ksUnif: gl.getUniformLocation(program, "u_Ks")!,
			shininessUnif: gl.getUniformLocation(program, "u_shininess")!,
			shadowMapUnif: gl.getUniformLocation(program, "u_shadowMap")!,
		};

		const shadowProgram = createProgram(gl, {
			vertexShaderSrc: shadowVertShad,
			fragmentShaderSrc: shadowFragShad,
		});
		this.shadowContext = {
			gl,
			program: shadowProgram,
			vertexAttr: new GLAttribute(gl, gl.getAttribLocation(shadowProgram, "a_pos")),
			mvpMatUnif: gl.getUniformLocation(shadowProgram, "u_mvpMat")!,
		};

		const quadProgram = createProgram(gl, {
			vertexShaderSrc: quadVertShad,
			fragmentShaderSrc: quadFragShad,
		});
		this.quadContext = {
			gl,
			program: quadProgram,
			vertexAttr: new GLAttribute(gl, gl.getAttribLocation(quadProgram, "a_pos")),
			shadowMapUnif: gl.getUniformLocation(quadProgram, "u_shadowMap")!,
		};
		{
			const texture = gl.createTexture()!;
			const depth = gl.createRenderbuffer()!;
			const framebuf = gl.createFramebuffer()!;
			this.offContext = {
				texture,
				depth,
				framebuf,
			};
		}

		this.floor = new Cube(this.mainContext);
		this.object = new ObjShape(this.mainContext, mario);
		this.lightSphere = new Sphere(this.mainContext, Vec3.fromValues(1, 1, 0));
	}

	private texturePrepare() {
		const { gl } = this.mainContext;
		const { texture, depth, framebuf } = this.offContext;
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			gl.canvas.width,
			gl.canvas.height,
			0,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			null
		);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

		gl.bindRenderbuffer(gl.RENDERBUFFER, depth);
		gl.renderbufferStorage(
			gl.RENDERBUFFER,
			gl.DEPTH_COMPONENT16,
			gl.canvas.width,
			gl.canvas.height
		);

		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuf);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
		gl.framebufferRenderbuffer(
			gl.FRAMEBUFFER,
			gl.DEPTH_ATTACHMENT,
			gl.RENDERBUFFER,
			depth
		);
	}

	render() {
		const { gl, mainContext: context } = this;

		this.texturePrepare();

		// Prepare MV
		const vpMat = Mat4.create().perspectiveNO((30 / 180) * Math.PI, 1, 1, 100);
		const viewMat = Mat4.create().lookAt(this.camera, [0, 0, 0], [0, 1, 0]);
		vpMat.multiply(viewMat);

		// Model mat
		const floorModelMat = Mat4.create().translate([0, -1, 0]).scale([2, 0.25, 2]);
		const objectModelMat = Mat4.create().scale([0.01, 0.01, 0.01]);

		// Shadow Mat
		const floorLightMvp = Mat4.create();
		const objectLightMvp = Mat4.create();

		const lightVpMat = Mat4.create().perspectiveNO((90 / 180) * Math.PI, 1, 1, 10);
		const lightViewMat = Mat4.create().lookAt(this.lightSrc, [0, 0, 0], [0, 1, 0]);
		lightVpMat.multiply(lightViewMat);

		// Shadow
		gl.useProgram(this.shadowContext.program);
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.offContext.framebuf);
		// View Port
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		// Clear Buffer
		gl.clearColor(0, 0, 0, 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.DEPTH_TEST);
		{
			// floor
			floorLightMvp.set(lightVpMat);
			floorLightMvp.multiply(floorModelMat);
			gl.uniformMatrix4fv(this.shadowContext.mvpMatUnif, false, floorLightMvp);
			this.shadowContext.vertexAttr.prepareData(this.floor.vertices, 3);
			this.shadowContext.vertexAttr.enable();
			gl.drawArrays(gl.TRIANGLES, 0, this.floor.vertices.length / 3);
		}
		{
			// object
			objectLightMvp.set(lightVpMat);
			objectLightMvp.multiply(objectModelMat);
			gl.uniformMatrix4fv(this.shadowContext.mvpMatUnif, false, objectLightMvp);
			this.shadowContext.vertexAttr.prepareData(this.object.vertices, 3);
			this.shadowContext.vertexAttr.enable();
			gl.drawArrays(gl.TRIANGLES, 0, this.object.vertices.length / 3);
		}

		if (this.renderMode) {
			gl.useProgram(this.mainContext.program);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			// View Port
			gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
			// Clear Buffer
			gl.clearColor(...context.sceneOpt.background, 1);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			gl.enable(gl.DEPTH_TEST);

			// Bind uniform
			gl.uniform4f(this.mainContext.lightSrcUnif, ...this.lightSrc, 1);
			gl.uniform4f(this.mainContext.viewPosUnif, ...this.camera, 1);
			gl.uniform1f(this.mainContext.shininessUnif, 10.0);

			// Set illunination parameter
			gl.uniform1f(this.mainContext.kaUnif, 0.2);
			gl.uniform1f(this.mainContext.kdUnif, 0.7);
			gl.uniform1f(this.mainContext.ksUnif, 1.0);

			{
				// matricies
				const modelMat = floorModelMat.clone();
				const mvpMat = vpMat.clone();
				mvpMat.multiply(modelMat);
				const normalMat = modelMat.clone();
				normalMat.invert();
				normalMat.transpose();

				// main render
				gl.uniformMatrix4fv(this.mainContext.mvpMatUnif, false, mvpMat);
				gl.uniformMatrix4fv(this.mainContext.modelMatUnif, false, modelMat);
				gl.uniformMatrix4fv(this.mainContext.normalMatUnif, false, normalMat);
				gl.uniformMatrix4fv(this.mainContext.lightMvpUnif, false, floorLightMvp);
				gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_2D, this.offContext.texture);
				gl.uniform1i(this.mainContext.shadowMapUnif, 0);

				// Real draw
				this.floor.draw();
			}

			// Draw Object
			{
				// matricies
				const modelMat = objectModelMat.clone();
				const mvpMat = vpMat.clone();
				mvpMat.multiply(modelMat);
				const normalMat = modelMat.clone();
				normalMat.invert();
				normalMat.transpose();
				gl.uniformMatrix4fv(this.mainContext.mvpMatUnif, false, mvpMat);
				gl.uniformMatrix4fv(this.mainContext.modelMatUnif, false, modelMat);
				gl.uniformMatrix4fv(this.mainContext.normalMatUnif, false, normalMat);
				gl.uniformMatrix4fv(this.mainContext.lightMvpUnif, false, objectLightMvp);
				gl.uniform1i(this.mainContext.shadowMapUnif, 0);
				gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_2D, this.offContext.texture);
				// Real draw
				this.object.draw();
			}
		} else {
			// Depth map
			gl.useProgram(this.quadContext.program);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			// View Port
			gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
			// Clear Buffer
			gl.clearColor(0.4, 0.4, 0.4, 1);

			gl.uniform1i(this.quadContext.shadowMapUnif, 0);

			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, this.offContext.texture);

			const vert = [-1, 1, 1, 1, 1, -1, -1, -1];
			this.quadContext.vertexAttr.prepareData(new Float32Array(vert), 2);
			this.quadContext.vertexAttr.enable();
			gl.drawArrays(gl.TRIANGLE_FAN, 0, vert.length / 2);
		}
	}

	onMouseDown(ev: MouseEvent) {
		// if (!this.renderMode) return;
		const x = ev.clientX;
		const y = ev.clientY;
		const rect = (<HTMLCanvasElement>ev.target!).getBoundingClientRect();
		if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
			this.mouseLast = [x, y];
			this.mouseDragging = true;
		}
		this.render();
	}
	onMouseUp() {
		// if (!this.renderMode) return;
		this.mouseDragging = false;
	}

	private mouseLast = [0, 0];
	onMouseMove(ev: MouseEvent) {
		// if (!this.renderMode) return;
		const x = ev.clientX;
		const y = ev.clientY;
		if (this.mouseDragging) {
			const factor = 100 / this.gl.canvas.height; //100 determine the spped you rotate the object
			const dx = factor * (x - this.mouseLast[0]);
			const dy = factor * (y - this.mouseLast[1]);

			this.camera = <[number, number, number]>[
				...Vec3.fromValues(...this.camera)
					.rotateY([0, 0, 0], (dx / 180) * Math.PI)
					.rotateX([0, 0, 0], (dy / 180) * Math.PI)
					.values(),
			];
		}
		this.mouseLast = [x, y];
		this.render();
	}
}
