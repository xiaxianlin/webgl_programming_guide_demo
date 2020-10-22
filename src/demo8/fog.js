import { getGL } from '../common/init'
import { flatten } from '../common/utils'
import { Matrix4, Vector4 } from '../common/matrix'
import { vertices, indices, colors } from './data'
import { initArrayBuffer } from '../common/webgl'
import { initCanvasDragEvent, getCanvasEventAxis } from '../common/dom'
import { vec3 } from '../common/math'

let angles = [0.0, 0.0]
let mvpMatrix = new Matrix4()

function initVertexBuffers(gl) {
    initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)
    initArrayBuffer(gl, 'a_Color', colors, 3, gl.FLOAT)

    let indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, flatten(indices, 'Uint8Array'), gl.STATIC_DRAW)
}

function main() {
    let gl = getGL()

    initVertexBuffers(gl)

    let eye = new Float32Array([25, 65, 35, 1.0])
    let fogColor = new Float32Array([0.337, 0.531, 0.723])
    let fogDist = new Float32Array([55, 80])

    var modelMatrix = new Matrix4()
    modelMatrix.setScale(10, 10, 10)

    let mvpMatrix = new Matrix4()
    mvpMatrix.setPerspective(30, gl.canvas.width / gl.canvas.height, 1, 100)
    mvpMatrix.lookAt(eye[0], eye[1], eye[2], 0, 2, 0, 0, 1, 0)
    mvpMatrix.multiply(modelMatrix)

    let mvpMatrixLoc = gl.getUniformLocation(gl.program, 'u_MvpMatrix')
    let modelMatrixLoc = gl.getUniformLocation(gl.program, 'u_ModelMatrix')
    let eyeLoc = gl.getUniformLocation(gl.program, 'u_Eye')
    let fogColorLoc = gl.getUniformLocation(gl.program, 'u_FogColor')
    let fogDistLoc = gl.getUniformLocation(gl.program, 'u_FogDist')

    gl.uniform4fv(eyeLoc, eye)
    gl.uniform3fv(fogColorLoc, fogColor)
    gl.uniform2fv(fogDistLoc, fogDist)
    gl.uniformMatrix4fv(modelMatrixLoc, false, modelMatrix.elements)
    gl.uniformMatrix4fv(mvpMatrixLoc, false, mvpMatrix.elements)

    document.onkeydown = function (ev) {
        keydown(ev, gl, fogDistLoc, fogDist)
    }
    
    gl.enable(gl.DEPTH_TEST)
    gl.clearColor(fogColor[0], fogColor[1], fogColor[2], 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0)
}

function keydown(ev, gl, fogDistLoc, fogDist) {
    switch (ev.keyCode) {
        case 38:
            fogDist[1] += 1
            break
        case 40:
            if (fogDist[1] > fogDist[0]) fogDist[1] -= 1
            break
        default:
            return
    }
    gl.uniform2fv(fogDistLoc, fogDist)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0)
}

window.onload = main
