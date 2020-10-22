import { getGL } from '../common/init'
import { vec3 } from '../common/math'
import { setLookAt, flatten } from '../common/utils'
import { Matrix4, Vector4, Vector3 } from '../common/matrix'
import { vertices, normalizes, indices } from './data'

const colors = []
for (let i = 0; i < 24; i++) {
    colors.push(vec3(0, 1, 1))
}

const n = indices.length * 3

const globalMvpMatrix = new Matrix4()
const globalModelMatrix = new Matrix4()
const globalNormalMatrix = new Matrix4()

let step = 2.0
let armAngle1 = 90.0
let jointAngle1 = 0.0

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
        case 37:
            armAngle1 = (armAngle1 - step) % 360
            break
        case 39:
            armAngle1 = (armAngle1 + step) % 360
            break
        default:
            return
    }
    draw(gl, mvpMatrix, mvpMatrixLoc, normalMatrixLoc)
}

function draw(gl, mvpMatrix, mvpMatrixLoc, normalMatrixLoc) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    // arm1
    globalModelMatrix.setTranslate(0.0, -12.0, 0.0)
    globalModelMatrix.rotate(armAngle1, 0.0, 1.0, 0.0)
    drawBox(gl, mvpMatrix, mvpMatrixLoc, normalMatrixLoc)

    // arm2
    globalModelMatrix.setTranslate(0.0, -2.0, 0.0)
    globalModelMatrix.rotate(armAngle1, 0.0, 1.0, 0.0)
    globalModelMatrix.rotate(jointAngle1, 0.0, 0.0, 1.0)
    globalModelMatrix.scale(1.2, 1.2, 1.2)
    drawBox(gl, mvpMatrix, mvpMatrixLoc, normalMatrixLoc)
}

function drawBox(gl, mvpMatrix, mvpMatrixLoc, normalMatrixLoc) {
    globalMvpMatrix.set(mvpMatrix)
    globalMvpMatrix.multiply(globalModelMatrix)
    gl.uniformMatrix4fv(mvpMatrixLoc, false, globalMvpMatrix.elements)

    globalNormalMatrix.setInverseOf(globalModelMatrix)
    globalNormalMatrix.transpose()
    gl.uniformMatrix4fv(normalMatrixLoc, false, globalNormalMatrix.elements)

    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0)
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
