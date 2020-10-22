import { getGL } from '../common/init'
import { vec3, vec4 } from '../common/math'
import { Matrix4 } from '../common/matrix'
import { initArrayBuffer } from '../common/webgl'

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
    vec4(0.4, 1.0, 0.4, 0.4),
    vec4(0.4, 1.0, 0.4, 0.4),
    vec4(1.0, 0.4, 0.4, 0.4),

    vec4(1.0, 0.4, 0.4, 0.5),
    vec4(1.0, 1.0, 0.4, 0.5),
    vec4(1.0, 1.0, 0.4, 0.5),

    vec4(0.4, 0.4, 1.0, 0.7),
    vec4(0.4, 0.4, 1.0, 0.7),
    vec4(1.0, 0.4, 0.4, 0.7)
]

const eye = {
    x: 0.2,
    y: 0.25,
    z: 0.25
}

const step = 0.03

function keydown(ev, gl, matrixLoc, matrix) {
    switch (ev.keyCode) {
        case 37:
            eye.x -= step
            break
        case 38:
            eye.y -= step
            break
        case 39:
            eye.x += step
            break
        case 40:
            eye.y += step
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

    initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)
    initArrayBuffer(gl, 'a_Color', colors, 4, gl.FLOAT)

    let matrixLoc = gl.getUniformLocation(gl.program, 'u_ViewMatrix')
    let matrix = new Matrix4()
    document.onkeydown = (ev) => keydown(ev, gl, matrixLoc, matrix)

    let projMatrixLoc = gl.getUniformLocation(gl.program, 'u_ProjMatrix')
    let projMatrix = new Matrix4()
    projMatrix.setOrtho(-1.0, 1.0, -1.0, 1.0, 0.0, 2.0)
    gl.uniformMatrix4fv(projMatrixLoc, false, projMatrix.elements)

    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    draw(gl, matrixLoc, matrix)
}

window.onload = main
