import { EPSILON } from "./common.js";

/**
 * A 3 dimensional vector given as a {@link Vec3}, a 3-element Float32Array, or
 * an array of 3 numbers.
 */
export type Vec3Like = [number, number, number] | Float32Array;

/**
 * 3 Dimensional Vector
 */
export class Vec3 extends Float32Array {
	/**
	 * The number of bytes in a {@link Vec3}.
	 */
	static readonly BYTE_LENGTH = 3 * Float32Array.BYTES_PER_ELEMENT;

	/**
	 * Create a {@link Vec3}.
	 */
	constructor(...values: [Readonly<Vec3Like> | ArrayBufferLike, number?] | number[]) {
		switch (values.length) {
			case 3:
				super(values);
				break;
			case 2:
				super(values[0] as ArrayBufferLike, values[1], 3);
				break;
			case 1: {
				const v = values[0];
				if (typeof v === "number") {
					super([v, v, v]);
				} else {
					super(v as ArrayBufferLike, 0, 3);
				}
				break;
			}
			default:
				super(3);
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

	/**
	 * The z component of the vector. Equivalent to `this[2];`
	 * @category Vector components
	 */
	get z(): number {
		return this[2];
	}
	set z(value: number) {
		this[2] = value;
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
	 * The b component of the vector. Equivalent to `this[2];`
	 * @category Color components
	 */
	get b(): number {
		return this[2];
	}
	set b(value: number) {
		this[2] = value;
	}

	/**
	 * The magnitude (length) of this.
	 * Equivalent to `Vec3.magnitude(this);`
	 *
	 * Magnitude is used because the `length` attribute is already defined by
	 * `Float32Array` to mean the number of elements in the array.
	 */
	get magnitude(): number {
		const x = this[0];
		const y = this[1];
		const z = this[2];
		return Math.sqrt(x * x + y * y + z * z);
	}
	/**
	 * Alias for {@link Vec3.magnitude}
	 */
	get mag(): number {
		return this.magnitude;
	}

	/**
	 * The squared magnitude (length) of `this`.
	 * Equivalent to `Vec3.squaredMagnitude(this);`
	 */
	get squaredMagnitude(): number {
		const x = this[0];
		const y = this[1];
		const z = this[2];
		return x * x + y * y + z * z;
	}
	/**
	 * Alias for {@link Vec3.squaredMagnitude}
	 */
	get sqrMag(): number {
		return this.squaredMagnitude;
	}

	/**
	 * A string representation of `this`
	 * Equivalent to `Vec3.str(this);`
	 */
	get str(): string {
		return Vec3.str(this);
	}

	//===================
	// Instances methods
	//===================

	/**
	 * Copy the values from another {@link Vec3} into `this`.
	 *
	 * @param a the source vector
	 * @returns `this`
	 */
	copy(a: Readonly<Vec3Like>): Vec3 {
		this.setTo(a[0], a[1], a[2]);
		return this;
	}

	/**
	 * Adds a {@link Vec3} to `this`.
	 * Equivalent to `Vec3.add(this, this, b);`
	 *
	 * @param b - The vector to add to `this`
	 * @returns `this`
	 */
	add(b: Readonly<Vec3Like>): Vec3 {
		this[0] += b[0];
		this[1] += b[1];
		this[2] += b[2];
		return this;
	}

	/**
	 * Subtracts a {@link Vec3} from `this`.
	 * Equivalent to `Vec3.subtract(this, this, b);`
	 *
	 * @param b - The vector to subtract from `this`
	 * @returns `this`
	 */
	subtract(b: Readonly<Vec3Like>): Vec3 {
		this[0] -= b[0];
		this[1] -= b[1];
		this[2] -= b[2];
		return this;
	}

	/**
	 * Multiplies `this` by a {@link Vec3}.
	 * Equivalent to `Vec3.multiply(this, this, b);`
	 *
	 * @param b - The vector to multiply `this` by
	 * @returns `this`
	 */
	multiply(b: Readonly<Vec3Like>): Vec3 {
		this[0] *= b[0];
		this[1] *= b[1];
		this[2] *= b[2];
		return this;
	}

	/**
	 * Divides `this` by a {@link Vec3}.
	 * Equivalent to `Vec3.divide(this, this, b);`
	 *
	 * @param b - The vector to divide `this` by
	 * @returns `this`
	 */
	divide(b: Readonly<Vec3Like>): Vec3 {
		this[0] /= b[0];
		this[1] /= b[1];
		this[2] /= b[2];
		return this;
	}

	/**
	 * Scales `this` by a scalar number.
	 * Equivalent to `Vec3.scale(this, this, b);`
	 *
	 * @param b - Amount to scale `this` by
	 * @returns `this`
	 */
	scale(b: number): Vec3 {
		this[0] *= b;
		this[1] *= b;
		this[2] *= b;
		return this;
	}

	/**
	 * Calculates `this` scaled by a scalar value then adds the result to `this`.
	 * Equivalent to `Vec3.scaleAndAdd(this, this, b, scale);`
	 *
	 * @param b - The vector to add to `this`
	 * @param scale - The amount to scale `b` by before adding
	 * @returns `this`
	 */
	scaleAndAdd(b: Readonly<Vec3Like>, scale: number): Vec3 {
		this[0] += b[0] * scale;
		this[1] += b[1] * scale;
		this[2] += b[2] * scale;
		return this;
	}

	/**
	 * Negates the components of `this`.
	 * Equivalent to `Vec3.negate(this, this);`
	 *
	 * @returns `this`
	 */
	negate(): Vec3 {
		this[0] *= -1;
		this[1] *= -1;
		this[2] *= -1;
		return this;
	}

	/**
	 * Inverts the components of `this`.
	 * Equivalent to `Vec3.inverse(this, this);`
	 *
	 * @returns `this`
	 */
	invert(): Vec3 {
		this[0] = 1.0 / this[0];
		this[1] = 1.0 / this[1];
		this[2] = 1.0 / this[2];
		return this;
	}

	/**
	 * Calculates the dot product of this and another {@link Vec3}.
	 * Equivalent to `Vec3.dot(this, b);`
	 *
	 * @param b - The second operand
	 * @returns Dot product of `this` and `b`
	 */
	dot(b: Readonly<Vec3Like>): number {
		return this[0] * b[0] + this[1] * b[1] + this[2] * b[2];
	}

	//================
	// Static methods
	//================

	/**
	 * Creates a new, empty vec3
	 * @category Static
	 *
	 * @returns a new 3D vector
	 */
	static create(): Vec3 {
		return new Vec3();
	}

	/**
	 * Creates a new vec3 initialized with values from an existing vector
     * 
	 * @returns a new 3D vector
	 */
	clone(): Vec3 {
		return new Vec3(this);
	}
	/**
	 * Creates a new vec3 initialized with the given values
	 * @category Static
	 *
	 * @param x - X component
	 * @param y - Y component
	 * @param z - Z component
	 * @returns a new 3D vector
	 */
	static fromValues(x: number, y: number, z: number): Vec3 {
		return new Vec3(x, y, z);
	}

	/**
	 * Set the components of a vec3 to the given values
	 *
	 * @param x - X component
	 * @param y - Y component
	 * @param z - Z component
	 * @returns `out`
	 */
	setTo(x: number, y: number, z: number): Vec3 {
		this[0] = x;
		this[1] = y;
		this[2] = z;
		return this;
	}

	/**
	 * Math.ceil the components of a vec3
	 *
	 * @returns `out`
	 */
	ceil(): Vec3Like {
		this[0] = Math.ceil(this[0]);
		this[1] = Math.ceil(this[1]);
		this[2] = Math.ceil(this[2]);
		return this;
	}

	/**
	 * Math.floor the components of a vec3
	 *
	 * @returns `out`
	 */
	floor(): Vec3Like {
		this[0] = Math.floor(this[0]);
		this[1] = Math.floor(this[1]);
		this[2] = Math.floor(this[2]);
		return this;
	}

	/**
	 * Returns the minimum of two vec3's
	 *
	 * @param b - the second operand
	 * @returns `out`
	 */
	min(b: Readonly<Vec3Like>): Vec3 {
		this[0] = Math.min(this[0], b[0]);
		this[1] = Math.min(this[1], b[1]);
		this[2] = Math.min(this[2], b[2]);
		return this;
	}

	/**
	 * Returns the maximum of two vec3's
	 *
	 * @param b - the second operand
	 * @returns `out`
	 */
	max(b: Readonly<Vec3Like>): Vec3 {
		this[0] = Math.max(this[0], b[0]);
		this[1] = Math.max(this[1], b[1]);
		this[2] = Math.max(this[2], b[2]);
		return this;
	}

	/**
	 * symmetric round the components of a vec3
	 * @category Static
	 *
	 * @param out - the receiving vector
	 * @param a - vector to round
	 * @returns `out`
	 */
	/*static round(, ): Vec3Like {
    this[0] = glMatrix.round(this[0]);
    this[1] = glMatrix.round(this[1]);
    this[2] = glMatrix.round(this[2]);
    return this;
  }*/

	/**
	 * Calculates the euclidian distance between two vec3's
	 *
	 * @param b - the second operand
	 * @returns distance between a and b
	 */
	distance(b: Readonly<Vec3Like>): number {
		const x = b[0] - this[0];
		const y = b[1] - this[1];
		const z = b[2] - this[2];
		return Math.sqrt(x * x + y * y + z * z);
	}

	/**
	 * Calculates the squared euclidian distance between two vec3's
	 *
	 * @param b - the second operand
	 * @returns squared distance between a and b
	 */
	squaredDistance(b: Readonly<Vec3Like>): number {
		const x = b[0] - this[0];
		const y = b[1] - this[1];
		const z = b[2] - this[2];
		return x * x + y * y + z * z;
	}

	/**
	 * Calculates the squared length of a vec3
	 *
	 * @returns squared length of a
	 */
	squaredLength(): number {
		const x = this[0];
		const y = this[1];
		const z = this[2];
		return x * x + y * y + z * z;
	}

	/**
	 * Returns the inverse of the components of a vec3
	 *
	 * @returns `out`
	 */
	inverse(): Vec3 {
		this[0] = 1.0 / this[0];
		this[1] = 1.0 / this[1];
		this[2] = 1.0 / this[2];
		return this;
	}

	/**
	 * Normalize a vec3
	 *
	 * @returns `out`
	 */
	normalize(): Vec3 {
		const x = this[0];
		const y = this[1];
		const z = this[2];
		let len = x * x + y * y + z * z;
		if (len > 0) {
			//TODO: evaluate use of glm_invsqrt here?
			len = 1 / Math.sqrt(len);
		}
		this[0] = this[0] * len;
		this[1] = this[1] * len;
		this[2] = this[2] * len;
		return this;
	}

	/**
	 * Computes the cross product of two vec3's
	 *
	 * @param b - the second operand
	 * @returns `out`
	 */
	cross(b: Readonly<Vec3Like>): Vec3 {
		const ax = this[0],
			ay = this[1],
			az = this[2];
		const bx = b[0],
			by = b[1],
			bz = b[2];

		this[0] = ay * bz - az * by;
		this[1] = az * bx - ax * bz;
		this[2] = ax * by - ay * bx;
		return this;
	}

	/**
	 * Generates a random vector with the given scale
	 * @category Static
	 *
	 * @param out - the receiving vector
	 * @param {Number} [scale] Length of the resulting vector. If omitted, a unit vector will be returned
	 * @returns `out`
	 */
	/*static random(, scale) {
    scale = scale === undefined ? 1.0 : scale;

    let r = glMatrix.RANDOM() * 2.0 * Math.PI;
    let z = glMatrix.RANDOM() * 2.0 - 1.0;
    let zScale = Math.sqrt(1.0 - z * z) * scale;

    this[0] = Math.cos(r) * zScale;
    this[1] = Math.sin(r) * zScale;
    this[2] = z * scale;
    return this;
  }*/

	/**
	 * Rotate a 3D vector around the x-axis
	 *
	 * @param b - The origin of the rotation
	 * @param rad - The angle of rotation in radians
	 * @returns `out`
	 */
	rotateX(b: Readonly<Vec3Like>, rad: number): Vec3 {
		const by = b[1];
		const bz = b[2];

		//Translate point to the origin
		const py = this[1] - by;
		const pz = this[2] - bz;

		//perform rotation
		//translate to correct position
		this[1] = py * Math.cos(rad) - pz * Math.sin(rad) + by;
		this[2] = py * Math.sin(rad) + pz * Math.cos(rad) + bz;

		return this;
	}

	/**
	 * Rotate a 3D vector around the y-axis
	 *
	 * @param b - The origin of the rotation
	 * @param rad - The angle of rotation in radians
	 * @returns `out`
	 */
	rotateY(b: Readonly<Vec3Like>, rad: number): Vec3 {
		const bx = b[0];
		const bz = b[2];

		//Translate point to the origin
		const px = this[0] - bx;
		const pz = this[2] - bz;

		//perform rotation
		//translate to correct position
		this[0] = pz * Math.sin(rad) + px * Math.cos(rad) + bx;
		this[2] = pz * Math.cos(rad) - px * Math.sin(rad) + bz;

		return this;
	}

	/**
	 * Rotate a 3D vector around the z-axis
	 *
	 * @param b - The origin of the rotation
	 * @param rad - The angle of rotation in radians
	 * @returns `out`
	 */
	rotateZ(b: Readonly<Vec3Like>, rad: number): Vec3 {
		const bx = b[0];
		const by = b[1];

		//Translate point to the origin
		const px = this[0] - bx;
		const py = this[1] - by;

		//perform rotation
		//translate to correct position
		this[0] = px * Math.cos(rad) - py * Math.sin(rad) + bx;
		this[1] = px * Math.sin(rad) + py * Math.cos(rad) + by;
		this[2] = b[2];

		return this;
	}

	/**
	 * Get the angle between two 3D vectors
	 *
	 * @param b - The second operand
	 * @returns The angle in radians
	 */
	angle(b: Readonly<Vec3Like>) {
		const ax = this[0];
		const ay = this[1];
		const az = this[2];
		const bx = b[0];
		const by = b[1];
		const bz = b[2];
		const mag = Math.sqrt((ax * ax + ay * ay + az * az) * (bx * bx + by * by + bz * bz));
		const cosine = mag && this.dot(b) / mag;
		return Math.acos(Math.min(Math.max(cosine, -1), 1));
	}

	/**
	 * Set the components of a vec3 to zero
	 *
	 * @returns `out`
	 */
	zero(): Vec3Like {
		this[0] = 0.0;
		this[1] = 0.0;
		this[2] = 0.0;
		return this;
	}

	/**
	 * Returns a string representation of a vector
	 * @category Static
	 *
	 * @param a - vector to represent as a string
	 * @returns string representation of the vector
	 */
	static str(a: Readonly<Vec3Like>): string {
		return `Vec3(${a.join(", ")})`;
	}

	/**
	 * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
	 * @category Static
	 *
	 * @param a - The first vector.
	 * @param b - The second vector.
	 * @returns True if the vectors are equal, false otherwise.
	 */
	exactEquals(b: Readonly<Vec3Like>): boolean {
		return this[0] === b[0] && this[1] === b[1] && this[2] === b[2];
	}

	/**
	 * Returns whether or not the vectors have approximately the same elements in the same position.
	 * @category Static
	 *
	 * @param a - The first vector.
	 * @param b - The second vector.
	 * @returns True if the vectors are equal, false otherwise.
	 */
	equals(b: Readonly<Vec3Like>): boolean {
		const a0 = this[0];
		const a1 = this[1];
		const a2 = this[2];
		const b0 = b[0];
		const b1 = b[1];
		const b2 = b[2];
		return (
			Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
			Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
			Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2))
		);
	}
}
