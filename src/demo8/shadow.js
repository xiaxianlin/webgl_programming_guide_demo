import { getContext, initShaders } from '../common/init'
import { flatten } from '../common/utils'
import { Matrix4 } from '../common/matrix'
import {
    animate,
    initArrayBufferForLaterUse,
    initElementArrayBufferForLaterUse,
    initAttributeVariable
} from '../common/webgl'

const SCREEN_WIDTH = 2048
const SCREEN_HEIGHT = 2048

const LIGHT_X = 0
const LIGHT_Y = 40
const LIGHT_Z = 2

let gl = null
let angle = 0.0
let image = null
let locations = {}
let mvpMatrix = new Matrix4()
let modelMatrix = new Matrix4()

function initVertexBufferForTriangle() {
    let vertices = [-0.8, 3.5, 0.0, 0.8, 3.5, 0.0, 0.0, 3.5, 1.8]
    let colors = [1.0, 0.5, 0.0, 1.0, 0.5, 0.0, 1.0, 0.0, 0.0]
    let indices = [0, 1, 2]
    let buffers = {
        vertexBuffer: initArrayBufferForLaterUse(gl, vertices, 3, gl.FLOAT),
        colorBuffer: initArrayBufferForLaterUse(gl, colors, 3, gl.FLOAT),
        indexBuffer: initElementArrayBufferForLaterUse(gl, indices, gl.UNSIGNED_BYTE, 'Uint8Array'),
        numIndices: indices.length
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
    return buffers
}

function initVertexBuffersForPlane() {
    let vertices = [3.0, -1.7, 2.5, -3.0, -1.7, 2.5, -3.0, -1.7, -2.5, 3.0, -1.7, -2.5]
    let colors = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]
    let indices = [0, 1, 2, 0, 2, 3]
    let buffers = {
        vertexBuffer: initArrayBufferForLaterUse(gl, vertices, 3, gl.FLOAT),
        colorBuffer: initArrayBufferForLaterUse(gl, colors, 3, gl.FLOAT),
        indexBuffer: initElementArrayBufferForLaterUse(gl, indices, gl.UNSIGNED_BYTE, 'Uint8Array'),
        numIndices: indices.length
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
    return buffers
}

function initFramebufferObject() {
    let frameBuffer = gl.createFramebuffer()

    let texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, SCREEN_WIDTH, SCREEN_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

    let depthBuffer = gl.createRenderbuffer()
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer)
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, SCREEN_WIDTH, SCREEN_HEIGHT)

    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer)

    let e = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
    if (e !== gl.FRAMEBUFFER_COMPLETE) {
        throw '帧缓存创建失败'
    }

    frameBuffer.texture = texture

    gl.bindTexture(gl.TEXTURE_2D, null)
    gl.bindRenderbuffer(gl.RENDERBUFFER, null)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    return frameBuffer
}

function drawTriangle(program, triangle, matrix) {
    modelMatrix.setRotate(angle, 0, 1, 0)
    draw(program, triangle, matrix)
}

function drawPlane(program, plane, matrix) {
    modelMatrix.setRotate(-45, 0, 1, 1)
    draw(program, plane, matrix)
}

function draw(program, o, matrix) {
    initAttributeVariable(gl, program.positionLoc, o.vertexBuffer)
    if (program.colorLoc != undefined) {
        initAttributeVariable(gl, program.colorLoc, o.colorBuffer)
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer)

    mvpMatrix.set(matrix)
    mvpMatrix.multiply(modelMatrix)
    gl.uniformMatrix4fv(program.mvpMatrixLoc, false, mvpMatrix.elements)

    gl.drawElements(gl.TRIANGLES, o.numIndices, gl.UNSIGNED_BYTE, 0)
}

function main() {
    gl = getContext('webgl')

    let shadowProgram = initShaders(gl, 'shadowVertexShader', 'shadowFragmentShader')
    shadowProgram.positionLoc = gl.getAttribLocation(shadowProgram, 'a_Position')
    shadowProgram.mvpMatrixLoc = gl.getUniformLocation(shadowProgram, 'u_MvpMatrix')

    let normalProgram = initShaders(gl, 'vertexShader', 'fragmentShader')
    normalProgram.positionLoc = gl.getAttribLocation(normalProgram, 'a_Position')
    normalProgram.colorLoc = gl.getAttribLocation(normalProgram, 'a_Color')
    normalProgram.mvpMatrixLoc = gl.getUniformLocation(normalProgram, 'u_MvpMatrix')
    normalProgram.lightMvpMatrixLoc = gl.getUniformLocation(normalProgram, 'u_MvpMatrixFromLight')
    normalProgram.samplerLoc = gl.getUniformLocation(normalProgram, 'u_Sampler')

    let triangle = initVertexBufferForTriangle()
    let plane = initVertexBuffersForPlane()
    let fbo = initFramebufferObject()

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, fbo.texture)

    let lightMatrix = new Matrix4()
    lightMatrix.setPerspective(70, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 200)
    lightMatrix.lookAt(LIGHT_X, LIGHT_Y, LIGHT_Z, 0, 0, 0, 0, 1, 0)

    let matrix = new Matrix4()
    matrix.setPerspective(45, gl.canvas.width / gl.canvas.height, 1, 100)
    matrix.lookAt(0, 7, 9, 0, 0, 0, 0, 1, 0)

    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST)

    let triangeLightMatrix = new Matrix4()
    let planeLightMatrix = new Matrix4()

    let animiteFn = animate((gap) => {
        angle += gap / 30

        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
        gl.viewport(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        gl.useProgram(shadowProgram)
        drawTriangle(shadowProgram, triangle, lightMatrix)
        triangeLightMatrix.set(mvpMatrix)
        drawPlane(shadowProgram, plane, lightMatrix)
        planeLightMatrix.set(mvpMatrix)

        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        gl.useProgram(normalProgram)
        gl.uniform1i(normalProgram.samplerLoc, 0)
        gl.uniformMatrix4fv(normalProgram.lightMvpMatrixLoc, false, triangeLightMatrix.elements)
        drawTriangle(normalProgram, triangle, matrix)
        gl.uniformMatrix4fv(normalProgram.lightMvpMatrixLoc, false, planeLightMatrix.elements)
        drawPlane(normalProgram, plane, matrix)

        requestAnimationFrame(animiteFn)
    })
    animiteFn()
}

window.onload = () => main()
