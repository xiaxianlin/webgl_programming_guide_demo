import { getGL } from '../common/init'
import { flatten } from '../common/utils'
import { Matrix4 } from '../common/matrix'
import { vertices, indices, colors } from './data'
import { initArrayBuffer } from '../common/webgl'
import { initCanvasDragEvent, getCanvasEventAxis } from '../common/dom'
import { vec3, vec4 } from '../common/math'

let faces = [vec4(1, 1, 1, 1), vec4(2, 2, 2, 2), vec4(3, 3, 3, 3), vec4(4, 4, 4, 4), vec4(5, 5, 5, 5), vec4(6, 6, 6, 6)]

let angles = [0.0, 0.0]
let mvpMatrix = new Matrix4()

function initVertexBuffers(gl) {
    initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)
    initArrayBuffer(gl, 'a_Color', colors, 3, gl.FLOAT)
    initArrayBuffer(gl, 'a_Face', faces, 1, gl.UNSIGNED_BYTE, 'Uint8Array')

    let indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, flatten(indices, 'Uint8Array'), gl.STATIC_DRAW)
}

function draw(gl, matrix, mvpMatrixLoc) {
    mvpMatrix.set(matrix)
    mvpMatrix.rotate(angles[0], 1.0, 0.0, 0.0)
    mvpMatrix.rotate(angles[1], 0.0, 1.0, 0.0)

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

    let mvpMatrixLoc = gl.getUniformLocation(gl.program, 'u_MvpMatrix')
    let pickedFaceLoc = gl.getUniformLocation(gl.program, 'u_PickedFace')

    gl.uniform1i(pickedFaceLoc, -1)

    initCanvasDragEvent(gl.canvas, (x, y, dx, dy) => {
        angles[0] = Math.max(Math.min(angles[0] + dy, 90.0), -90.0)
        angles[1] = angles[1] + dx
    })

    gl.canvas.onclick = (ev) => {
        let { cx, cy } = getCanvasEventAxis(ev, gl.canvas)
        let face = checkFace(gl, cx, cy, pickedFaceLoc, matrix, mvpMatrixLoc)
        gl.uniform1i(pickedFaceLoc, face)
        draw(gl, matrix, mvpMatrixLoc)
    }

    let tick = () => {
        draw(gl, matrix, mvpMatrixLoc)
        requestAnimationFrame(tick)
    }

    tick()
}

function checkFace(gl, x, y, pickedFaceLoc, matrix, mvpMatrixLoc) {
    let pixels = new Uint8Array(4)

    gl.uniform1i(pickedFaceLoc, 0)
    draw(gl, matrix, mvpMatrixLoc)

    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
    console.log(pixels)

    return pixels[3]
}

window.onload = main
