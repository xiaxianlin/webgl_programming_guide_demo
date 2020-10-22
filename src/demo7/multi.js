import { getGL } from '../common/init'
import { vec3 } from '../common/math'
import { setLookAt, flatten } from '../common/utils'
import { Matrix4, Vector4, Vector3 } from '../common/matrix'
import { multiVertices, normalizes, indices } from './data'

let colors = []
for (let i = 0; i < 24; i++) {
    colors.push(vec3(0, 1, 1))
}

const n = 36

let globalMvpMatrix = new Matrix4()
let globalModelMatrix = new Matrix4()
let globalNormalMatrix = new Matrix4()
let gloableMatrixStack = []

let step = 2.0
let armAngle1 = 90.0
let jointAngle1 = 45.0
let jointAngle2 = 0.0
let jointAngle3 = 0.0

function pushMatrix(m) {
    let m2 = new Matrix4(m)
    gloableMatrixStack.push(m2)
}

function popMatrix() {
    return gloableMatrixStack.pop()
}

function initVertexBuffers(gl) {
    let positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, flatten(multiVertices), gl.STATIC_DRAW)
    let positionLoc = gl.getAttribLocation(gl.program, 'a_Position')
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(positionLoc)

    let colorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW)
    let colorLoc = gl.getAttribLocation(gl.program, 'a_Color')
    gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(colorLoc)

    let normalBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalizes), gl.STATIC_DRAW)
    let normalLoc = gl.getAttribLocation(gl.program, 'a_Normal')
    gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(normalLoc)

    let indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, flatten(indices, 'Uint8Array'), gl.STATIC_DRAW)
}

function handleKeydown(ev, gl, mvpMatrix, mvpMatrixLoc, normalMatrixLoc) {
    switch (ev.keyCode) {
        case 37:
            armAngle1 = (armAngle1 - step) % 360
            break
        case 39:
            armAngle1 = (armAngle1 + step) % 360
            break
        case 38:
            if (jointAngle1 < 135) {
                jointAngle1 += step
            }
            break
        case 40:
            if (jointAngle1 > -135) {
                jointAngle1 -= step
            }
            break

        case 90:
            jointAngle2 = (jointAngle2 - step) % 360
            break
        case 88:
            jointAngle2 = (jointAngle2 + step) % 360
            break
        case 86:
            if (jointAngle3 < 60) {
                jointAngle3 = (jointAngle3 + step) % 360
            }
            break
        case 67:
            if (jointAngle3 > -60) {
                jointAngle3 = (jointAngle3 - step) % 360
            }
            break
        default:
            return
    }
    draw(gl, mvpMatrix, mvpMatrixLoc, normalMatrixLoc)
}

function draw(gl, mvpMatrix, mvpMatrixLoc, normalMatrixLoc) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    let height = -12.0
    // 绘制基座
    let baseHeight = 2.0
    globalModelMatrix.setTranslate(0.0, height, 0.0)
    drawBox(gl, 10.0, baseHeight, 10.0, mvpMatrix, mvpMatrixLoc, normalMatrixLoc)

    // Arm1
    let armLength1 = 10.0
    height += baseHeight
    globalModelMatrix.setTranslate(0.0, height, 0.0)
    globalModelMatrix.rotate(armAngle1, 0.0, 1.0, 0.0)
    drawBox(gl, 3.0, armLength1, 3.0, mvpMatrix, mvpMatrixLoc, normalMatrixLoc)

    // Arm2
    let armLength2 = 10.0
    height += armLength1
    globalModelMatrix.setTranslate(0.0, height, 0.0)
    globalModelMatrix.rotate(armAngle1, 0.0, 1.0, 0.0)
    globalModelMatrix.rotate(jointAngle1, 0.0, 0.0, 1.0)
    drawBox(gl, 4.0, armLength2, 6.0, mvpMatrix, mvpMatrixLoc, normalMatrixLoc)

    // A palm
    let palmLength = 2.0
    height += armLength2
    globalModelMatrix.translate(0.0, height, 0.0)
    globalModelMatrix.rotate(jointAngle2, 0.0, 1.0, 0.0)
    drawBox(gl, 2.0, palmLength, 6.0, mvpMatrix, mvpMatrixLoc, normalMatrixLoc)

    globalModelMatrix.translate(0.0, palmLength, 0.0)

    // Finger1
    pushMatrix(globalModelMatrix)
    globalModelMatrix.translate(0.0, 0.0, 2.0)
    globalModelMatrix.rotate(jointAngle3, 1.0, 0.0, 0.0)
    drawBox(gl, 1.0, 2.0, 1.0, mvpMatrix, mvpMatrixLoc, normalMatrixLoc)
    globalModelMatrix = popMatrix()

    globalModelMatrix.translate(0.0, 0.0, -2.0)
    globalModelMatrix.rotate(-jointAngle3, 1.0, 0.0, 0.0)
    drawBox(gl, 1.0, 2.0, 1.0, mvpMatrix, mvpMatrixLoc, normalMatrixLoc)
}

function drawBox(gl, width, height, depth, mvpMatrix, mvpMatrixLoc, normalMatrixLoc) {
    pushMatrix(globalModelMatrix)

    globalModelMatrix.scale(width, height, depth)
    globalMvpMatrix.set(mvpMatrix)
    globalMvpMatrix.multiply(globalModelMatrix)
    gl.uniformMatrix4fv(mvpMatrixLoc, false, globalMvpMatrix.elements)

    globalNormalMatrix.setInverseOf(globalModelMatrix)
    globalNormalMatrix.transpose()
    gl.uniformMatrix4fv(normalMatrixLoc, false, globalNormalMatrix.elements)

    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0)
    globalModelMatrix = popMatrix()
}

function main() {
    let gl = getGL('vertexShader', 'fragmentShader')
    initVertexBuffers(gl)
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.enable(gl.DEPTH_TEST)

    // 设置光线颜色
    let lightColorLoc = gl.getUniformLocation(gl.program, 'u_LightColor')
    gl.uniform3f(lightColorLoc, 1.0, 1.0, 1.0)

    let lightPositionLoc = gl.getUniformLocation(gl.program, 'u_LightPosition')
    gl.uniform3f(lightPositionLoc, 0.0, 0.5, 0.7)

    // 设置环境光
    let ambientLightLoc = gl.getUniformLocation(gl.program, 'u_AmientLight')
    gl.uniform3f(ambientLightLoc, 0.2, 0.2, 0.5)

    let mvpMatrix = new Matrix4()
    mvpMatrix.setPerspective(50, gl.canvas.width / gl.canvas.height, 1, 100)
    mvpMatrix.lookAt(20, 10, 30, 0, 0, 0, 0, 1, 0)

    let mvpMatrixLoc = gl.getUniformLocation(gl.program, 'u_MvpMatrix')
    let normalMatrixLoc = gl.getUniformLocation(gl.program, 'u_NormalMatrix')

    document.onkeydown = (ev) => handleKeydown(ev, gl, mvpMatrix, mvpMatrixLoc, normalMatrixLoc)

    draw(gl, mvpMatrix, mvpMatrixLoc, normalMatrixLoc)
}

window.onload = main
