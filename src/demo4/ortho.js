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

const ortho = {
    near: 0,
    far: 0.5
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
            ortho.near -= 0.01
            break
        case 38:
            ortho.far += 0.01
            break
        case 39:
            ortho.near += 0.01
            break
        case 40:
            ortho.far -= 0.01
            break
        default:
            return
    }
    draw(gl, matrixLoc, matrix)
}

function draw(gl, matrixLoc, matrix) {
    matrix.setOrtho(-1, 1, -1, 1, ortho.near, ortho.far)
    gl.uniformMatrix4fv(matrixLoc, false, matrix.elements)
    gl.clear(gl.COLOR_BUFFER_BIT)
    document.getElementById('nearFar').innerHTML = `near: ${Math.round(ortho.near * 100) / 100}, far: ${
        Math.round(ortho.far * 100) / 100
    }`
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length)
}

function main() {
    let gl = getGL()
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    initVertexBuffers(gl)

    let matrixLoc = gl.getUniformLocation(gl.program, 'u_ViewMatrix')
    let matrix = new Matrix4()

    document.onkeydown = (ev) => keydown(ev, gl, matrixLoc, matrix)

    draw(gl, matrixLoc, matrix)
}

window.onload = main
