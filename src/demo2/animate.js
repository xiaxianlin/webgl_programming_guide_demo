import { getGL } from '../common/init'
import { vec2, vec4, mat4, mat2, mult } from '../common/math'
import { flatten, createRotateMatrix, getRadian, createTranslateMatrix } from '../common/utils'

const vertices = [vec2(0.0, 0.5), vec2(-0.5, -0.5), vec2(0.5, -0.5)]

const angle_step = 15.0

const times = {
    last: Date.now()
}

function initVertexBuffers(gl) {
    let buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW)

    let loc = gl.getAttribLocation(gl.program, 'vPosition')
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(loc)
}

function animate(angle) {
    let now = Date.now()
    let elapsed = now - times.last
    times.last = now
    let newAngle = angle + (angle_step * elapsed) / 1000.0
    return (newAngle %= 360)
}

function draw(gl, angle, xformMatrixLoc) {
    let xformRMatrix = createRotateMatrix(getRadian(angle), 0.0, 0.0, 1.0)
    let xformTMatrix = createTranslateMatrix(0.35, 0.0, 0.0)
    let xformMatrix = mult(xformTMatrix, xformRMatrix)
    gl.uniformMatrix4fv(xformMatrixLoc, false, flatten(xformMatrix))
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length)
}

function main() {
    let gl = getGL()
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clearColor(1.0, 1.0, 1.0, 1.0)

    initVertexBuffers(gl)

    let xformMatrixLoc = gl.getUniformLocation(gl.program, 'xformMatrix')

    let currentAngle = 0.0
    let tick = function () {
        currentAngle = animate(currentAngle)
        draw(gl, currentAngle, xformMatrixLoc)
        requestAnimationFrame(tick)
    }
    tick()
}

window.onload = main
