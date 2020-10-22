import { getGL } from '../common/init'
import { flatten } from '../common/utils'
import { Matrix4 } from '../common/matrix'
import { vertices, indices } from './data'
import { initArrayBuffer } from '../common/webgl'
import { initCanvasDragEvent, getCanvasEventAxis } from '../common/dom'
import { vec3 } from '../common/math'

let angles = [0.0, 0.0]
let mvpMatrix = new Matrix4()
let colors = []

for (let i = 0; i < 24; i++) {
    colors.push(vec3(1, 1, 1))
}

function initVertexBuffers(gl) {
    initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)
    initArrayBuffer(gl, 'a_Color', colors, 3, gl.FLOAT)

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
    let clickLoc = gl.getUniformLocation(gl.program, 'u_Clicked')

    initCanvasDragEvent(gl.canvas, (x, y, dx, dy) => {
        angles[0] = Math.max(Math.min(angles[0] + dy, 90.0), -90.0)
        angles[1] = angles[1] + dx
    })

    gl.canvas.onclick = (ev) => {
        let {cx, cy } = getCanvasEventAxis(ev, gl.canvas)
        let picked = check(gl, cx, cy, clickLoc, matrix, mvpMatrixLoc)
        if (picked) {
            console.log('The cube was selected!')
        }
    }

    let tick = () => {
        draw(gl, matrix, mvpMatrixLoc)
        requestAnimationFrame(tick)
    }

    tick()
}

function check(gl, x, y, clickLoc, matrix, mvpMatrixLoc) {
    let picked = false
    gl.uniform1i(clickLoc, 1)
    draw(gl, matrix, mvpMatrixLoc)

    let pixels = new Uint8Array(4)
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
    if (pixels[0] === 255) {
        picked = true
    }

    gl.uniform1i(clickLoc, 0)
    draw(gl, matrix, mvpMatrixLoc)

    return picked
}

window.onload = main
