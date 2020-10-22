import { flatten } from './utils'

export function animate(callback) {
    let last = Date.now()
    return () => {
        let now = Date.now()
        callback(now - last)
        last = now
    }
}

export function configTexture2D(gl, texture, loc, image) {
    // 对纹理图像进行y轴反转
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
    // 激活纹理单元
    gl.activeTexture(gl.TEXTURE0)
    // 向target绑定纹理对象
    gl.bindTexture(gl.TEXTURE_2D, texture)
    // 配置纹理参数
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    // 配置纹理图像
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image)
    // 将0号纹理传递给着色器
    gl.uniform1i(loc, 0)
}

export function loadImageTexture(gl, locName, src) {
    let texture = gl.createTexture()
    let samplerLoc = gl.getUniformLocation(gl.program, locName)

    return new Promise((resovle) => {
        let image = new Image()
        image.onload = () => {
            configTexture2D(gl, texture, samplerLoc, image)
            resovle()
        }
        image.src = src
    })
}

export function initArrayBufferForLaterUse(gl, data, num, type, dataType) {
    data = flatten(data, dataType)
    let buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
    buffer.num = num
    buffer.type = type
    return buffer
}

export function initElementArrayBufferForLaterUse(gl, data, type, dataType) {
    data = flatten(data, dataType)
    let buffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW)
    buffer.type = type
    return buffer
}

export function initArrayBuffer(gl, name, data, num, type, dataType) {
    data = flatten(data, dataType)
    let buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
    let loc = gl.getAttribLocation(gl.program, name)
    if (loc < 0) {
        throw `未找到属性${name}`
    }
    gl.vertexAttribPointer(loc, num, type, false, 0, 0)
    gl.enableVertexAttribArray(loc)
}

export function initAttributeVariable(gl, loc, buffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.vertexAttribPointer(loc, buffer.num, buffer.type, false, 0, 0)
    gl.enableVertexAttribArray(loc)
}

export function createEmptyArrayBuffer(gl, loc, num, type) {
    let buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.vertexAttribPointer(loc, num, type, false, 0, 0)
    gl.enableVertexAttribArray(loc)
    return buffer
}
