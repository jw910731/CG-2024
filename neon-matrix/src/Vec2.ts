import { EPSILON } from "./common";

/**
 * A 2 dimensional vector given as a {@link Vec2}, a 2-element Float32Array, or
 * an array of 2 numbers.
 */
export type Vec2Like = [number, number] | Float32Array;

/**
 * 2 Dimensional Vector
 */
export class Vec2 extends Float32Array {
	/**
	 * The number of bytes in a {@link Vec2}.
	 */
	static readonly BYTE_LENGTH = 2 * Float32Array.BYTES_PER_ELEMENT;

	/**
	 * Create a {@link Vec2}.
	 */
	constructor(...values: [Readonly<Vec2Like> | ArrayBufferLike, number?] | number[]) {
		switch (values.length) {
			case 2: {
				const v = values[0];
				if (typeof v === "number") {
					super([v, values[1]]);
				} else {
					super(v as ArrayBufferLike, values[1], 2);
				}
				break;
			}
			case 1: {
				const v = values[0];
				if (typeof v === "number") {
					super([v, v]);
				} else {
					super(v as ArrayBufferLike, 0, 2);
				}
				break;
			}
			default:
				super(2);
				break;
		}
	}

	//============
	// Attributes
	//============

	// Getters and setters to make component access read better.
	// These are likely to be a little bit slower than direct array access.

	/**
	 * The x component of the vector. Equivalent to `this[0];`
	 * @category Vector components
	 */
	get x(): number {
		return this[0];
	}
	set x(value: number) {
		this[0] = value;
	}

	/**
	 * The y component of the vector. Equivalent to `this[1];`
	 * @category Vector components
	 */
	get y(): number {
		return this[1];
	}
	set y(value: number) {
		this[1] = value;
	}

	// Alternate set of getters and setters in case this is being used to define
	// a color.

	/**
	 * The r component of the vector. Equivalent to `this[0];`
	 * @category Color components
	 */
	get r(): number {
		return this[0];
	}
	set r(value: number) {
		this[0] = value;
	}

	/**
	 * The g component of the vector. Equivalent to `this[1];`
	 * @category Color components
	 */
	get g(): number {
		return this[1];
	}
	set g(value: number) {
		this[1] = value;
	}

	/**
	 * The magnitude (length) of this.
	 * Equivalent to `Vec2.magnitude(this);`
	 *
	 * Magnitude is used because the `length` attribute is already defined by
	 * `Float32Array` to mean the number of elements in the array.
	 */
	get magnitude(): number {
		return Math.hypot(this[0], this[1]);
	}
	/**
	 * Alias for {@link Vec2.magnitude}
	 */
	get mag(): number {
		return this.magnitude;
	}

	/**
	 * The squared magnitude (length) of `this`.
	 * Equivalent to `Vec2.squaredMagnitude(this);`
	 */
	get squaredMagnitude(): number {
		const x = this[0];
		const y = this[1];
		return x * x + y * y;
	}
	/**
	 * Alias for {@link Vec2.squaredMagnitude}
	 */
	get sqrMag(): number {
		return this.squaredMagnitude;
	}

	/**
	 * A string representation of `this`
	 * Equivalent to `Vec2.str(this);`
	 */
	get str(): string {
		return Vec2.str(this);
	}

	//===================
	// Instances methods
	//===================

	/**
	 * Copy the values from another {@link Vec2} into `this`.
	 *
	 * @param a the source vector
	 * @returns `this`
	 */
	copy(a: Readonly<Vec2Like>): Vec2 {
		this.copy(a);
		return this;
	}

	// Instead of zero(), use a.fill(0) for instances;

	/**
	 * Adds a {@link Vec2} to `this`.
	 * Equivalent to `Vec2.add(this, this, b);`
	 *
	 * @param b - The vector to add to `this`
	 * @returns `this`
	 */
	add(b: Readonly<Vec2Like>): Vec2 {
		this[0] += b[0];
		this[1] += b[1];
		return this;
	}

	/**
	 * Subtracts a {@link Vec2} from `this`.
	 * Equivalent to `Vec2.subtract(this, this, b);`
	 *
	 * @param b - The vector to subtract from `this`
	 * @returns `this`
	 */
	subtract(b: Readonly<Vec2Like>): Vec2 {
		this[0] -= b[0];
		this[1] -= b[1];
		return this;
	}
	/**
	 * Multiplies `this` by a {@link Vec2}.
	 * Equivalent to `Vec2.multiply(this, this, b);`
	 *
	 * @param b - The vector to multiply `this` by
	 * @returns `this`
	 */
	multiply(b: Readonly<Vec2Like>): Vec2 {
		this[0] *= b[0];
		this[1] *= b[1];
		return this;
	}

	/**
	 * Divides `this` by a {@link Vec2}.
	 * Equivalent to `Vec2.divide(this, this, b);`
	 *
	 * @param b - The vector to divide `this` by
	 * @returns {Vec2} `this`
	 */
	divide(b: Readonly<Vec2Like>): Vec2 {
		this[0] /= b[0];
		this[1] /= b[1];
		return this;
	}

	/**
	 * Scales `this` by a scalar number.
	 * Equivalent to `Vec2.scale(this, this, b);`
	 *
	 * @param b - Amount to scale `this` by
	 * @returns `this`
	 */
	scale(b: number): Vec2 {
		this[0] *= b;
		this[1] *= b;
		return this;
	}

	/**
	 * Calculates `this` scaled by a scalar value then adds the result to `this`.
	 * Equivalent to `Vec2.scaleAndAdd(this, this, b, scale);`
	 *
	 * @param b - The vector to add to `this`
	 * @param scale - The amount to scale `b` by before adding
	 * @returns `this`
	 */
	scaleAndAdd(b: Readonly<Vec2Like>, scale: number): Vec2 {
		this[0] += b[0] * scale;
		this[1] += b[1] * scale;
		return this;
	}

	/**
	 * Negates the components of `this`.
	 * Equivalent to `Vec2.negate(this, this);`
	 *
	 * @returns `this`
	 */
	negate(): Vec2 {
		this[0] *= -1;
		this[1] *= -1;
		return this;
	}

	/**
	 * Inverts the components of `this`.
	 * Equivalent to `Vec2.inverse(this, this);`
	 *
	 * @returns `this`
	 */
	invert(): Vec2 {
		this[0] = 1.0 / this[0];
		this[1] = 1.0 / this[1];
		return this;
	}

	//================
	// Static methods
	//================
	/**
	 * Creates a new {@link Vec2} initialized with values from an existing vector
	 * @category Static
	 *
	 * @param a - Vector to clone
	 * @returns A new 2D vector
	 */
	static clone(a: Readonly<Vec2Like>): Vec2 {
		return new Vec2(a);
	}

	/**
	 * Creates a new {@link Vec2} initialized with the given values
	 * @category Static
	 *
	 * @param x - X component
	 * @param y - Y component
	 * @returns A new 2D vector
	 */
	static fromValues(x: number, y: number): Vec2 {
		return new Vec2(x, y);
	}

	/**
	 * Copy the values from one {@link Vec2} to another
	 * @category Static
	 *
	 * @param out - the receiving vector
	 * @param a - The source vector
	 * @returns `out`
	 */
	static copy(out: Vec2Like, a: Readonly<Vec2Like>): Vec2Like {
		out[0] = a[0];
		out[1] = a[1];
		return out;
	}

	/**
	 * Math.ceil the components of a {@link Vec2}
	 *
	 * @returns `out`
	 */
	ceil(): Vec2Like {
		this[0] = Math.ceil(this[0]);
		this[1] = Math.ceil(this[1]);
		return this;
	}

	/**
	 * Math.floor the components of a {@link Vec2}
	 *
	 * @returns `out`
	 */
	floor(): Vec2 {
		this[0] = Math.floor(this[0]);
		this[1] = Math.floor(this[1]);
		return this;
	}

	/**
	 * Returns the minimum of two {@link Vec2}s
	 *
	 * @param b - The second operand
	 * @returns `out`
	 */
	min(b: Readonly<Vec2Like>): Vec2Like {
		const ret = <Vec2Like>structuredClone(this);
		ret[0] = Math.min(this[0], b[0]);
		ret[1] = Math.min(this[1], b[1]);
		return ret;
	}

	/**
	 * Returns the maximum of two {@link Vec2}s
	 *
	 * @param b - The second operand
	 * @returns `out`
	 */
	max(b: Readonly<Vec2Like>): Vec2Like {
		const ret = <Vec2Like>structuredClone(this);
		ret[0] = Math.max(this[0], b[0]);
		ret[1] = Math.max(this[1], b[1]);
		return ret;
	}

	/**
	 * Math.round the components of a {@link Vec2}
	 *
	 * @param out - The receiving vector
	 * @param a - Vector to round
	 * @returns `out`
	 */
	round(): Vec2Like {
		this[0] = Math.round(this[0]);
		this[1] = Math.round(this[1]);
		return this;
	}

	/**
	 * Calculates the euclidian distance between two {@link Vec2}s
	 *
	 * @param b - The second operand
	 * @returns distance between `a` and `b`
	 */
	distance(b: Readonly<Vec2Like>): number {
		return Math.hypot(b[0] - this[0], b[1] - this[1]);
	}

	/**
	 * Calculates the squared euclidian distance between two {@link Vec2}s
	 *
	 * @param b - The second operand
	 * @returns Squared distance between `a` and `b`
	 */
	squaredDistance(b: Readonly<Vec2Like>): number {
		const x = b[0] - this[0];
		const y = b[1] - this[1];
		return x * x + y * y;
	}

	/**
	 * Calculates the squared length of a {@link Vec2}
	 *
	 * @returns Squared length of a
	 */
	squaredLength(): number {
		const x = this[0];
		const y = this[1];
		return x * x + y * y;
	}

	/**
	 * Normalize a {@link Vec2}
	 *
	 * @returns `out`
	 */
	normalize(): Vec2Like {
		const x = this[0];
		const y = this[1];
		let len = x * x + y * y;
		if (len > 0) {
			//TODO: evaluate use of glm_invsqrt here?
			len = 1 / Math.sqrt(len);
		}
		this[0] = this[0] * len;
		this[1] = this[1] * len;
		return this;
	}

	/**
	 * Calculates the dot product of two {@link Vec2}s
	 *
	 * @param b - The second operand
	 * @returns Dot product of `a` and `b`
	 */
	dot(b: Readonly<Vec2Like>): number {
		return this[0] * b[0] + this[1] * b[1];
	}

	/**
	 * Computes the cross product of two {@link Vec2}s
	 * Note that the cross product must by definition produce a 3D vector.
	 * For this reason there is also not instance equivalent for this function.
	 *
	 * @param b - The second operand
	 * @returns `out`
	 */
	cross(b: Readonly<Vec2Like>): number {
		const z = this[0] * b[1] - this[1] * b[0];
		return z;
	}

	/**
	 * Performs a linear interpolation between two {@link Vec2}s
	 * @category Static
	 *
	 * @param out - The receiving vector
	 * @param a - The first operand
	 * @param b - The second operand
	 * @param t - Interpolation amount, in the range [0-1], between the two inputs
	 * @returns `out`
	 */
	static lerp(a: Readonly<Vec2Like>, b: Readonly<Vec2Like>, t: number): Vec2 {
		const ret = new Vec2();
		const ax = a[0];
		const ay = a[1];
		ret[0] = ax + t * (b[0] - ax);
		ret[1] = ay + t * (b[1] - ay);
		return ret;
	}

	/**
	 * Rotate a 2D vector
	 *
	 * @param b - The origin of the rotation
	 * @param rad - The angle of rotation in radians
	 * @returns `out`
	 */
	rotate(b: Readonly<Vec2Like>, rad: number): Vec2Like {
		//Translate point to the origin
		const p0 = this[0] - b[0];
		const p1 = this[1] - b[1];
		const sinC = Math.sin(rad);
		const cosC = Math.cos(rad);

		//perform rotation and translate to correct position
		this[0] = p0 * cosC - p1 * sinC + b[0];
		this[1] = p0 * sinC + p1 * cosC + b[1];

		return this;
	}

	/**
	 * Get the angle between two 2D vectors
	 *
	 * @param a - The first operand
	 * @param b - The second operand
	 * @returns The angle in radians
	 */
	angle(b: Readonly<Vec2Like>): number {
		const x1 = this[0];
		const y1 = this[1];
		const x2 = b[0];
		const y2 = b[1];
		// mag is the product of the magnitudes of a and b
		const mag = Math.sqrt(x1 * x1 + y1 * y1) * Math.sqrt(x2 * x2 + y2 * y2);
		// mag &&.. short circuits if mag == 0
		const cosine = mag && (x1 * x2 + y1 * y2) / mag;
		// Math.min(Math.max(cosine, -1), 1) clamps the cosine between -1 and 1
		return Math.acos(Math.min(Math.max(cosine, -1), 1));
	}

	/**
	 * Set to zero vector
	 *
	 * @returns ``
	 */
	zero(): Vec2Like {
		this[0] = 0.0;
		this[1] = 0.0;
		return this;
	}

	/**
	 * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
	 *
	 * @param b - The second vector.
	 * @returns `true` if the vectors components are ===, `false` otherwise.
	 */
	exactEquals(b: Readonly<Vec2Like>): boolean {
		return this[0] === b[0] && this[1] === b[1];
	}

	/**
	 * Returns whether or not the vectors have approximately the same elements in the same position.
	 *
	 * @param b - The second vector.
	 * @returns `true` if the vectors are approximately equal, `false` otherwise.
	 */
	equals(b: Readonly<Vec2Like>): boolean {
		const a0 = this[0];
		const a1 = this[1];
		const b0 = b[0];
		const b1 = b[1];
		return (
			Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
			Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1))
		);
	}

	/**
	 * Returns a string representation of a vector
	 *
	 * @param a - Vector to represent as a string
	 * @returns String representation of the vector
	 */
	static str(a: Readonly<Vec2Like>): string {
		return `Vec2(${a.join(", ")})`;
	}
}
