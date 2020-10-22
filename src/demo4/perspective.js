import { getGL } from '../common/init'
import { vec3 } from '../common/math'
import { setLookAt, flatten } from '../common/utils'
import { Matrix4 } from '../common/matrix'

const vertices = [
    vec3(0.0, 1.0, 0.0),
    vec3(-0.5, -1.0, 0.0),
    vec3(0.5, -1.0, 0.0),

    vec3(0.0, 1.0, -2.0),
    vec3(-0.5, -1.0, -2.0),
    vec3(0.5, -1.0, -2.0),

    vec3(0.0, 1.0, -4.0),
    vec3(-0.5, -1.0, -4.0),
    vec3(0.5, -1.0, -4.0)
]

const colors = [
    vec3(0.4, 0.4, 1.0),
    vec3(0.4, 0.4, 1.0),
    vec3(1.0, 0.4, 0.4),

    vec3(1.0, 0.4, 0.4),
    vec3(1.0, 1.0, 0.4),
    vec3(1.0, 1.0, 0.4),

    vec3(0.4, 1.0, 0.4),
    vec3(0.4, 1.0, 0.4),
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
    gl.enable(gl.DEPTH_TEST)
    gl.clearColor(0.0, 0.0, 0.0, 0.0)
    initVertexBuffers(gl)

    let viewMatrixLoc = gl.getUniformLocation(gl.program, 'u_ViewMatrix')
    let viewMatrix = new Matrix4()
    viewMatrix.setLookAt(0, 0, 5, 0, 0, -100, 0, 1, 0)
    gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix.elements)

    let projMatrixLoc = gl.getUniformLocation(gl.program, 'u_ProjMatrix')
    let projMatrix = new Matrix4()
    projMatrix.setPerspective(30, gl.canvas.width / gl.canvas.height, 1, 100)
    gl.uniformMatrix4fv(projMatrixLoc, false, projMatrix.elements)

    let modelMatrixLoc = gl.getUniformLocation(gl.program, 'u_ModelMatrix')
    let modelMatrix = new Matrix4()
    modelMatrix.setTranslate(0.75, 0, 0)
    gl.uniformMatrix4fv(modelMatrixLoc, false, modelMatrix.elements)

    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length)

    modelMatrix.setTranslate(-0.75, 0, 0)
    gl.uniformMatrix4fv(modelMatrixLoc, false, modelMatrix.elements)
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length)
}

window.onload = main
