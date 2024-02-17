function webGL() {
  let gl, shaderProgram;
  gl = initializeWebGL(gl);
  if (!gl) {
    alert("Your browser does not support WebGL");
    return;
  }

  gl.clearColor(0, 0, 0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  const foxVertices = [
    -0.175, // A (X)
    0.6, // A (Y)
    0.0, // A (Z)
    -0.1, // B (X)
    0.5, // B (Y)
    0.0, // B (Z)
    -0.18, // C (X)
    0.4, // C (Y)
    0.0, // C (Z)
    -0.025, // D (X)
    0.6, // D (Y)
    0.0, // D (Z)
    -0.02, // E (X)
    0.4, // E (Y)
    0.0, // E (Z)
    -0.1, // F (X)
    0.25, // F (Y)
    0.0, // F (Z)
    -0.06, // G (X)
    0.325, // G (Y)
    0.0, // G (Z),
    -0.18, // H (X)
    0.1, // H (Y)
    0.0, // H (Z)
    0.1, // I (X)
    0.0, // I (Y)
    0.0, // I (Z)
    -0.06, // J (X)
    -0.1, // J (Y)
    0.0, // J (Z)
    -0.06, // K (X)
    -0.25, // K (Y)
    0.0, // K (Z),
    0.04, // L (X)
    -0.1, // L (Y)
    0.0, // L (Z)
    -0.16, // M (X)
    -0.4, // M (Y)
    0.0, // M (Z)
    0.04, // N (X)
    -0.4, // N (Y)
    0.0, // N (Z)
    0.15, // O (X)
    -0.25, // O (Y)
    0.0, // O (Z)
    0.125, // P (X)
    -0.4, // P (Y)
    0.0, // P (Z)
    0.25, // Q (X)
    -0.25, // Q (Y)
    0.0, // Q (Z)
  ];

  /**
   * A: 0
   * B: 1
   * C: 2
   * D: 3
   * E: 4
   * F: 5
   * G: 6
   * H: 7
   * I: 8
   * J: 9
   * K: 10
   * L: 11
   * M: 12
   * N: 13
   * O: 14
   * P: 15
   * Q: 16
   */
  // Line Segment Indices
  /**
   * AB: 0, 1
   * BC: 1, 2
   * AC: 0, 2
   * BD: 1, 3
   * BE: 1, 4
   * DE: 3, 4
   * EF: 4, 5
   * CF: 2, 5
   * CE: 2, 4
   * GH: 6, 7
   * GI: 6, 8
   * HJ: 7, 9
   * GK: 6, 10
   * KI: 10, 8,
   * ML: 12, 11
   * MN: 12, 13
   * LN: 11, 13
   * NO: 13, 14
   * NP: 13, 15
   * OP: 14, 15
   * OQ: 14, 16
   * PQ: 15, 16
   */
  const indices = [
    0, 1, 1, 2, 0, 2, 1, 3, 1, 4, 3, 4, 4, 5, 2, 5, 2, 4, 6, 7, 6, 8, 7, 9, 6,
    10, 10, 8, 12, 11, 12, 13, 11, 13, 13, 14, 13, 15, 14, 15, 14, 16, 15, 16,
  ];
  let rectVBO = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, rectVBO);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(foxVertices), gl.STATIC_DRAW);

  let rectIBO = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rectIBO);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );

  shaderProgram = getShaderProgram(gl);
  gl.useProgram(shaderProgram);

  const positionAttribLocation = gl.getAttribLocation(
    shaderProgram,
    "geometryCoordinatesGPU"
  );

  gl.enableVertexAttribArray(positionAttribLocation);
  gl.vertexAttribPointer(
    positionAttribLocation, //attribute location, pointer to be used to access the VBO
    3, // number of elements per attribute (x, y, z) for each attribute (vertex position in this case)
    gl.FLOAT, // type of elements
    gl.FALSE, // is data "normalized" <- what does that mean?
    3 * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
    0 // offset from the beginning of a single vertex to this attribute
  );

  gl.drawElements(gl.LINES, indices.length, gl.UNSIGNED_SHORT, 0);
}

function initializeWebGL(gl) {
  let canvas = document.getElementById("glCanvas");
  gl = canvas.getContext("webgl2");
  return gl;
}

function getShaderProgram(gl) {
  const vertexShaderText = `# version 300 es
    # pragma vscode_glslint_stage: vert
    in vec3 geometryCoordinatesGPU; 
    void main() {
      gl_Position = vec4(geometryCoordinatesGPU, 1.0);
    }
  `;

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderText);

  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error(
      "ERROR compiling vertex shader!",
      gl.getShaderInfoLog(vertexShader)
    );
    return;
  }

  const fragmentShaderText = `# version 300 es
    # pragma vscode_glslint_stage:
    precision mediump float; out vec4 fragColor; void main() {
      fragColor = vec4(1.0, 0.5, 0.5, 1.0);
    }
  `;

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderText);

  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error(
      "ERROR compiling fragment shader!",
      gl.getShaderInfoLog(fragmentShader)
    );
    return;
  }

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);

  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error(
      "ERROR linking program!",
      gl.getProgramInfoLog(shaderProgram)
    );
    return;
  }

  gl.validateProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.VALIDATE_STATUS)) {
    console.error(
      "ERROR validating program!",
      gl.getProgramInfoLog(shaderProgram)
    );
    return;
  }

  return shaderProgram;
}
