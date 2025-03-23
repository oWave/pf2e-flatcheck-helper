// @ts-nocheck

/**
 * Foundry's built in OutlineOverlayFilter doesn't work with knockout set to false
 * This is the @pixijs/outline-filter version and the built in one stitched together
 * https://github.com/pixijs/filters/tree/v5.x/filters/outline
 * @license MIT
 */
export class OutlineOverlayFilterCustom extends AbstractBaseFilter {
	/** @override */
	padding = 3

	/** @override */
	autoFit = false

	/** @inheritdoc */
	static defaultUniforms = {
		outlineColor: [1, 1, 1, 1],
		thickness: [1, 1],
	}

	/** @override */
	static vertexShader = `
  attribute vec2 aVertexPosition;

  uniform mat3 projectionMatrix;
  uniform vec2 screenDimensions;
  uniform vec4 inputSize;
  uniform vec4 outputFrame;

  varying vec2 vTextureCoord;
  varying vec2 vFilterCoord;

  vec4 filterVertexPosition( void ) {
      vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;
      return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0., 1.);
  }

  // getting normalized coord for the tile texture
  vec2 filterTextureCoord( void ) {
      return aVertexPosition * (outputFrame.zw * inputSize.zw);
  }

  // getting normalized coord for a screen sized mask render texture
  vec2 filterCoord( in vec2 textureCoord ) {
    return textureCoord * inputSize.xy / outputFrame.zw;
  }

  void main() {
    vTextureCoord = filterTextureCoord();
    vFilterCoord = filterCoord(vTextureCoord);
    gl_Position = filterVertexPosition();
  }`

	/**
	 * Dynamically create the fragment shader used for filters of this type.
	 * @returns {string}
	 */
	static createFragmentShader() {
		return `
    varying vec2 vTextureCoord;
    varying vec2 vFilterCoord;
    uniform sampler2D uSampler;

    uniform vec2 thickness;
    uniform vec4 outlineColor;
    uniform vec4 filterClamp;
    uniform float time;
		uniform bool knockout;
    uniform bool wave;

    ${this.CONSTANTS}

		float outlineMaxAlphaAtPos(vec2 pos) {
			if (thickness.x == 0. || thickness.y == 0.) {
				return 0.;
			}

			vec4 displacedColor;
			vec2 displacedPos;
			float maxAlpha = 0.;

			for (float angle = 0.; angle <= TWOPI; angle += ${this.#quality.toFixed(7)}) {
				displacedPos.x = vTextureCoord.x + thickness.x * cos(angle);
				displacedPos.y = vTextureCoord.y + thickness.y * sin(angle);
				displacedColor = texture2D(uSampler, clamp(displacedPos, filterClamp.xy, filterClamp.zw));
				maxAlpha = max(maxAlpha, displacedColor.a);
			}

			return maxAlpha;
		}

		void main(void) {
			vec4 sourceColor = texture2D(uSampler, vTextureCoord);
			vec4 contentColor = sourceColor * float(!knockout);
			float outlineAlpha = outlineMaxAlphaAtPos(vTextureCoord.xy) * (1.-sourceColor.a);
			vec4 outline = vec4(vec3(outlineColor) * outlineAlpha, outlineAlpha);
			gl_FragColor = contentColor + outline;
		}

    `
	}

	/* -------------------------------------------- */

	/**
	 * Quality of the outline according to performance mode.
	 * @returns {number}
	 */
	static get #quality() {
		switch (canvas.performance.mode) {
			case CONST.CANVAS_PERFORMANCE_MODES.LOW:
				return (Math.PI * 2) / 10
			case CONST.CANVAS_PERFORMANCE_MODES.MED:
				return (Math.PI * 2) / 20
			default:
				return (Math.PI * 2) / 30
		}
	}

	/* -------------------------------------------- */

	/**
	 * The thickness of the outline.
	 * @type {number}
	 */
	get thickness() {
		return this.#thickness
	}

	set thickness(value) {
		this.#thickness = value
		this.padding = value * 1.5
	}

	#thickness = 3

	/* -------------------------------------------- */

	/** @inheritdoc */
	static create(initialUniforms = {}) {
		const uniforms = { ...this.defaultUniforms, ...initialUniforms }
		return new this(this.vertexShader, this.createFragmentShader(), uniforms)
	}

	/* -------------------------------------------- */

	/** @override */
	apply(filterManager, input, output, clear) {
		const thickness = this.#thickness * canvas.stage.scale.x
		this.uniforms.thickness[0] = thickness / input._frame.width
		this.uniforms.thickness[1] = thickness / input._frame.height
		filterManager.applyFilter(this, input, output, clear)
	}
}
