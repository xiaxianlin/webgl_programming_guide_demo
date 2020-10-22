import { getContext, initShaders } from '../common/init'
import { vertices, colors, indices, texCoords } from './data'
import { flatten } from '../common/utils'
import { Matrix4 } from '../common/matrix'
import { configTexture2D, animate } from '../common/webgl'

let gl = null
let solidProgram = null
let texProgram = null

let angle = 0.0

function initArrayBuffer(program, name, data, num, type) {
    let buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, flatten(data), gl.STATIC_DRAW)
    let loc = gl.getAttribLocation(program, name)
    if (loc < 0) {
        throw `未找到属性${name}`
    }
    gl.vertexAttribPointer(loc, num, type, false, 0, 0)
    gl.enableVertexAttribArray(loc)
}

function loadImageTexture(program, locName, src) {
    let texture = gl.createTexture()
    let samplerLoc = gl.getUniformLocation(program, locName)

    return new Promise((resovle) => {
        let image = new Image()
        image.onload = () => {
            configTexture2D(gl, texture, samplerLoc, image)
            resovle()
        }
        image.src = src
    })
}

function drawTexCube() {
    gl.useProgram(texProgram)
    initArrayBuffer(texProgram, 'a_Position', vertices, 3, gl.FLOAT)
    initArrayBuffer(texProgram, 'a_TexCoord', texCoords, 2, gl.FLOAT)

    let indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, flatten(indices, 'Uint8Array'), gl.STATIC_DRAW)

    let mvpMatrix = new Matrix4()
    mvpMatrix.setPerspective(30, gl.canvas.width / gl.canvas.height, 1, 100)
    mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0)
    mvpMatrix.scale(0.3, 0.3, 0.3)
    mvpMatrix.translate(3, 1, 0)
    mvpMatrix.rotate(angle, 0, 1, 0)

    let mvpMatrixLoc = gl.getUniformLocation(texProgram, 'u_MvpMatrix')
    gl.uniformMatrix4fv(mvpMatrixLoc, false, mvpMatrix.elements)

    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0)
}

function drawSolidCube() {
    gl.useProgram(solidProgram)

    initArrayBuffer(solidProgram, 'a_Position', vertices, 3, gl.FLOAT)
    initArrayBuffer(solidProgram, 'a_Color', colors, 3, gl.FLOAT)

    let buffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, flatten(indices, 'Uint8Array'), gl.STATIC_DRAW)

    let mvpMatrix = new Matrix4()
    mvpMatrix.setPerspective(30, 1, 1, 100)
    mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0)
    mvpMatrix.scale(0.3, 0.3, 0.3)
    mvpMatrix.translate(-3, 0, 0)
    mvpMatrix.rotate(angle, 0, 1, 0)

    let mvpMatrixLoc = gl.getUniformLocation(solidProgram, 'u_MvpMatrix')
    gl.uniformMatrix4fv(mvpMatrixLoc, false, mvpMatrix.elements)

    gl.drawElements(gl.TRIANGLES, indices.length * 3, gl.UNSIGNED_BYTE, 0)
}

window.onload = () => {
    gl = getContext('webgl')
    solidProgram = initShaders(gl, 'solidVertexShader', 'solidFragmentShader')
    texProgram = initShaders(gl, 'texVertexShader', 'texFragmentShader')

    gl.enable(gl.DEPTH_TEST)
    gl.clearColor(0.0, 0.0, 0.0, 1.0)

    let animiteFn = animate((gap) => {
        angle += gap / 20
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        drawSolidCube()
        drawTexCube()
        requestAnimationFrame(animiteFn)
    })

    loadImageTexture(texProgram, 'u_Sampler', 'texture0.png').then(() => animiteFn())
}
