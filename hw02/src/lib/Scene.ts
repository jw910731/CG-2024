import { Mat3 } from "neon-matrix";
import { GLAttribute } from "./GLAttribute";
import { SceneOptions, type RenderContext, Transform } from "./RenderContext";
import { Circle, type BaseShape } from "./Shape";
import { createProgram, type ProgramParams } from "./glutils";

export class Scene {
	gl: WebGL2RenderingContext;
	context: RenderContext;
	shapeContainer: BaseShape[] = [];
	trans: Transform;
	constructor(gl: WebGL2RenderingContext, programParams: ProgramParams) {
		this.gl = gl;
		const program = createProgram(this.gl, programParams);
		gl.useProgram(program);
		this.context = {
			gl,
			program,
			sceneOpt: new SceneOptions(),
			matUnif: gl.getUniformLocation(program, "u_mat")!,
			colorAttr: new GLAttribute(gl, gl.getAttribLocation(program, "a_color")),
			vertexAttr: new GLAttribute(gl, gl.getAttribLocation(program, "a_pos")),
		};

		// init shape
		this.shapeContainer.push(new Circle(this.context));
		this.trans = new Transform();
	}
	render() {
		const { gl, context } = this;
		// View Port
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		// Clear Buffer
		gl.clearColor(...context.sceneOpt.background, 1);
		gl.clear(gl.COLOR_BUFFER_BIT);

		// transformation
		const mat = this.trans.getMat();
		gl.uniformMatrix3fv(this.context.matUnif, false, mat);
		// draw
		this.shapeContainer.forEach((s) => s.draw());
	}
	onKeyDown(ev: KeyboardEvent) {
		this.shapeContainer.forEach((s) => s.keyDown(ev));
		if (ev.key == "=") {
			this.trans.push({
				op: "scale",
				param: [[Math.random(), Math.random()]],
			});
		}
		if (ev.key == "-") {
			this.trans.pop();
		}
		this.render();
	}
}
