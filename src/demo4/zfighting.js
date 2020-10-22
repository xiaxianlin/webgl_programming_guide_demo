import { getGL } from '../common/init'
import { vec3 } from '../common/math'
import { flatten } from '../common/utils'
import { Matrix4 } from '../common/matrix'

const vertices = [
    vec3(0.0, 0.25, -0.5),
    vec3(-0.25, -0.25, -0.5),
    vec3(0.25, -0.25, -0.5),

    vec3(0.0, 0.2, -0.5),
    vec3(-0.2, -0.2, -0.5),
    vec3(0.2, -0.2, -0.5)
]

const colors = [
    vec3(0.0, 1.0, 0.0),
    vec3(0.0, 1.0, 0.0),
    vec3(0.0, 1.0, 0.0),

    vec3(1.0, 1.0, 0.0),
    vec3(1.0, 1.0, 0.0),
    vec3(1.0, 1.0, 0.0)
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
    gl.enable(gl.POLYGON_OFFSET_FILL)
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    initVertexBuffers(gl)

    let viewMatrixLoc = gl.getUniformLocation(gl.program, 'u_ViewMatrix')
    let viewMatrix = new Matrix4()
    viewMatrix.setLookAt(0, 0, 0.2, 0, 0, 0, 0, 1, 0)
    gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix.elements)

    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length)
    // gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2)
    // gl.polygonOffset(0.1, 0.1)
    // gl.drawArrays(gl.TRIANGLES, vertices.length / 2, vertices.length / 2)
}

window.onload = main
