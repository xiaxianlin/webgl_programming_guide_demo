import { getGL } from '../common/init'
import { getColors } from '../common/utils'

const points = []
const colors = []

function click(ev, gl, loc, colorLoc) {
    let x = ev.clientX
    let y = ev.clientY
    let rect = ev.target.getBoundingClientRect()

    x = (x - rect.top - gl.canvas.width / 2) / (gl.canvas.width / 2)
    y = (gl.canvas.height / 2 - y + rect.left) / (gl.canvas.height / 2)

    points.push([x, y])
    if (x >= 0.0 && y >= 0.0) {
        colors.push(getColors(1))
    } else if (x < 0.0 && y < 0.0) {
        colors.push(getColors(3))
    } else {
        colors.push(getColors(5))
    }
    gl.clear(gl.COLOR_BUFFER_BIT)
    for (let i = 0; i < points.length; i++) {
        let [x, y] = points[i]
        let [r, g, b, a] = colors[i]
        gl.vertexAttrib3f(loc, x, y, 0.0)
        gl.uniform4f(colorLoc, r, g, b, a)
        gl.drawArrays(gl.POINTS, 0, 1)
    }
}

function main() {
    let gl = getGL()
    let loc = gl.getAttribLocation(gl.program, 'a_Position')
    let colorLoc = gl.getUniformLocation(gl.program, 'u_FragColor')

    gl.clearColor(0.0, 0.0, 0.0, 1.0)

    gl.canvas.onmousedown = (ev) => click(ev, gl, loc, colorLoc)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.POINTS, 0, 1)
}

window.onload = main
