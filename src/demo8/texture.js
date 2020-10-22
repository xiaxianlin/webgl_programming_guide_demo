import { getContext, initShaders, getGL } from '../common/init'
import { flatten } from '../common/utils'
import { Matrix4 } from '../common/matrix'
import { vec3, vec2 } from '../common/math'
import { animate, initArrayBufferForLaterUse, initElementArrayBufferForLaterUse } from '../common/webgl'
import { vertices, colors, indices, texCoords } from './data'

const planeVertices = [vec3(1, 1, 0), vec3(-1, 1, 0), vec3(-1, -1, 0), vec3(1, -1, 0)]
const planeTexCoords = [vec2(1, 1), vec2(0, 1), vec2(0, 0), vec2(1, 0)]
const planeIndices = [vec3(0, 1, 2), vec3(0, 2, 3)]

const SCREEN_WIDTH = 256
const SCREEN_HEIGHT = 256

let gl = null
let angle = 0.0
let image = null
let locations = {}
let mvpMatrix = new Matrix4()
let modelMatrix = new Matrix4()

function initVertexBufferForCube() {
    let buffers = {
        vertexBuffer: initArrayBufferForLaterUse(gl, vertices, 3, gl.FLOAT),
        texCoordBuffer: initArrayBufferForLaterUse(gl, texCoords, 2, gl.FLOAT),
        indexBuffer: initElementArrayBufferForLaterUse(gl, indices, gl.UNSIGNED_BYTE, 'Uint8Array'),
        numIndices: 36
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
    return buffers
}

function initVertexBuffersForPlane() {
    let buffers = {
        vertexBuffer: initArrayBufferForLaterUse(gl, planeVertices, 3, gl.FLOAT),
        texCoordBuffer: initArrayBufferForLaterUse(gl, planeTexCoords, 2, gl.FLOAT),
        indexBuffer: initElementArrayBufferForLaterUse(gl, planeIndices, gl.UNSIGNED_BYTE, 'Uint8Array'),
        numIndices: 6
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
    return buffers
}

function initTextures() {
    let texture = gl.createTexture()
    let samplerLoc = gl.getUniformLocation(gl.program, 'u_Sampler')

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
    gl.uniform1i(samplerLoc, 0)

    gl.bindTexture(gl.TEXTURE_2D, null)

    return texture
}

function initFramebufferObject() {
    let frameBuffer = gl.createFramebuffer()

    let texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, SCREEN_WIDTH, SCREEN_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    frameBuffer.texture = texture

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

    gl.bindTexture(gl.TEXTURE_2D, null)
    gl.bindRenderbuffer(gl.RENDERBUFFER, null)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    return frameBuffer
}

function draw(fbo, plane, cube, texture, matrix, fboMatrix) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
    gl.viewport(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT)

    gl.clearColor(0.2, 0.2, 0.4, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    drawTextureCube(cube, texture, fboMatrix)

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    drawTexturePlane(plane, fbo.texture, matrix)
}

function drawTextureCube(cube, texture, matrix) {
    modelMatrix.rotate(20.0, 1.0, 0.0, 0.0)
    modelMatrix.rotate(angle, 0.0, 1.0, 0.0)

    mvpMatrix.set(matrix)
    mvpMatrix.multiply(modelMatrix)
    gl.uniformMatrix4fv(locations.mvpMatrix, false, mvpMatrix.elements)

    drawTextureObject(cube, texture)
}

function drawTexturePlane(plane, texture, matrix) {
    modelMatrix.setTranslate(0, 0, 1)
    modelMatrix.scale(0.8, 0.8, 0.8)
    modelMatrix.rotate(20.0, 1.0, 0.0, 0.0)
    modelMatrix.rotate(angle, 0.0, 1.0, 0.0)

    mvpMatrix.set(matrix)
    mvpMatrix.multiply(modelMatrix)
    gl.uniformMatrix4fv(locations.mvpMatrix, false, mvpMatrix.elements)

    drawTextureObject(plane, texture)
}

function drawTextureObject(obj, texture) {
    let { vertexBuffer, texCoordBuffer, indexBuffer, numIndices } = obj
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.vertexAttribPointer(locations.position, vertexBuffer.num, vertexBuffer.type, false, 0, 0)
    gl.enableVertexAttribArray(locations.position)

    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
    gl.vertexAttribPointer(locations.texCoord, texCoordBuffer.num, texCoordBuffer.type, false, 0, 0)
    gl.enableVertexAttribArray(locations.texCoord)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.drawElements(gl.TRIANGLES, numIndices, indexBuffer.type, 0)
}

function main() {
    gl = getGL()
    locations = {
        position: gl.getAttribLocation(gl.program, 'a_Position'),
        texCoord: gl.getAttribLocation(gl.program, 'a_TexCoord'),
        mvpMatrix: gl.getUniformLocation(gl.program, 'u_MvpMatrix')
    }
    let cube = initVertexBufferForCube()
    let plane = initVertexBuffersForPlane()
    let texture = initTextures()
    let fbo = initFramebufferObject()

    let matrix = new Matrix4()
    matrix.setPerspective(30, gl.canvas.width / gl.canvas.height, 1, 100)
    matrix.lookAt(0, 0, 7, 0, 0, 0, 0, 1, 0)

    let fboMatrix = new Matrix4()
    fboMatrix.setPerspective(30, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 100)
    fboMatrix.lookAt(0, 2, 7, 0, 0, 0, 0, 1, 0)

    gl.enable(gl.DEPTH_TEST)

    let animiteFn = animate((gap) => {
        angle += gap / 30
        draw(fbo, plane, cube, texture, matrix, fboMatrix)
        requestAnimationFrame(animiteFn)
    })
    animiteFn()
}

window.onload = () => {
    image = new Image()
    image.onload = () => main()
    image.src = 'texture0.png'
}
