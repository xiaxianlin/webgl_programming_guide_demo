import { getGL } from '../common/init'
import { vec3 } from '../common/math'
import { setLookAt, flatten } from '../common/utils'
import { Matrix4 } from '../common/matrix'

const vertices = [
    vec3(0.0, 0.5, -0.4),
    vec3(-0.5, -0.5, -0.4),
    vec3(0.5, -0.5, -0.4),

    vec3(0.5, 0.4, -0.2),
    vec3(-0.5, 0.4, -0.2),
    vec3(0.0, -0.6, -0.2),

    vec3(0.0, 0.5, 0.0),
    vec3(-0.5, -0.5, 0.0),
    vec3(0.5, -0.6, 0.0)
]

const colors = [
    vec3(0.4, 1.0, 0.4),
    vec3(0.4, 1.0, 0.4),
    vec3(1.0, 0.4, 0.4),

    vec3(1.0, 0.4, 0.4),
    vec3(1.0, 1.0, 0.4),
    vec3(1.0, 1.0, 0.4),

    vec3(0.4, 0.4, 1.0),
    vec3(0.4, 0.4, 1.0),
    vec3(1.0, 0.4, 0.4)
]

const eye = {
    x: 0.2,
    y: 0.25,
    z: 0.25
}

function initVertexBuffers(gl) {
    let positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW)
    let positionLoc = gl.getAttribLocation(gl.program, 'a_Position')
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(positionLoc)

    let colorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW)
    let colorLoc = gl.getAttribLocation(gl.program, 'a_Color')
    gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(colorLoc)
}

function keydown(ev, gl, matrixLoc, matrix) {
    switch (ev.keyCode) {
        case 37:
            eye.x -= 0.01
            break
        case 38:
            eye.y -= 0.01
            break
        case 39:
            eye.x += 0.01
            break
        case 40:
            eye.y += 0.01
            break
        default:
            return
    }
    draw(gl, matrixLoc, matrix)
}

function draw(gl, matrixLoc, matrix) {
    matrix.setLookAt(eye.x, eye.y, eye.z, 0, 0, 0, 0, 1, 0)
    gl.uniformMatrix4fv(matrixLoc, false, matrix.elements)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length)
}

function main() {
    let gl = getGL()
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    initVertexBuffers(gl)

    let matrixLoc = gl.getUniformLocation(gl.program, 'u_ViewMatrix')
    let matrix = new Matrix4()
    document.onkeydown = (ev) => keydown(ev, gl, matrixLoc, matrix)

    let projMatrixLoc = gl.getUniformLocation(gl.program, 'u_ProjMatrix')
    let projMatrix = new Matrix4()
    projMatrix.setOrtho(-1.0, 1.0, -1.0, 1.0, 0.0, 2.0)
    gl.uniformMatrix4fv(projMatrixLoc, false, projMatrix.elements)

    draw(gl, matrixLoc, matrix)
}

window.onload = main
