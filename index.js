function webGL() {
  let gl, shaderProgram;
  gl = initializeWebGL(gl);
  if (!gl) {
    alert("Your browser does not support WebGL");
    return;
  }

  gl.clearColor(0, 0, 0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  const triangleVertices = [
    -0.3,
    0.7,
    0.0, // top left (0)
    0.3,
    0.7,
    0.0, // top right (1)
    0.0,
    0.0,
    0.0, // middle (2)
    0.3,
    -0.7,
    0.0, // bottom right (3)
    -0.3,
    -0.7,
    0.0, // bottom left (4)
  ];

  const indices = [0, 1, 2, 2, 3, 4];

  let rectVBO = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, rectVBO);

  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(triangleVertices),
    gl.STATIC_DRAW
  );

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

  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
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
