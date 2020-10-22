import { getGL } from '../common/init'
import { flatten } from '../common/utils'
import { Matrix4 } from '../common/matrix'
import { vertices, indices, texCoords } from './data'
import { configTexture2D, initArrayBuffer, loadImageTexture } from '../common/webgl'
import { initCanvasDragEvent } from '../common/dom'

let angles = [0.0, 0.0]
let mvpMatrix = new Matrix4()

function initVertexBuffers(gl) {
    initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)
    initArrayBuffer(gl, 'a_TexCoord', texCoords, 2, gl.FLOAT)

    let indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, flatten(indices, 'Uint8Array'), gl.STATIC_DRAW)
}

function draw(gl, matrix) {
    mvpMatrix.set(matrix)
    mvpMatrix.rotate(angles[0], 1.0, 0.0, 0.0)
    mvpMatrix.rotate(angles[1], 0.0, 1.0, 0.0)

    let mvpMatrixLoc = gl.getUniformLocation(gl.program, 'u_MvpMatrix')
    gl.uniformMatrix4fv(mvpMatrixLoc, false, mvpMatrix.elements)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0)
}

function main() {
    let gl = getGL()
    gl.enable(gl.DEPTH_TEST)
    initVertexBuffers(gl)
    gl.clearColor(0.0, 0.0, 0.0, 0.5)
    let matrix = new Matrix4()
    matrix.setPerspective(30, gl.canvas.width / gl.canvas.height, 1, 100)
    matrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0)

    initCanvasDragEvent(gl.canvas, (x, y, dx, dy) => {
        angles[0] = Math.max(Math.min(angles[0] + dy, 90.0), -90.0)
        angles[1] = angles[1] + dx
    })

    let tick = () => {
        draw(gl, matrix)
        requestAnimationFrame(tick)
    }

    loadImageTexture(gl, 'u_Sampler', 'texture0.png').then(() => tick())
}

window.onload = main
