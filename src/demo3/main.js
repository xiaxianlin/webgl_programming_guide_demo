import { getGL } from '../common/init'
import { getColors, flatten } from '../common/utils'
import { vec2 } from '../common/math'

const vertices = [vec2(0.0, 0.5), vec2(-0.5, -0.5), vec2(0.5, -0.5)]
const colors = [getColors(1), getColors(2), getColors(3)]
const sizes = new Float32Array([10.0, 20.0, 30.0])

function initVertexBuffers(gl) {
    let buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW)
    let loc = gl.getAttribLocation(gl.program, 'vPosition')
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(loc)

    let sizeBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.STATIC_DRAW)
    let sizeLoc = gl.getAttribLocation(gl.program, 'vPointSize')
    gl.vertexAttribPointer(sizeLoc, 1, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(sizeLoc)

    let colorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW)
    let colorLoc = gl.getAttribLocation(gl.program, 'vColor')
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(colorLoc)
}

function main() {
    let gl = getGL()
    initVertexBuffers(gl)
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length)
}

window.onload = main
