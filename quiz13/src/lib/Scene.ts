import { Mat4, Vec3 } from "neon-matrix";
import { GLAttribute } from "./GLAttribute";
import { SceneOptions, type RenderContext } from "./RenderContext";
import { ObjShape, Sphere } from "./Shape";
import { createProgram } from "./glutils";
import vertexShader from "$assets/vertex.hlsl?raw";
import fragmentShader from "$assets/fragment.hlsl?raw";
import { CubeMap } from "./CubeMap";
import { Color } from "./Color";

export class Scene {
	gl: WebGL2RenderingContext;
	context: RenderContext;
	mario: ObjShape;
	sonic: ObjShape;
	sphere: Sphere;
	cubeMap: CubeMap;

	private mouseDragging = false;
	private camera: [number, number, number] = [3, 3, 7];
	private lightSrc: [number, number, number] = [0, 2, 3];
	constructor(gl: WebGL2RenderingContext) {
		this.gl = gl;
		const program = createProgram(gl, {
			vertexShaderSrc: vertexShader,
			fragmentShaderSrc: fragmentShader,
		});

		this.context = {
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
		};

		this.mario = new ObjShape(this.context, "mario.obj");
		this.sonic = new ObjShape(this.context, "sonic.obj", Color.RED);
		this.sphere = new Sphere(this.context);
		this.cubeMap = new CubeMap(gl, "cubemap");
	}

	public accumulator = 0;
	render() {
		const { gl, context: context } = this;
		gl.useProgram(this.context.program);

		// Prepare VP
		const vpMat = Mat4.create().perspectiveNO((30 / 180) * Math.PI, 1, 1, 100);
		const viewMat = Mat4.create().lookAt(this.camera, [0, 0, 0], [0, 1, 0]);
		vpMat.multiply(viewMat);

		const lightVpMat = Mat4.create().perspectiveNO((90 / 180) * Math.PI, 1, 1, 10);
		const lightViewMat = Mat4.create().lookAt(this.lightSrc, [0, 0, 0], [0, 1, 0]);
		lightVpMat.multiply(lightViewMat);

		gl.useProgram(this.context.program);
		// View Port
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		// Clear Buffer
		gl.clearColor(...context.sceneOpt.background, 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.DEPTH_TEST);

		// Bind uniform
		gl.uniform4f(this.context.lightSrcUnif, ...this.lightSrc, 1);
		gl.uniform4f(this.context.viewPosUnif, ...this.camera, 1);
		gl.uniform1f(this.context.shininessUnif, 10.0);

		// Set illunination parameter
		gl.uniform1f(this.context.kaUnif, 0.2);
		gl.uniform1f(this.context.kdUnif, 0.7);
		gl.uniform1f(this.context.ksUnif, 1.0);

		// Draw Mario
		{
			// matricies
			const modelMat = Mat4.create()
				.translate([0, 0, -2])
				.rotateY((this.accumulator / 360) * Math.PI)
				.translate([1.5, 0, 0])
				.scale([0.01, 0.01, 0.01]);
			const mvpMat = vpMat.clone();
			mvpMat.multiply(modelMat);
			const normalMat = modelMat.clone();
			normalMat.invert();
			normalMat.transpose();
			gl.uniformMatrix4fv(this.context.mvpMatUnif, false, mvpMat);
			gl.uniformMatrix4fv(this.context.modelMatUnif, false, modelMat);
			gl.uniformMatrix4fv(this.context.normalMatUnif, false, normalMat);
			// Real draw
			this.mario.draw();
		}

		// Draw Sonic
		{
			// matricies
			const modelMat = Mat4.create()
				.translate([0, -0.5, -2])
				.rotateY((this.accumulator / 360) * Math.PI)
				.translate([-1.5, 0, 0])
				.scale([0.035, 0.035, 0.035]);
			const mvpMat = vpMat.clone();
			mvpMat.multiply(modelMat);
			const normalMat = modelMat.clone();
			normalMat.invert();
			normalMat.transpose();
			gl.uniformMatrix4fv(this.context.mvpMatUnif, false, mvpMat);
			gl.uniformMatrix4fv(this.context.modelMatUnif, false, modelMat);
			gl.uniformMatrix4fv(this.context.normalMatUnif, false, normalMat);
			// Real draw
			this.sonic.draw();
		}

		{
			// matricies
			const modelMat = Mat4.create().translate([0, 1, -2]);
			const mvpMat = vpMat.clone();
			mvpMat.multiply(modelMat);
			const normalMat = modelMat.clone();
			normalMat.invert();
			normalMat.transpose();
			gl.uniformMatrix4fv(this.context.mvpMatUnif, false, mvpMat);
			gl.uniformMatrix4fv(this.context.modelMatUnif, false, modelMat);
			gl.uniformMatrix4fv(this.context.normalMatUnif, false, normalMat);
			// Real draw
			this.sphere.draw();
		}

		this.cubeMap.draw(vpMat.clone());
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
