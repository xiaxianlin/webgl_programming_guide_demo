import { getGL } from '../common/init'
import { vec3, vec4 } from '../common/math'
import { flatten } from '../common/utils'
import { Matrix4 } from '../common/matrix'
import { initArrayBuffer } from '../common/webgl'

// 单色数据
const vertices = [
    vec3(1, 1, 1),
    vec3(-1, 1, 1),
    vec3(-1, -1, 1),
    vec3(1, -1, 1),
    vec3(1, 1, 1),
    vec3(1, -1, 1),
    vec3(1, -1, -1),
    vec3(1, 1, -1),
    vec3(1, 1, 1),
    vec3(1, 1, -1),
    vec3(-1, 1, -1),
    vec3(-1, 1, 1),
    vec3(-1, 1, 1),
    vec3(-1, 1, -1),
    vec3(-1, -1, -1),
    vec3(-1, -1, 1),
    vec3(-1, -1, 1),
    vec3(1, -1, 1),
    vec3(1, -1, -1),
    vec3(-1, -1, -1),
    vec3(-1, -1, -1),
    vec3(1, -1, -1),
    vec3(1, 1, -1),
    vec3(-1, 1, -1)
]

const colors = [
    vec4(0, 0, 1, 0.4),
    vec4(0, 0, 1, 0.4),
    vec4(0, 0, 1, 0.4),
    vec4(0, 0, 1, 0.4),

    vec4(0, 1, 0, 0.4),
    vec4(0, 1, 0, 0.4),
    vec4(0, 1, 0, 0.4),
    vec4(0, 1, 0, 0.4),

    vec4(1, 0, 0, 0.4),
    vec4(1, 0, 0, 0.4),
    vec4(1, 0, 0, 0.4),
    vec4(1, 0, 0, 0.4),

    vec4(1, 1, 0, 0.4),
    vec4(1, 1, 0, 0.4),
    vec4(1, 1, 0, 0.4),
    vec4(1, 1, 0, 0.4),

    vec4(0, 1, 1, 0.4),
    vec4(0, 1, 1, 0.4),
    vec4(0, 1, 1, 0.4),
    vec4(0, 1, 1, 0.4),

    vec4(1, 0, 1, 0.4),
    vec4(1, 0, 1, 0.4),
    vec4(1, 0, 1, 0.4),
    vec4(1, 0, 1, 0.4)
]

const indices = [
    vec3(0, 1, 2),
    vec3(0, 2, 3),
    vec3(4, 5, 6),
    vec3(4, 6, 7),
    vec3(8, 9, 10),
    vec3(8, 10, 11),
    vec3(12, 13, 14),
    vec3(12, 14, 15),
    vec3(16, 17, 18),
    vec3(16, 18, 19),
    vec3(20, 21, 22),
    vec3(20, 22, 23)
]

function initVertexBuffers(gl) {
    initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)
    initArrayBuffer(gl, 'a_Color', colors, 4, gl.FLOAT)

    let indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, flatten(indices, 'Uint8Array'), gl.STATIC_DRAW)
}

function main() {
    let gl = getGL()

    initVertexBuffers(gl)

    let mvpMatrixLoc = gl.getUniformLocation(gl.program, 'u_MvpMatrix')
    let mvpMatrix = new Matrix4()
    mvpMatrix.setPerspective(30, 1, 1, 100)
    mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0)
    gl.uniformMatrix4fv(mvpMatrixLoc, false, mvpMatrix.elements)

    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawElements(gl.TRIANGLES, indices.length * 3, gl.UNSIGNED_BYTE, 0)
}

window.onload = main
