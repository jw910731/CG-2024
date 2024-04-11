import { Mat4 } from "neon-matrix";
import { GLAttribute } from "./GLAttribute";
import { SceneOptions, type RenderContext, Transform } from "./RenderContext";
import { TestPolygon } from "./Shape";
import { createProgram, type ProgramParams } from "./glutils";

export class Scene {
	gl: WebGL2RenderingContext;
	context: RenderContext;
	object: TestPolygon;

	private angleX = 0;
	private angleY = 0;
	private mouseDragging = false;
	private camera: [number, number, number] = [3, 3, 7];
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

		this.object = new TestPolygon(this.context);
		gl.enable(gl.DEPTH_TEST);
	}

	private inc = 0;
	render() {
		const { gl, context } = this;
		const trans = new Transform();

		// View Port
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		// Clear Buffer
		gl.clearColor(...context.sceneOpt.background, 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		// draw & transform
		trans.addOp("rotate", (this.angleY / 180) * Math.PI, [1, 0, 0]); //for mouse rotation
		trans.addOp("rotate", (this.angleX / 180) * Math.PI, [0, 1, 0]); //for mouse rotation
		trans.addOp("translate", [0.0, 0.0, -1.0]);
		trans.addOp("scale", [1, 0.5, 2]);

		// matricies
		const modelMat = trans.getMat();
		const mvpMat = Mat4.create().perspectiveNO((30 / 180) * Math.PI, 1, 1, 100);
		const viewMat = Mat4.create().lookAt(this.camera, [0, 0, 0], [0, 1, 0]);
		mvpMat.multiply(viewMat);
		mvpMat.multiply(modelMat);
		const normalMat = modelMat.clone();
		normalMat.invert();
		normalMat.transpose();

		// Bind uniform
		gl.uniformMatrix4fv(this.context.mvpMatUnif, false, mvpMat);
		gl.uniformMatrix4fv(this.context.modelMatUnif, false, modelMat);
		gl.uniformMatrix4fv(this.context.normalMatUnif, false, normalMat);
		gl.uniform4f(this.context.lightSrcUnif, 0, 0, 3, 1);
		gl.uniform4f(this.context.viewPosUnif, ...this.camera, 1);
		gl.uniform1f(this.context.kaUnif, 0.2);
		gl.uniform1f(this.context.kdUnif, 0.7);
		gl.uniform1f(this.context.ksUnif, 1.0);
		gl.uniform1f(this.context.shininessUnif, 10.0);
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

			this.angleX += dx; //yes, x for y, y for x, this is right
			this.angleY += dy;
		}
		this.mouseLast = [x, y];
		this.render();
	}
}
