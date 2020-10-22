import { getGL } from '../common/init'
import { vec3 } from '../common/math'
import { setLookAt, flatten } from '../common/utils'
import { Matrix4, Vector4, Vector3 } from '../common/matrix'
import { normalizes, indices } from './data'
import { baseVertices, armVertices1, armVertices2, palmVertices, fingerVertices } from './data'

let colors = []
for (let i = 0; i < 24; i++) {
    colors.push(vec3(0, 1, 1))
}

const n = 36

let mvpMatrix = new Matrix4()
let modelMatrix = new Matrix4()
let normalMatrix = new Matrix4()
let matrixStack = []

let step = 2.0
let armAngle1 = 90.0
let jointAngle1 = 45.0
let jointAngle2 = 0.0
let jointAngle3 = 0.0

let baseBuffer = null
let armBuffer1 = null
let armBuffer2 = null
let palmBuffer = null
let fingerBuffer = null

function pushMatrix(m) {
    let m2 = new Matrix4(m)
    matrixStack.push(m2)
}

function popMatrix() {
    return matrixStack.pop()
}

function initArrayBufferForLaterUse(gl, data, num, type) {
    let buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, flatten(data), gl.STATIC_DRAW)
    buffer.num = num
    buffer.type = type
    buffer.data = flatten(data)
    return buffer
}

function initArrayBuffer(gl, name, data, num, type) {
    let buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, flatten(data), gl.STATIC_DRAW)
    let loc = gl.getAttribLocation(gl.program, name)
    gl.vertexAttribPointer(loc, num, type, false, 0, 0)
    gl.enableVertexAttribArray(loc)
}

function initVertexBuffers(gl) {
    baseBuffer = initArrayBufferForLaterUse(gl, baseVertices, 3, gl.FLOAT)
    armBuffer1 = initArrayBufferForLaterUse(gl, armVertices1, 3, gl.FLOAT)
    armBuffer2 = initArrayBufferForLaterUse(gl, armVertices2, 3, gl.FLOAT)
    palmBuffer = initArrayBufferForLaterUse(gl, palmVertices, 3, gl.FLOAT)
    fingerBuffer = initArrayBufferForLaterUse(gl, fingerVertices, 3, gl.FLOAT)

    initArrayBuffer(gl, 'a_Normal', normalizes, 3, gl.FLOAT)

    let indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, flatten(indices, 'Uint8Array'), gl.STATIC_DRAW)
}

function draw(gl, matrix) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    let height = -12.0
    // 绘制基座
    let baseHeight = 2.0
    modelMatrix.setTranslate(0.0, height, 0.0)
    drawSegment(gl, baseBuffer, matrix)

    // Arm1
    let armLength1 = 10.0
    height += baseHeight
    modelMatrix.setTranslate(0.0, height, 0.0)
    modelMatrix.rotate(armAngle1, 0.0, 1.0, 0.0)
    drawSegment(gl, armBuffer1, matrix)

    // Arm2
    let armLength2 = 10.0
    height += armLength1
    modelMatrix.setTranslate(0.0, height, 0.0)
    modelMatrix.rotate(armAngle1, 0.0, 1.0, 0.0)
    modelMatrix.rotate(jointAngle1, 0.0, 0.0, 1.0)
    drawSegment(gl, armBuffer2, matrix)

    // A palm
    let palmLength = 2.0
    height += armLength2
    modelMatrix.translate(0.0, height, 0.0)
    modelMatrix.rotate(jointAngle2, 0.0, 1.0, 0.0)
    drawSegment(gl, palmBuffer, matrix)

    modelMatrix.translate(0.0, palmLength, 0.0)

    // Finger1
    pushMatrix(modelMatrix)
    modelMatrix.translate(0.0, 0.0, 2.0)
    modelMatrix.rotate(jointAngle3, 1.0, 0.0, 0.0)
    drawSegment(gl, fingerBuffer, matrix)
    modelMatrix = popMatrix()

    // Finger2
    modelMatrix.translate(0.0, 0.0, -2.0)
    modelMatrix.rotate(-jointAngle3, 1.0, 0.0, 0.0)
    drawSegment(gl, fingerBuffer, matrix)
}

function drawSegment(gl, buffer, matrix) {
    let positionLoc = gl.getAttribLocation(gl.program, 'a_Position')
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.vertexAttribPointer(positionLoc, buffer.num, buffer.type, false, 0, 0)
    gl.enableVertexAttribArray(positionLoc)

    mvpMatrix.set(matrix)
    mvpMatrix.multiply(modelMatrix)
    let mvpMatrixLoc = gl.getUniformLocation(gl.program, 'u_MvpMatrix')
    gl.uniformMatrix4fv(mvpMatrixLoc, false, mvpMatrix.elements)

    normalMatrix.setInverseOf(modelMatrix)
    normalMatrix.transpose()
    let normalMatrixLoc = gl.getUniformLocation(gl.program, 'u_NormalMatrix')
    gl.uniformMatrix4fv(normalMatrixLoc, false, normalMatrix.elements)

    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0)
}

function main() {
    let gl = getGL('vertexShader', 'fragmentShader')
    initVertexBuffers(gl)
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.enable(gl.DEPTH_TEST)

    let matrix = new Matrix4()
    matrix.setPerspective(50, gl.canvas.width / gl.canvas.height, 1, 100)
    matrix.lookAt(20, 10, 30, 0, 0, 0, 0, 1, 0)

    document.onkeydown = (ev) => handleKeydown(ev, gl, matrix)

    draw(gl, matrix)
}

function handleKeydown(ev, gl, matrix) {
    switch (ev.keyCode) {
        case 37:
            armAngle1 = (armAngle1 - step) % 360
            break
        case 39:
            armAngle1 = (armAngle1 + step) % 360
            break
        case 38:
            if (jointAngle1 < 135) jointAngle1 += step
            break
        case 40:
            if (jointAngle1 > -135) jointAngle1 -= step
            break

        case 90:
            jointAngle2 = (jointAngle2 - step) % 360
            break
        case 88:
            jointAngle2 = (jointAngle2 + step) % 360
            break
        case 86:
            if (jointAngle3 < 60) jointAngle3 = (jointAngle3 + step) % 360
            break
        case 67:
            if (jointAngle3 > -60) jointAngle3 = (jointAngle3 - step) % 360
            break
        default:
            return
    }
    draw(gl, matrix)
}

window.onload = main
