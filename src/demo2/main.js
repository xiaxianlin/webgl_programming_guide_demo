import { getGL } from '../common/init'
import { vec2, vec4, mat4, mat2, mult } from '../common/math'
import { flatten, createRotateMatrix, getRadian, createTranslateMatrix } from '../common/utils'

const vertices = [vec2(0.0, 0.5), vec2(-0.5, -0.5), vec2(0.5, -0.5)]

const angle = 90.0

const angle_step = 45.0

function initVertexBuffers(gl) {
    let buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW)

    let loc = gl.getAttribLocation(gl.program, 'vPosition')
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(loc)
}

function main() {
    let gl = getGL()
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clearColor(1.0, 1.0, 1.0, 1.0)

    initVertexBuffers(gl)

    // 分量平移
    // let vTranslation = gl.getUniformLocation(gl.program, 'vTranslation')
    // gl.uniform4f(vTranslation, 0.5, 0.5, 0.0, 0.0)

    // 计算旋转角度
    // let radian = (Math.PI * angle) / 180.0
    // let cosB = Math.cos(radian)
    // let sinB = Math.sin(radian)

    // 分量旋转
    // let uCosB = gl.getUniformLocation(gl.program, 'uCosB')
    // gl.uniform1f(uCosB, cosB)
    // let uSinB = gl.getUniformLocation(gl.program, 'uSinB')
    // gl.uniform1f(uSinB, sinB)

    // 旋转+平移矩阵
    // let xformMatrix = mat4(
    //     vec4(cosB, sinB, 0.0, 0.0),
    //     vec4(-sinB, cosB, 0.0, 0.0),
    //     vec4(0.0, 0.0, 1.0, 0.0),
    //     vec4(0.5, 0.5, 0.0, 1.0)
    // )
    // let xformMatrixLoc = gl.getUniformLocation(gl.program, 'xformMatrix')
    // gl.uniformMatrix4fv(xformMatrixLoc, false, flatten(xformMatrix))

    // 缩放矩阵
    let xformTMatrix = createTranslateMatrix(0.5, 0.5, 0.0)
    let xformRMatrix = createRotateMatrix(getRadian(angle), 0, 0, 1.0)
    let xformMatrix = mult(xformRMatrix, xformTMatrix)
    let xformMatrixLoc = gl.getUniformLocation(gl.program, 'xformMatrix')
    gl.uniformMatrix4fv(xformMatrixLoc, false, flatten(xformMatrix))

    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length)
}

window.onload = main
