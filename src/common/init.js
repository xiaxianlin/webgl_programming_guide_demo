export function getContext(type) {
    let canvas = document.getElementById('main')
    if (!canvas) {
        throw 'canvas is missing'
    }
    let ctx = canvas.getContext(type)
    if (!ctx) {
        throw 'context is missing'
    }
    return ctx
}

export function get2D() {
    return getContext('2d')
}

export function getGL(vertexShaderId = 'vertexShader', fragmentShaderId = 'fragmentShader') {
    let gl = getContext('webgl')
    let program = initShaders(gl, vertexShaderId, fragmentShaderId)
    gl.useProgram(program)
    gl.program = program
    return gl
}

export function initShaders(gl, vertexShaderId, fragmentShaderId) {
    let vertShdr
    let fragShdr

    let vertElem = document.getElementById(vertexShaderId)
    if (!vertElem) {
        console.error('Unable to load vertex shader ' + vertexShaderId)
        return
    }
    vertShdr = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vertShdr, vertElem.text)
    gl.compileShader(vertShdr)
    if (!gl.getShaderParameter(vertShdr, gl.COMPILE_STATUS)) {
        console.error('Vertex shader failed to compile.  The error log is:', gl.getShaderInfoLog(vertShdr))
        return
    }

    let fragElem = document.getElementById(fragmentShaderId)
    if (!fragElem) {
        console.error('Unable to load vertex shader ' + fragmentShaderId)
        return
    }
    fragShdr = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fragShdr, fragElem.text)
    gl.compileShader(fragShdr)
    if (!gl.getShaderParameter(fragShdr, gl.COMPILE_STATUS)) {
        console.error('Fragment shader failed to compile.  The error log is:', gl.getShaderInfoLog(fragShdr))
        return
    }

    let program = gl.createProgram()
    gl.attachShader(program, vertShdr)
    gl.attachShader(program, fragShdr)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Shader program failed to link.  The error log is:', gl.getProgramInfoLog(program))
        return
    }
    return program
}
