import { getGL } from '../common/init'
import { vec3 } from '../common/math'
import { initArrayBuffer, animate } from '../common/webgl'

const vertices = [vec3(0.0, 0.5, 0), vec3(-0.5, -0.5, 0), vec3(0.5, -0.5, 0)]

let theta = 0.0

function main() {
    let gl = getGL()
    gl.clearColor(0.0, 0.0, 0.0, 1.0)

    initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)

    let thetaLoc = gl.getUniformLocation(gl.program, 'theta')

    let animateFn = animate((gap) => {
        theta += gap / 1000
        draw(gl, thetaLoc)
        requestAnimationFrame(animateFn)
    })

    animateFn()
}

function draw(gl, thetaLoc) {
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.uniform1f(thetaLoc, theta)
    gl.drawArrays(gl.POINTS, 0, vertices.length)
}

window.onload = main
