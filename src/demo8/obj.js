import { getGL } from '../common/init'
import { createEmptyArrayBuffer, animate } from '../common/webgl'
import OBJDoc from '../common/OBJDoc'
import { Matrix4 } from '../common/matrix'

let gl = null
let positionLoc = null
let colorLoc = null
let normalLoc = null
let mvpMatrixLoc = null
let normalMatrixLoc = null

let objDoc = null
let drawingInfo = null

let mvpMatrix = new Matrix4()
let modelMatrix = new Matrix4()
let normallMatrix = new Matrix4()

let angle = 30

function initVertexBuffers() {
    return {
        vertexBuffer: createEmptyArrayBuffer(gl, positionLoc, 3, gl.FLOAT),
        normalBuffer: createEmptyArrayBuffer(gl, normalLoc, 3, gl.FLOAT),
        colorBuffer: createEmptyArrayBuffer(gl, colorLoc, 4, gl.FLOAT),
        indexBuffer: gl.createBuffer()
    }
}

function readOBJFile(fileName, buffers, scale, reverse) {
    let xhr = new XMLHttpRequest()
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status !== 404) {
            onReadOBJFile(xhr.responseText, fileName, buffers, scale, reverse)
        }
    }
    xhr.open('GET', fileName, true)
    xhr.send()
}

function onReadOBJFile(fileString, fileName, buffers, scale, reverse) {
    let doc = new OBJDoc(fileName)
    let result = doc.parse(fileString, scale, reverse)
    if (!result) {
        objDoc = null
        drawingInfo = null
        console.log('OBJ文件解析失败')
        return
    }
    objDoc = doc
}

function draw(matrix, buffers) {
    if (objDoc != null && objDoc.isMTLComplete()) {
        readComplete(buffers)
        objDoc = null
    }
    if (!drawingInfo) return

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    modelMatrix.setRotate(angle, 1, 0, 0)
    modelMatrix.rotate(angle, 0, 1, 0)
    modelMatrix.rotate(angle, 0, 0, 1)

    normallMatrix.setInverseOf(modelMatrix)
    normallMatrix.transpose()
    gl.uniformMatrix4fv(normalMatrixLoc, false, normallMatrix.elements)

    mvpMatrix.set(matrix)
    mvpMatrix.multiply(modelMatrix)
    gl.uniformMatrix4fv(mvpMatrixLoc, false, mvpMatrix.elements)
    gl.drawElements(gl.TRIANGLES, drawingInfo.indices.length, gl.UNSIGNED_SHORT, 0)
}

function readComplete(buffers) {
    drawingInfo = objDoc.getDrawingInfo()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.vertices, gl.STATIC_DRAW)

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normalBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.normals, gl.STATIC_DRAW)

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colorBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.colors, gl.STATIC_DRAW)

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, drawingInfo.indices, gl.STATIC_DRAW)
}

function main() {
    gl = getGL()
    positionLoc = gl.getAttribLocation(gl.program, 'a_Position')
    colorLoc = gl.getAttribLocation(gl.program, 'a_Color')
    normalLoc = gl.getAttribLocation(gl.program, 'a_Normal')
    mvpMatrixLoc = gl.getUniformLocation(gl.program, 'u_MvpMatrix')
    normalMatrixLoc = gl.getUniformLocation(gl.program, 'u_NormalMatrix')

    let buffers = initVertexBuffers()

    let matrix = new Matrix4()
    matrix.setPerspective(30.0, 1.0, 1.0, 5000.0)
    matrix.lookAt(0.0, 500.0, 200.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0)

    readOBJFile('cube.obj', buffers, 60, true)

    gl.clearColor(0.2, 0.2, 0.2, 1.0)
    gl.enable(gl.DEPTH_TEST)

    let animiteFn = animate((gap) => {
        angle += gap / 30
        draw(matrix, buffers)
        requestAnimationFrame(animiteFn)
    })
    animiteFn()
}

window.onload = main
