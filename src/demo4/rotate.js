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
    vec3(0.0, 0.6, -0.2),

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

function main() {
    let gl = getGL()

    initVertexBuffers(gl)

    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    let viewMatrixLoc = gl.getUniformLocation(gl.program, 'u_ViewMatrix')
    let modelMatrixLoc = gl.getUniformLocation(gl.program, 'u_ModelMatrix')

    let viewMatrix = new Matrix4()
    viewMatrix.setLookAt(0.25, 0.25, 0.25, 0, 0, 0, 0, 1, 0)
    gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix.elements)

    let rotateMatrix = new Matrix4()
    rotateMatrix.setRotate(-10, 0, 0, 1)
    gl.uniformMatrix4fv(modelMatrixLoc, false, rotateMatrix.elements)

    gl.drawArrays(gl.TRIANGLES, 0, vertices.length)
}

window.onload = main
