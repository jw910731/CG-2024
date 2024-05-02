import { Mat4, Vec3 } from "neon-matrix";
import { GLAttribute } from "./GLAttribute";
import { SceneOptions, type RenderContext, Transform } from "./RenderContext";
import { Cube, ObjShape } from "./Shape";
import { createProgram, type ProgramParams } from "./glutils";
import mario from "$assets/mario.obj?raw";

export class Scene {
	gl: WebGL2RenderingContext;
	context: RenderContext;
	object: ObjShape;
	floor: Cube;

	private mouseDragging = false;
	private camera: [number, number, number] = [3, 3, 7];
	private lightSrc: [number, number, number] = [0, 2, 3];
	constructor(gl: WebGL2RenderingContext, programParams: ProgramParams) {
		this.gl = gl;
		const program = createProgram(this.gl, programParams);
		gl.useProgram(program);

		this.context = {
			gl,
			program,
			sceneOpt: new SceneOptions(),
			// vshade
			mvpMatUnif: gl.getUniformLocation(program, "u_mvpMat")!,
			modelMatUnif: gl.getUniformLocation(program, "u_modelMat")!,
			normalMatUnif: gl.getUniformLocation(program, "u_normalMat")!,
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

		this.floor = new Cube(this.context);
		this.object = new ObjShape(this.context, mario);
		gl.enable(gl.DEPTH_TEST);
	}

	render() {
		const { gl, context } = this;
		const trans = new Transform();

		// View Port
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		// Clear Buffer
		gl.clearColor(...context.sceneOpt.background, 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		// Bind uniform
		gl.uniform4f(this.context.lightSrcUnif, ...this.lightSrc, 1);
		gl.uniform4f(this.context.viewPosUnif, ...this.camera, 1);
		gl.uniform1f(this.context.shininessUnif, 10.0);

		// Prepare MV
		const vpMat = Mat4.create().perspectiveNO((30 / 180) * Math.PI, 1, 1, 100);
		const viewMat = Mat4.create().lookAt(this.camera, [0, 0, 0], [0, 1, 0]);
		vpMat.multiply(viewMat);

		// Set illunination parameter
		gl.uniform1f(this.context.kaUnif, 0.2);
		gl.uniform1f(this.context.kdUnif, 0.7);
		gl.uniform1f(this.context.ksUnif, 1.0);

		// Draw floor
		// transform
		trans.addOp("translate", [0, -1, 0]);
		trans.addOp("scale", [2, 0.25, 2]);

		// matricies
		const modelMat = trans.getMat();
		const mvpMat = vpMat.clone();
		mvpMat.multiply(modelMat);
		const normalMat = modelMat.clone();
		normalMat.invert();
		normalMat.transpose();
		gl.uniformMatrix4fv(this.context.mvpMatUnif, false, mvpMat);
		gl.uniformMatrix4fv(this.context.modelMatUnif, false, modelMat);
		gl.uniformMatrix4fv(this.context.normalMatUnif, false, normalMat);
		// Real draw
		this.floor.draw();

		// Draw Object
		// transform
		trans.clear();
		trans.addOp("scale", [0.01, 0.01, 0.01]);

		// matricies
		modelMat.set(trans.getMat());
		mvpMat.set(vpMat);
		mvpMat.multiply(modelMat);
		normalMat.set(modelMat);
		normalMat.invert();
		normalMat.transpose();
		gl.uniformMatrix4fv(this.context.mvpMatUnif, false, mvpMat);
		gl.uniformMatrix4fv(this.context.modelMatUnif, false, modelMat);
		gl.uniformMatrix4fv(this.context.normalMatUnif, false, normalMat);
		// Real draw
		this.object.draw();
	}

	onMouseDown(ev: MouseEvent) {
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
		this.mouseDragging = false;
	}

	private mouseLast = [0, 0];
	onMouseMove(ev: MouseEvent) {
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
