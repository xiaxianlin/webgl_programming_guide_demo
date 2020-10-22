import { getGL } from '../common/init'
import { getColors, flatten } from '../common/utils'
import { vec4, sizeof, vec2 } from '../common/math'

const vertices = [vec2(-0.5, 0.5), vec2(-0.5, -0.5), vec2(0.5, 0.5), vec2(0.5, -0.5)]

const textures = [vec2(0.0, 1.0), vec2(0.0, 0.0), vec2(1.0, 1.0), vec2(1.0, 0.0)]

let texUnit0 = false,
    texUnit1 = false

function isPowerOf2(value) {
    return (value & (value - 1)) === 0
}

function loadTexture(gl, texture, fSamplerLoc, image, texUnit) {
    // 对纹理图像进行y轴反转
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
    // 激活纹理单元
    if (texUnit === 0) {
        gl.activeTexture(gl.TEXTURE0)
        texUnit0 = true
    } else {
        gl.activeTexture(gl.TEXTURE1)
        texUnit1 = true
    }
    // 向target绑定纹理对象
    gl.bindTexture(gl.TEXTURE_2D, texture)
    // 配置纹理参数，解决non-power-of=2
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    // 配置纹理图像
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image)
    // 将0号纹理传递给着色器
    gl.uniform1i(fSamplerLoc, texUnit)

    if (texUnit0 && texUnit1) {
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertices.length)
    }
}

function initTextures(gl) {
    let texture0 = gl.createTexture()
    let texture1 = gl.createTexture()
    let fSamplerLoc0 = gl.getUniformLocation(gl.program, 'fSampler0')
    let fSamplerLoc1 = gl.getUniformLocation(gl.program, 'fSampler1')

    let image0 = new Image()
    image0.onload = () => loadTexture(gl, texture0, fSamplerLoc0, image0, 0)
    image0.src = 'texture0.png'

    let image1 = new Image()
    image1.onload = () => loadTexture(gl, texture1, fSamplerLoc1, image1, 1)
    image1.src = 'texture1.png'
}

function initVertexBuffers(gl) {
    let buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW)

    let positionLoc = gl.getAttribLocation(gl.program, 'vPosition')
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(positionLoc)

    let texBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, flatten(textures), gl.STATIC_DRAW)

    let texCoordLoc = gl.getAttribLocation(gl.program, 'vTexCoord')
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(texCoordLoc)
}

function main() {
    let gl = getGL()
    initVertexBuffers(gl)
    gl.clearColor(0.0, 0.0, 0.0, 0.0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    initTextures(gl)
}

window.onload = main
