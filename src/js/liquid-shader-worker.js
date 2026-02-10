/**
 * PATA Liquid Shader Web Worker
 * Runs WebGL shader rendering in a separate thread using OffscreenCanvas
 * Zero impact on main thread for smooth scrolling and interactions
 */

let gl, program, uniforms, startTime;
let mouseX = 0.5, mouseY = 0.5;
let animationId = null;

const brandColors = {
  blue: [44/255, 101/255, 147/255],
  darkOrange: [219/255, 93/255, 35/255],
  lightOrange: [255/255, 200/255, 129/255]
};

self.onmessage = function(e) {
  const { type, canvas, width, height, x, y } = e.data;

  switch(type) {
    case 'init':
      initShader(canvas);
      break;
    case 'resize':
      resizeCanvas(width, height);
      break;
    case 'mouse':
      mouseX = x;
      mouseY = y;
      break;
    case 'destroy':
      if (animationId) cancelAnimationFrame(animationId);
      animationId = null;
      break;
  }
};

function initShader(canvas) {
  gl = canvas.getContext('webgl');
  if (!gl) {
    self.postMessage({ type: 'error', message: 'WebGL not supported' });
    return;
  }

  startTime = Date.now();
  createShaderProgram();
  setupUniforms();
  setupGeometry();
  animate();

  self.postMessage({ type: 'ready' });
}

function createShaderProgram() {
  const vertexShaderSource = `
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const fragmentShaderSource = `
    precision mediump float;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform vec2 u_mouse;
    uniform vec3 u_color1;
    uniform vec3 u_color2;
    uniform vec3 u_color3;

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      float mouseInfluence = distance(uv, u_mouse);
      mouseInfluence = 1.0 - smoothstep(0.0, 0.5, mouseInfluence);
      float d = -u_time * 0.5 + mouseInfluence * 2.0;
      float a = 0.0;
      for (float i = 0.0; i < 5.0; i += 1.0) {
        a += cos(i - d - a * uv.x + mouseInfluence);
        d += sin(uv.y * i + a);
      }
      d += u_time * 0.5;
      float mix1 = sin(d + a) * 0.5 + 0.5;
      float mix2 = cos(d - a) * 0.5 + 0.5;
      vec3 brightOrange1 = u_color2 * 1.3;
      vec3 brightOrange2 = u_color3 * 1.4;
      vec3 tempColor = mix(u_color1, brightOrange1, mix1 * 0.4);
      vec3 finalColor = mix(tempColor, brightOrange2, mix2 * 0.3);
      finalColor = finalColor * 0.75;
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
  const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

  program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    self.postMessage({ type: 'error', message: 'Shader program failed to link' });
    return;
  }
  gl.useProgram(program);
}

function compileShader(source, type) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    self.postMessage({ type: 'error', message: 'Shader compilation error' });
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function setupUniforms() {
  uniforms = {
    resolution: gl.getUniformLocation(program, 'u_resolution'),
    time: gl.getUniformLocation(program, 'u_time'),
    mouse: gl.getUniformLocation(program, 'u_mouse'),
    color1: gl.getUniformLocation(program, 'u_color1'),
    color2: gl.getUniformLocation(program, 'u_color2'),
    color3: gl.getUniformLocation(program, 'u_color3')
  };
  gl.uniform3fv(uniforms.color1, brandColors.blue);
  gl.uniform3fv(uniforms.color2, brandColors.darkOrange);
  gl.uniform3fv(uniforms.color3, brandColors.lightOrange);
}

function setupGeometry() {
  const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  const positionLocation = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
}

function resizeCanvas(width, height) {
  if (gl) {
    gl.canvas.width = width;
    gl.canvas.height = height;
    gl.viewport(0, 0, width, height);
  }
}

function animate() {
  animationId = requestAnimationFrame(animate);

  const currentTime = (Date.now() - startTime) * 0.001;

  gl.uniform2f(uniforms.resolution, gl.canvas.width, gl.canvas.height);
  gl.uniform1f(uniforms.time, currentTime);
  gl.uniform2f(uniforms.mouse, mouseX, mouseY);

  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
