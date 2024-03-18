import type {
	CircleManager,
	LineManager,
	BaseShapeManager,
	SquareManager,
	TriangleManager,
} from "./ShapeManager";

export interface RenderContext {
	shaderProgram: WebGLProgram;
	managers: {
		line: LineManager;
		square: SquareManager;
		circle: CircleManager;
		triangle: TriangleManager;
		point: SquareManager;
	};
	currentManager: BaseShapeManager;
}
