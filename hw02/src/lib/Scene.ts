import { Mat3, Vec2 } from "neon-matrix";
import { Color } from "./Color";
import { GLAttribute } from "./GLAttribute";
import { SceneOptions, type RenderContext, Transform } from "./RenderContext";
import { BaseShape, Circle, DockerShape, Rectangle, Triangle } from "./Shape";
import { createProgram, type ProgramParams } from "./glutils";
import type { Vec2Like } from "neon-matrix/dist/src/Vec2";

export class Scene {
	gl: WebGL2RenderingContext;
	context: RenderContext;
	shapeContainer: BaseShape[] = [];
	trans: Transform;
	ref: {
		base: DockerShape;
		blocks: Array<Rectangle>;
		craneArm1: Rectangle;
		craneArm2: Rectangle;
		crawl: Triangle;
		tail: Triangle;
		armPatch: Array<Circle>;
	};
	constructor(gl: WebGL2RenderingContext, programParams: ProgramParams) {
		this.gl = gl;
		const program = createProgram(this.gl, programParams);
		gl.useProgram(program);
		this.context = {
			gl,
			program,
			sceneOpt: new SceneOptions(),
			matUnif: gl.getUniformLocation(program, "u_mat")!,
			globUnif: gl.getUniformLocation(program, "u_glob")!,
			colorAttr: new GLAttribute(gl, gl.getAttribLocation(program, "a_color")),
			vertexAttr: new GLAttribute(gl, gl.getAttribLocation(program, "a_pos")),
		};

		// init shape
		this.ref = {
			base: new DockerShape(this.context, Color.BLUE),
			blocks: [new Rectangle(this.context, new Color([0.28, 0.81, 0.8]))],
			craneArm1: new Rectangle(this.context, Color.BLUE),
			craneArm2: new Rectangle(this.context, Color.BLUE),
			crawl: new Triangle(this.context, Color.RED),
			tail: new Triangle(this.context, Color.BLUE),
			armPatch: [new Circle(this.context, Color.BLUE)],
		};
		const { base, blocks, craneArm1, craneArm2, crawl, tail, armPatch } = this.ref;
		base.mat.scale([0.5, 0.5]);
		blocks.forEach((r) => r.mat.scale([0.1, 0.1]));
		craneArm1.mat.scale([0.035, 0.25]);
		craneArm2.mat.scale([0.035, 0.15]);
		crawl.mat.scale([0.08, 0.08]);
		tail.mat.scale([0.05, 0.05]).rotate(Math.PI * (210 / 180));
		armPatch.map((e) => e.mat.scale([0.035, 0.035]));

		(<Array<BaseShape>>Object.values(this.ref)).forEach((e) => this.shapeContainer.push(e));

		this.trans = new Transform();
	}

	private inc = 0;
	private armBaseRotate = 0;
	private armRotate = 0;
	private crawlRotate = 0;
	private readonly speedInv = 60;
	private blockOff: Vec2 | undefined;
	private grab = false;
	private grabVec: Vec2 | undefined;
	private grabFlag = false;
	private globalScale = 1;
	private globalTranslate = 0;
	render() {
		const { gl, context } = this;
		gl.uniformMatrix3fv(
			this.context.globUnif,
			false,
			Mat3.fromScaling([this.globalScale, this.globalScale]).translate([
				this.globalTranslate,
				0,
			])
		);
		// View Port
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		// Clear Buffer
		gl.clearColor(...context.sceneOpt.background, 1);
		gl.clear(gl.COLOR_BUFFER_BIT);

		const { base, blocks, craneArm1, craneArm2, crawl, tail, armPatch } = this.ref;

		// draw & transform

		// Fish
		gl.uniformMatrix3fv(this.context.matUnif, false, this.trans.getMat());
		base.draw();

		// Fish tail
		const baseTail = new Vec2(base.joints[0]);
		this.trans.addOp("translate", baseTail);
		this.trans.addOp("rotate", Math.sin(this.inc * 0.02) * (15 / 180) * Math.PI);
		this.trans.addOp("translate", [0.01, 0.01]);
		gl.uniformMatrix3fv(this.context.matUnif, false, this.trans.getMat());
		tail.draw();
		const baseFront = new Vec2(base.joints[1]);
		this.trans.clear();

		// Crane arm base
		this.trans.addOp("translate", new Vec2(baseFront).add([0.1, -0.1]));
		this.trans.addOp("rotate", (this.armBaseRotate / this.speedInv) * Math.PI);
		this.trans.addOp("translate", [0, 0.25]);
		gl.uniformMatrix3fv(this.context.matUnif, false, this.trans.getMat());
		craneArm1.draw();

		// Crane arm
		this.trans.addOp("translate", [0, 0.25]);
		this.trans.addOp("rotate", (this.armRotate / this.speedInv) * Math.PI);
		gl.uniformMatrix3fv(this.context.matUnif, false, this.trans.getMat());
		armPatch[0].draw();
		this.trans.addOp("translate", [0, 0.14]);
		gl.uniformMatrix3fv(this.context.matUnif, false, this.trans.getMat());
		craneArm2.draw();

		// Crawl
		const crawlRot = (this.crawlRotate / this.speedInv + 20 / this.speedInv) * Math.PI;
		const crawlShift = new Vec2(crawl.mat.multiplyVec(crawl.joints[1]));
		this.trans.addOp("translate", [-0.05, 0.2]);
		this.trans.addOp("translate", crawlShift.negate());
		this.trans.addOp("rotate", crawlRot);
		this.trans.addOp("translate", crawlShift);

		const transBlk = new Transform();
		if (!this.blockOff) this.blockOff = baseFront.add([0.5, 0.1]);
		transBlk.addOp("translate", this.blockOff);
		const refPt = this.trans
			.getMat()
			.multiply(crawl.mat)
			.multiplyVec(new Vec2(crawl.joints[1]).add([0, -0.5]).negate());
		const block = blocks[0].joints.map((p) =>
			transBlk.getMat().multiply(blocks[0].mat).multiplyVec(p)
		);
		const cond = this.aabb(block, refPt);
		if (cond && this.grab) {
			crawl.currentColor = Color.GREEN;
			// Right after grab toggles on
			if (this.grabFlag) {
				this.grabFlag = false;
				const center = this.center(block);
				this.grabVec = new Vec2(center).subtract(refPt);
			}
			// grab update
			this.blockOff = new Vec2(refPt).add(this.grabVec!);
		} else if (cond) {
			crawl.currentColor = Color.BLUE;
		} else {
			crawl.currentColor = Color.RED;
		}

		// Block
		const signalPoint = new Circle(this.context, Color.BLUE);
		signalPoint.mat.translate(refPt);
		signalPoint.mat.scale([0.015, 0.015]);
		gl.uniformMatrix3fv(this.context.matUnif, false, new Mat3());
		signalPoint.draw();

		gl.uniformMatrix3fv(this.context.matUnif, false, transBlk.getMat());
		blocks[0].draw();
		gl.uniformMatrix3fv(this.context.matUnif, false, this.trans.getMat());
		crawl.draw();
		this.trans.clear();
		this.inc++;
	}
	private aabb(rect: Vec2Like[], pt: Vec2Like): boolean {
		const [minX, maxX] = [
			rect.reduce((acc, p) => Math.min(p[0], acc), 1),
			rect.reduce((acc, p) => Math.max(p[0], acc), -1),
		];
		const [minY, maxY] = [
			rect.reduce((acc, p) => Math.min(p[1], acc), 1),
			rect.reduce((acc, p) => Math.max(p[1], acc), -1),
		];
		return minX <= pt[0] && pt[0] <= maxX && minY <= pt[1] && pt[1] <= maxY;
	}

	private center(rect: Vec2Like[]): [number, number] {
		const [minX, maxX] = [
			rect.reduce((acc, p) => Math.min(p[0], acc), 1),
			rect.reduce((acc, p) => Math.max(p[0], acc), -1),
		];
		const [minY, maxY] = [
			rect.reduce((acc, p) => Math.min(p[1], acc), 1),
			rect.reduce((acc, p) => Math.max(p[1], acc), -1),
		];
		return [(minX + maxX) / 2, (minY + maxY) / 2];
	}

	onKeyDown(ev: KeyboardEvent) {
		switch (ev.key) {
			case "q":
				this.armBaseRotate++;
				ev.preventDefault();
				break;
			case "w":
				this.armBaseRotate--;
				ev.preventDefault();
				break;
			case "a":
				this.armRotate++;
				ev.preventDefault();
				break;
			case "s":
				this.armRotate--;
				ev.preventDefault();
				break;
			case "f":
				this.crawlRotate++;
				ev.preventDefault();
				break;
			case "d":
				this.crawlRotate--;
				ev.preventDefault();
				break;
			case " ":
				this.grab = !this.grab;
				this.grabFlag = true;
				ev.preventDefault();
				break;
			case "ArrowLeft":
				this.globalTranslate -= 0.1;
				ev.preventDefault();
				break;
			case "ArrowRight":
				this.globalTranslate += 0.1;
				ev.preventDefault();
				break;
			case "=":
				this.globalScale *= 2.0;
				ev.preventDefault();
				break;
			case "-":
				this.globalScale /= 2.0;
				ev.preventDefault();
				break;
			default:
				break;
		}
		this.shapeContainer.forEach((e) => {
			if (e instanceof BaseShape) {
				e.keyDown(ev);
			}
			if (e instanceof Array) {
				e.map((s) => s.keyDown(ev));
			}
		});
		this.render();
	}

	private debugSnippet(pt: Vec2Like) {
		const reference = new Circle(this.context, Color.WHITE);
		const dbg = new Circle(this.context, Color.GREEN);
		reference.mat.scale([0.01, 0.01]);
		dbg.mat.translate(pt);
		dbg.mat.scale([0.015, 0.015]);
		this.gl.uniformMatrix3fv(this.context.matUnif, false, new Mat3());
		reference.draw();
		dbg.draw();
	}
}
