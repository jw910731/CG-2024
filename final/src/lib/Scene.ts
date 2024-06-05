import { Mat4, Vec3 } from "neon-matrix";
import { GLAttribute } from "./GLAttribute";
import { SceneOptions, type OffscreenContext, type RenderContext } from "./RenderContext";
import { Cube, ObjShape, Sphere, type Drawable, PortalGun, Portal } from "./Shape";
import { createProgram } from "./glutils";
import vertexShader from "$assets/vertex.hlsl?raw";
import fragmentShader from "$assets/fragment.hlsl?raw";
import { CubeMap } from "./CubeMap";
import { Color } from "./Color";

function drawHelper(
	context: RenderContext,
	modelMat: Readonly<Mat4>,
	vpMat: Readonly<Mat4>,
	drawable: Drawable,
	addition?: () => void
) {
	const { gl } = context;
	const mvpMat = vpMat.clone();
	mvpMat.multiply(modelMat);
	const normalMat = modelMat.clone();
	normalMat.invert();
	normalMat.transpose();
	gl.uniformMatrix4fv(context.mvpMatUnif, false, mvpMat);
	gl.uniformMatrix4fv(context.modelMatUnif, false, modelMat);
	gl.uniformMatrix4fv(context.normalMatUnif, false, normalMat);
	if (addition) addition();
	// Real draw
	drawable.draw();
}

export class Scene {
	gl: WebGL2RenderingContext;
	context: RenderContext;
	offContext1: OffscreenContext;
	offContext2: OffscreenContext;
	offContext3: OffscreenContext;
	mario: ObjShape;
	sonic: ObjShape;
	sphere: Sphere;
	cube: Cube;
	cubeMap: CubeMap;
	portalGun: PortalGun;
	portal: Portal;

	private mouseDragging = false;
	private camera: [number, number, number] = [10, 3, 5];
	private cameraView: [number, number, number] = [-10, -3, -5];
	private lightSrc: [number, number, number] = [0, 2, 3];
	private thirdView = false;
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
			textureEnableUnif: gl.getUniformLocation(program, "u_texture_ena")!,
			textureUnif: gl.getUniformLocation(program, "u_texture")!,
		};

		{
			const texture = gl.createTexture()!;
			const depth = gl.createRenderbuffer()!;
			const framebuf = gl.createFramebuffer()!;
			this.offContext1 = {
				texture,
				depth,
				framebuf,
			};
		}
		{
			const texture = gl.createTexture()!;
			const depth = gl.createRenderbuffer()!;
			const framebuf = gl.createFramebuffer()!;
			this.offContext2 = {
				texture,
				depth,
				framebuf,
			};
		}
		{
			const texture = gl.createTexture()!;
			const depth = gl.createRenderbuffer()!;
			const framebuf = gl.createFramebuffer()!;
			this.offContext3 = {
				texture,
				depth,
				framebuf,
			};
		}

		this.mario = new ObjShape(this.context, "mario.obj");
		this.sonic = new ObjShape(this.context, "sonic.obj", Color.RED);
		this.sphere = new Sphere(this.context);
		this.cube = new Cube(this.context);
		this.portalGun = new PortalGun(this.context);
		this.cubeMap = new CubeMap(gl, "cubemap");
		this.portal = new Portal(this.context);
	}

	public accumulator = 0;

	private texturePrepare() {
		const { gl } = this.context;
		for (const ctx of [this.offContext1, this.offContext2, this.offContext3]) {
			const { texture, depth, framebuf } = ctx;
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
			gl.framebufferTexture2D(
				gl.FRAMEBUFFER,
				gl.COLOR_ATTACHMENT0,
				gl.TEXTURE_2D,
				texture,
				0
			);
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depth);
		}
	}

	render() {
		const { gl } = this;
		this.texturePrepare();

		// ****************
		// Offscreen Pass
		// ****************
		gl.useProgram(this.context.program);
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.offContext1.framebuf);
		// View Port
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		// Clear Buffer
		gl.clearColor(...this.context.sceneOpt.background, 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.DEPTH_TEST);
		const texture = gl.createTexture()!;
		gl.activeTexture(gl.TEXTURE0);
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
		gl.uniform1i(this.context.textureUnif, 0);
		this.renderWrapper(
			Mat4.create()
				.perspectiveNO((30 / 180) * Math.PI, 1, 1, 100)
				.multiply(Mat4.create().lookAt([0, 0, 10], [0, 0, 0], [0, 1, 0]))
		);

		// ****************
		// Offscreen pass 2
		// ****************
		gl.useProgram(this.context.program);
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.offContext2.framebuf);
		// View Port
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		// Clear Buffer
		gl.clearColor(...this.context.sceneOpt.background, 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.DEPTH_TEST);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, this.offContext1.texture);
		gl.uniform1i(this.context.textureUnif, 1);
		this.renderWrapper(
			Mat4.create()
				.perspectiveNO((30 / 180) * Math.PI, 1, 1, 100)
				.multiply(Mat4.create().lookAt([0, 0, -10], [0, 0, 0], [0, 1, 0]))
		);

		// ****************
		// Offscreen Pass 3
		// ****************
		gl.useProgram(this.context.program);
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.offContext3.framebuf);
		// View Port
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		// Clear Buffer
		gl.clearColor(...this.context.sceneOpt.background, 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.DEPTH_TEST);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.offContext2.texture);
		gl.uniform1i(this.context.textureUnif, 0);
		this.renderWrapper(
			Mat4.create()
				.perspectiveNO((30 / 180) * Math.PI, 1, 1, 100)
				.multiply(Mat4.create().lookAt([0, 0, 10], [0, 0, 0], [0, 1, 0]))
		);

		// ****************
		// Main render Pass
		// ****************
		gl.useProgram(this.context.program);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		// View Port
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		// Clear Buffer
		gl.clearColor(...this.context.sceneOpt.background, 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.DEPTH_TEST);

		// Bind uniform
		gl.uniform4f(this.context.lightSrcUnif, ...this.lightSrc, 1);
		gl.uniform4f(this.context.viewPosUnif, ...this.camera, 1);
		gl.uniform1f(this.context.shininessUnif, 10.0);

		// Set illunination parameter
		gl.uniform1f(this.context.kaUnif, 0.6);
		gl.uniform1f(this.context.kdUnif, 0.3);
		gl.uniform1f(this.context.ksUnif, 0.7);

		// draw portal gun
		// ****************
		if (!this.thirdView) {
			gl.uniform1i(this.context.textureEnableUnif, 1);
			gl.uniform1i(this.context.textureUnif, 0);
			drawHelper(
				this.context,
				Mat4.create()
					.scale([3, 3, 3])
					.translate([0.3, -0.3, 0])
					.rotateX((-60 / 180) * Math.PI)
					.rotateY((-20 / 180) * Math.PI),
				Mat4.create(),
				this.portalGun
			);
		}

		// Prepare VP
		// ****************
		const vpMat = Mat4.create().perspectiveNO((30 / 180) * Math.PI, 1, 1, 100);
		if (!this.thirdView) {
			const viewMat = Mat4.create().lookAt(
				this.camera,
				Vec3.from(this.camera.map((c, i) => c + this.cameraView[i])),
				[0, 1, 0]
			);
			vpMat.multiply(viewMat);
		} else {
			const viewMat = Mat4.create().lookAt([6, 6, 7], [0, 0, 0], [0, 1, 0]);
			vpMat.multiply(viewMat);
		}
		// ****************
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.offContext3.texture);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, this.offContext2.texture);
		this.renderWrapper(vpMat);
	}

	private renderWrapper(vpMat: Mat4) {
		const { gl } = this;
		gl.useProgram(this.context.program);

		const lightVpMat = Mat4.create().perspectiveNO((90 / 180) * Math.PI, 1, 1, 10);
		const lightViewMat = Mat4.create().lookAt(this.lightSrc, [0, 0, 0], [0, 1, 0]);
		lightVpMat.multiply(lightViewMat);

		// Set illunination parameter
		gl.uniform1f(this.context.kaUnif, 0.2);
		gl.uniform1f(this.context.kdUnif, 0.7);
		gl.uniform1f(this.context.ksUnif, 1.0);

		// Set texture enable status
		gl.uniform1i(this.context.textureEnableUnif, 0);
		gl.uniform1i(this.context.textureUnif, 0);
		drawHelper(
			this.context,
			Mat4.create().translate([0, -5, 0]).scale([10, 0.1, 10]),
			vpMat,
			this.cube
		);
		drawHelper(
			this.context,
			Mat4.create()
				.translate([0, 0, -2])
				.rotateY((this.accumulator / 360) * Math.PI)
				.translate([1.5, 0, 0])
				.scale([0.01, 0.01, 0.01]),
			vpMat,
			this.mario
		);
		drawHelper(
			this.context,
			Mat4.create()
				.translate([0, -0.5, -2])
				.rotateY((this.accumulator / 360) * Math.PI)
				.translate([-1.5, 0, 0])
				.scale([0.035, 0.035, 0.035]),
			vpMat,
			this.sonic
		);
		// drawHelper(this.context, Mat4.create().translate([0, 1, -2]), vpMat, this.sphere);

		gl.uniform1i(this.context.textureUnif, 0);
		drawHelper(
			this.context,
			Mat4.create()
				.translate([0, 0, -10])
				.rotateY(Math.PI / 2),
			vpMat,
			this.portal
		);
		gl.uniform1i(this.context.textureUnif, 1);
		drawHelper(
			this.context,
			Mat4.create()
				.translate([0, 0, 10])
				.rotateY(Math.PI / 2),
			vpMat,
			this.portal
		);

		this.cubeMap.draw(vpMat.clone());
	}

	onKeyDown(ev: KeyboardEvent) {
		const normView = [...new Vec3(this.cameraView).normalize().values()];
		const sideDir = [...new Vec3(this.cameraView).cross([0, 1, 0]).normalize()];
		switch (ev.key) {
			case "w":
				this.camera = [
					this.camera[0] + normView[0],
					this.camera[1],
					this.camera[2] + normView[2],
				];
				break;
			case "s":
				this.camera = [
					this.camera[0] - normView[0],
					this.camera[1],
					this.camera[2] - normView[2],
				];
				break;
			case "a":
				this.camera = [
					this.camera[0] - sideDir[0],
					this.camera[1],
					this.camera[2] - sideDir[2],
				];
				break;
			case "d":
				this.camera = [
					this.camera[0] + sideDir[0],
					this.camera[1],
					this.camera[2] + sideDir[2],
				];
				break;
			case "F5":
				this.thirdView = !this.thirdView;
				break;
		}
	}

	onMouseDown(ev: MouseEvent) {
		// if (!this.renderMode) return;
		const x = ev.clientX;
		const y = ev.clientY;
		const rect = (<HTMLCanvasElement>ev.target!).getBoundingClientRect();
		if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
			this.mouseLast = [x, y];
		}
		this.render();
	}

	private mouseLast = [0, 0];
	onMouseMove(ev: MouseEvent) {
		// if (!this.renderMode) return;
		const x = ev.clientX;
		const y = ev.clientY;
		const factor = 1 / 3;
		const dx = factor * (x - this.mouseLast[0]);
		const dy = factor * (y - this.mouseLast[1]);
		const rotMat = Mat4.create();
		rotMat.rotate((Math.sqrt(dx * dx + dy * dy) / 180) * Math.PI, [-dy, -dx, 0]);

		this.cameraView = <[number, number, number]>[
			...rotMat.transform(Vec3.fromValues(...this.cameraView)).values(),
		];
		this.mouseLast = [x, y];
		this.render();
	}
}
