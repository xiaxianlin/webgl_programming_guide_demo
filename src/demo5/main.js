import { getGL } from '../common/init'
import { vec3 } from '../common/math'
import { setLookAt, flatten } from '../common/utils'
import { Matrix4 } from '../common/matrix'

// 单色数据
const vertices = [
    // 前
    vec3(1, 1, 1),
    vec3(-1, 1, 1),
    vec3(-1, -1, 1),
    vec3(1, -1, 1),
    // 右
    vec3(1, 1, 1),
    vec3(1, -1, 1),
    vec3(1, -1, -1),
    vec3(1, 1, -1),
    // 上
    vec3(1, 1, 1),
    vec3(1, 1, -1),
    vec3(-1, 1, -1),
    vec3(-1, 1, 1),
    // 左
    vec3(-1, 1, 1),
    vec3(-1, 1, -1),
    vec3(-1, -1, -1),
    vec3(-1, -1, 1),
    // 下
    vec3(-1, -1, 1),
    vec3(1, -1, 1),
    vec3(1, -1, -1),
    vec3(-1, -1, -1),
    // 后
    vec3(-1, -1, -1),
    vec3(1, -1, -1),
    vec3(1, 1, -1),
    vec3(-1, 1, -1)
]

const colors = [
    vec3(0, 0, 1),
    vec3(0, 0, 1),
    vec3(0, 0, 1),
    vec3(0, 0, 1),

    vec3(0, 1, 0),
    vec3(0, 1, 0),
    vec3(0, 1, 0),
    vec3(0, 1, 0),

    vec3(1, 0, 0),
    vec3(1, 0, 0),
    vec3(1, 0, 0),
    vec3(1, 0, 0),

    vec3(1, 1, 0),
    vec3(1, 1, 0),
    vec3(1, 1, 0),
    vec3(1, 1, 0),

    vec3(0, 1, 1),
    vec3(0, 1, 1),
    vec3(0, 1, 1),
    vec3(0, 1, 1),

    vec3(1, 0, 1),
    vec3(1, 0, 1),
    vec3(1, 0, 1),
    vec3(1, 0, 1)
]

const indices = [
    // 前
    vec3(0, 1, 2),
    vec3(0, 2, 3),
    // 右
    vec3(4, 5, 6),
    vec3(4, 6, 7),
    // 上
    vec3(8, 9, 10),
    vec3(8, 10, 11),
    // 左
    vec3(12, 13, 14),
    vec3(12, 14, 15),
    // 下
    vec3(16, 17, 18),
    vec3(16, 18, 19),
    // 后
    vec3(20, 21, 22),
    vec3(20, 22, 23)
]

// 渐变色数据
const sampleVextices = [
    vec3(1, 1, 1),
    vec3(-1, 1, 1),
    vec3(-1, -1, 1),
    vec3(1, -1, 1),
    vec3(1, -1, -1),
    vec3(1, 1, -1),
    vec3(-1, 1, -1),
    vec3(-1, -1, -1)
]

const sampleColors = [
    vec3(1, 1, 1),
    vec3(1, 0, 1),
    vec3(1, 0, 0),
    vec3(1, 1, 0),
    vec3(0, 1, 0),
    vec3(0, 1, 1),
    vec3(0, 0, 1),
    vec3(0, 0, 0)
]

const sampleIndices = [
    // 前
    vec3(0, 1, 2),
    vec3(0, 2, 3),
    // 右
    vec3(0, 3, 4),
    vec3(0, 4, 5),
    // 上
    vec3(0, 5, 6),
    vec3(0, 6, 1),
    // 左
    vec3(1, 6, 7),
    vec3(1, 7, 2),
    // 下
    vec3(7, 4, 3),
    vec3(7, 3, 2),
    // 后
    vec3(4, 7, 6),
    vec3(4, 6, 5)
]

// 纯色数据
const pureColors = [
    vec3(1, 1, 1),
    vec3(1, 1, 1),
    vec3(1, 1, 1),
    vec3(1, 1, 1),

    vec3(1, 1, 1),
    vec3(1, 1, 1),
    vec3(1, 1, 1),
    vec3(1, 1, 1),

    vec3(1, 1, 1),
    vec3(1, 1, 1),
    vec3(1, 1, 1),
    vec3(1, 1, 1),

    vec3(1, 1, 1),
    vec3(1, 1, 1),
    vec3(1, 1, 1),
    vec3(1, 1, 1),

    vec3(1, 1, 1),
    vec3(1, 1, 1),
    vec3(1, 1, 1),
    vec3(1, 1, 1),

    vec3(1, 1, 1),
    vec3(1, 1, 1),
    vec3(1, 1, 1),
    vec3(1, 1, 1)
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

    let indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, flatten(indices, 'Uint8Array'), gl.STATIC_DRAW)
}

function initSampleVertexBuffers(gl) {
    let positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, flatten(sampleVextices), gl.STATIC_DRAW)
    let positionLoc = gl.getAttribLocation(gl.program, 'a_Position')
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(positionLoc)

    let colorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, flatten(sampleColors), gl.STATIC_DRAW)
    let colorLoc = gl.getAttribLocation(gl.program, 'a_Color')
    gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(colorLoc)

    let indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, flatten(sampleIndices, 'Uint8Array'), gl.STATIC_DRAW)
}

function initPureVertexBuffers(gl) {
    let positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, flatten(sampleVextices), gl.STATIC_DRAW)
    let positionLoc = gl.getAttribLocation(gl.program, 'a_Position')
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(positionLoc)

    let colorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pureColors), gl.STATIC_DRAW)
    let colorLoc = gl.getAttribLocation(gl.program, 'a_Color')
    gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(colorLoc)

    let indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, flatten(sampleIndices, 'Uint8Array'), gl.STATIC_DRAW)
}

function main() {
    let gl = getGL()
    // initVertexBuffers(gl)
    // initSampleVertexBuffers(gl)
    initPureVertexBuffers(gl)
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.enable(gl.DEPTH_TEST)

    let mvpMatrixLoc = gl.getUniformLocation(gl.program, 'u_MvpMatrix')
    let mvpMatrix = new Matrix4()
    mvpMatrix.setPerspective(30, 1, 1, 100)
    mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0)
    gl.uniformMatrix4fv(mvpMatrixLoc, false, mvpMatrix.elements)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.drawElements(gl.TRIANGLES, indices.length * 3, gl.UNSIGNED_BYTE, 0)
}

window.onload = main
