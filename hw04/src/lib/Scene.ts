import { Mat4, Vec3 } from "neon-matrix";
import { GLAttribute } from "./GLAttribute";
import {
	SceneOptions,
	type RenderContext,
	Transform,
	type OffscreenContext,
} from "./RenderContext";
import { Cube, Quad, Sphere } from "./Shape";
import { createProgram, type ProgramParams } from "./glutils";
import { Color } from "./Color";

export class Scene {
	public accumulator = 0;

	gl: WebGL2RenderingContext;
	context: RenderContext;
	offContext: OffscreenContext;
	lightSrcSphere: Sphere;
	floor: Cube;
	sphereB: Sphere;
	arm: Cube;
	sphereG: Sphere;
	quad: Quad;

	private movement = [0, 0];
	private arm1Angle = 0;
	private arm2Angle = -24;
	private arm3Angle = 48;
	private updObj = Vec3.fromValues(0, 0, 1);
	private canGrab = false;
	private grab = false;
	private distance = Vec3.fromValues(3, 3, 7).magnitude;

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
			prevMvpMtUnif: gl.getUniformLocation(program, "u_prevMvpMat")!,
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
			textureUnif: gl.getUniformLocation(program, "u_texture")!,
		};

		this.lightSrcSphere = new Sphere(this.context, new Color([1, 1, 0]));
		this.floor = new Cube(this.context);
		this.sphereB = new Sphere(this.context, Color.BLUE);
		this.arm = new Cube(this.context, Color.WHITE);
		this.sphereG = new Sphere(this.context, Color.GREEN);
		this.quad = new Quad(this.context, Color.fromValues(-1, -1, -1));

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

		gl.enable(gl.DEPTH_TEST);
	}

	private texturePrepare() {
		const { gl } = this.context;
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
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depth);
	}

	render() {
		const { gl } = this;
		this.texturePrepare();

		const lightVpMat = Mat4.create().perspectiveNO((30 / 180) * Math.PI, 1, 1, 100);
		{
			gl.bindFramebuffer(gl.FRAMEBUFFER, this.offContext.framebuf);
			const texture = gl.createTexture()!;
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				gl.RGBA,
				1,
				1,
				0,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				new Uint8Array([0, 255, 0, 255])
			);

			// Prepare VP
			const viewMat = Mat4.create().lookAt(
				Vec3.fromValues(...this.camera).add([1, 1, 1]),
				[0, 0, 0],
				[0, 1, 0]
			);
			lightVpMat.multiply(viewMat);
			gl.uniformMatrix4fv(this.context.prevMvpMtUnif, false, Mat4.create());
			gl.uniform1i(this.context.textureUnif, 0);
			gl.activeTexture(gl.TEXTURE0);
			this.renderScene(lightVpMat);
		}

		{
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			// Prepare VP
			const vpMat = Mat4.create().perspectiveNO((30 / 180) * Math.PI, 1, 1, 100);
			const viewMat = Mat4.create().lookAt(this.camera, [0, 0, 0], [0, 1, 0]);
			vpMat.multiply(viewMat);
			gl.uniformMatrix4fv(this.context.prevMvpMtUnif, false, lightVpMat);
			gl.uniform1i(this.context.textureUnif, 0);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, this.offContext.texture);
			this.renderScene(vpMat);
		}
	}

	renderScene(vpMat: Readonly<Mat4>) {
		const { gl, context } = this;

		// View Port
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		// Clear Buffer
		gl.clearColor(...context.sceneOpt.background, 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		// Bind uniform
		gl.uniform4f(this.context.lightSrcUnif, ...this.lightSrc, 1);
		gl.uniform4f(this.context.viewPosUnif, ...this.camera, 1);
		gl.uniform1f(this.context.shininessUnif, 10.0);

		{
			// Draw Light Source
			// force illuminate light source
			gl.uniform1f(this.context.kaUnif, 0.8);
			gl.uniform1f(this.context.kdUnif, 0);
			gl.uniform1f(this.context.ksUnif, 0);
			// set model
			const modelMat = Mat4.create();
			modelMat.translate(this.lightSrc);
			modelMat.scale([0.15, 0.15, 0.15]);
			// calc mat
			const mvpMat = vpMat.clone();
			mvpMat.multiply(modelMat);
			const normalMat = modelMat.clone();
			normalMat.invert();
			normalMat.transpose();
			// set mat and draw
			gl.uniformMatrix4fv(this.context.mvpMatUnif, false, mvpMat);
			gl.uniformMatrix4fv(this.context.modelMatUnif, false, modelMat);
			gl.uniformMatrix4fv(this.context.normalMatUnif, false, normalMat);
			this.lightSrcSphere.draw();
		}

		// Rest illunination parameter
		gl.uniform1f(this.context.kaUnif, 0.2);
		gl.uniform1f(this.context.kdUnif, 0.7);
		gl.uniform1f(this.context.ksUnif, 1.0);

		{
			// Draw floor
			// transform
			const modelMat = Mat4.create();
			modelMat.translate([0, -1, 0]);
			modelMat.scale([2, 0.25, 2]);

			// matricies
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
		}

		{
			// Draw floor
			// transform
			const modelMat = Mat4.create();
			modelMat.translate([-3, 0, 0]);

			// matricies
			const mvpMat = vpMat.clone();
			mvpMat.multiply(modelMat);
			const normalMat = modelMat.clone();
			normalMat.invert();
			normalMat.transpose();
			gl.uniformMatrix4fv(this.context.mvpMatUnif, false, mvpMat);
			gl.uniformMatrix4fv(this.context.modelMatUnif, false, modelMat);
			gl.uniformMatrix4fv(this.context.normalMatUnif, false, normalMat);
			// Real draw
			this.quad.draw();
		}

		const trans = new Transform();
		{
			// Draw Object
			// transform
			const modelMat = Mat4.create();
			modelMat.scale([0.5, 0.3, 0.75]);
			trans.addOp("translate", [this.movement[0], -0.25, -1.0 + this.movement[1]]);

			// matricies
			const transMat = trans.getMat().multiply(modelMat);
			const mvpMat = vpMat.clone();
			mvpMat.multiply(transMat);
			const normalMat = transMat.clone();
			normalMat.invert();
			normalMat.transpose();
			gl.uniformMatrix4fv(this.context.mvpMatUnif, false, mvpMat);
			gl.uniformMatrix4fv(this.context.modelMatUnif, false, transMat);
			gl.uniformMatrix4fv(this.context.normalMatUnif, false, normalMat);
			// Real draw
			this.sphereB.draw();
		}

		{
			// Draw Object
			// transform
			const modelMat = Mat4.create();
			modelMat.scale(Vec3.fromValues(0.5, 2, 0.5).scale(1 / 4));
			trans.addOp("rotateX", (this.arm1Angle / 36) * Math.PI);
			trans.addOp("translate", [0, 0.75, 0]);

			// matricies
			const transMat = trans.getMat().multiply(modelMat);
			const mvpMat = vpMat.clone();
			mvpMat.multiply(transMat);
			const normalMat = transMat.clone();
			normalMat.invert();
			normalMat.transpose();
			gl.uniformMatrix4fv(this.context.mvpMatUnif, false, mvpMat);
			gl.uniformMatrix4fv(this.context.modelMatUnif, false, transMat);
			gl.uniformMatrix4fv(this.context.normalMatUnif, false, normalMat);
			// Real draw
			this.arm.draw();
		}
		{
			// Draw Object
			// transform
			const modelMat = Mat4.create();
			modelMat.scale(Vec3.fromValues(0.5, 2, 0.5).scale(1 / 4));
			trans.addOp("translate", [0, -0.3 + 0.75, 0]);
			trans.addOp("rotateX", (this.arm2Angle / 36) * Math.PI);
			trans.addOp("translate", [0, 0.3 - 0.75, 0]);

			// matricies
			const transMat = trans.getMat().multiply(modelMat);
			const mvpMat = vpMat.clone();
			mvpMat.multiply(transMat);
			const normalMat = transMat.clone();
			normalMat.invert();
			normalMat.transpose();
			gl.uniformMatrix4fv(this.context.mvpMatUnif, false, mvpMat);
			gl.uniformMatrix4fv(this.context.modelMatUnif, false, transMat);
			gl.uniformMatrix4fv(this.context.normalMatUnif, false, normalMat);
			// Real draw
			this.arm.draw();
		}
		{
			// Draw Object
			// transform
			const modelMat = Mat4.create();
			modelMat.scale(Vec3.fromValues(0.5, 2, 0.5).scale(1 / 4));
			trans.addOp("translate", [0, -0.3, 0]);
			trans.addOp("rotateX", (this.arm3Angle / 36) * Math.PI);
			trans.addOp("translate", [0, -0.3, 0]);

			// matricies
			const transMat = trans.getMat().multiply(modelMat);
			const mvpMat = vpMat.clone();
			mvpMat.multiply(transMat);
			const normalMat = transMat.clone();
			normalMat.invert();
			normalMat.transpose();
			gl.uniformMatrix4fv(this.context.mvpMatUnif, false, mvpMat);
			gl.uniformMatrix4fv(this.context.modelMatUnif, false, transMat);
			gl.uniformMatrix4fv(this.context.normalMatUnif, false, normalMat);
			// Real draw
			this.arm.draw();
		}

		const grabTrans = new Transform();
		{
			// Draw Object
			trans.addOp("translate", [0, -0.75, 0]);
			const pt = trans.getMat().transform(Vec3.create());
			// transform
			const modelMat = Mat4.create();
			modelMat.scale([0.25, 0.25, 0.25]);
			grabTrans.addOp("translate", this.updObj);
			const transMat = grabTrans.getMat().multiply(modelMat);
			if (pt.distance(transMat.transform(Vec3.create())) < 0.25) {
				this.canGrab = true;
				if (this.grab) {
					this.updObj = pt;
				}
			}

			// matricies
			const mvpMat = vpMat.clone();
			mvpMat.multiply(transMat);
			const normalMat = transMat.clone();
			normalMat.invert();
			normalMat.transpose();
			gl.uniformMatrix4fv(this.context.mvpMatUnif, false, mvpMat);
			gl.uniformMatrix4fv(this.context.modelMatUnif, false, transMat);
			gl.uniformMatrix4fv(this.context.normalMatUnif, false, normalMat);
			// Real draw
			this.sphereG.draw();
		}

		{
			// Draw Object
			// transform
			const modelMat = Mat4.create();
			modelMat.scale([0.25, 0.25, 0.25]);
			grabTrans.addOp("rotateX", (this.accumulator / 40) * Math.PI);
			grabTrans.addOp("translate", [0, 1, 0]);

			// matricies
			const transMat = grabTrans.getMat().multiply(modelMat);
			const mvpMat = vpMat.clone();
			mvpMat.multiply(transMat);
			const normalMat = transMat.clone();
			normalMat.invert();
			normalMat.transpose();
			gl.uniformMatrix4fv(this.context.mvpMatUnif, false, mvpMat);
			gl.uniformMatrix4fv(this.context.modelMatUnif, false, transMat);
			gl.uniformMatrix4fv(this.context.normalMatUnif, false, normalMat);
			// Real draw
			this.sphereB.draw();
		}

		{
			// Draw Object
			// transform
			const modelMat = Mat4.create();
			modelMat.scale([0.25, 0.25, 0.25]);
			grabTrans.pop();
			grabTrans.pop();
			grabTrans.addOp("rotateZ", (this.accumulator / 40) * Math.PI);
			grabTrans.addOp("translate", [1, 0, 0]);

			// matricies
			const transMat = grabTrans.getMat().multiply(modelMat);
			const mvpMat = vpMat.clone();
			mvpMat.multiply(transMat);
			const normalMat = transMat.clone();
			normalMat.invert();
			normalMat.transpose();
			gl.uniformMatrix4fv(this.context.mvpMatUnif, false, mvpMat);
			gl.uniformMatrix4fv(this.context.modelMatUnif, false, transMat);
			gl.uniformMatrix4fv(this.context.normalMatUnif, false, normalMat);
			// Real draw
			this.sphereB.draw();
		}
	}

	onKeyDown(ev: KeyboardEvent) {
		let tag = true;
		switch (ev.key) {
			case "=":
				this.arm1Angle += 1;
				break;
			case "-":
				this.arm1Angle -= 1;
				break;
			case "+":
				this.arm2Angle += 1;
				break;
			case "_":
				this.arm2Angle -= 1;
				break;
			case "p":
				this.arm3Angle += 1;
				break;
			case "o":
				this.arm3Angle -= 1;
				break;
			case "w":
				this.movement[1] += 0.1;
				break;
			case "s":
				this.movement[1] -= 0.1;
				break;
			case "a":
				this.movement[0] += 0.1;
				break;
			case "d":
				this.movement[0] -= 0.1;
				break;
			case " ":
				if (this.canGrab) {
					this.grab = !this.grab;
				}
				break;
			default:
				tag = false;
				break;
		}
		if (tag) {
			ev.preventDefault();
			this.render();
		}
	}
	onScroll(ev: WheelEvent) {
		this.distance += ev.deltaY * -0.01;
		ev.preventDefault();
		const camDist = Vec3.fromValues(...this.camera).magnitude;
		this.camera = <[number, number, number]>[
			...Vec3.fromValues(...this.camera)
				.scale(this.distance / camDist)
				.values(),
		];
		this.render();
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

			const camDist = Vec3.fromValues(...this.camera).magnitude;
			this.camera = <[number, number, number]>[
				...Vec3.fromValues(...this.camera)
					.scale(this.distance / camDist)
					.rotateY([0, 0, 0], (dx / 180) * Math.PI)
					.rotateX([0, 0, 0], (dy / 180) * Math.PI)
					.values(),
			];
		}
		this.mouseLast = [x, y];
		this.render();
	}
}
