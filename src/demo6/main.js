import { getGL } from '../common/init'
import { vec3 } from '../common/math'
import { setLookAt, flatten } from '../common/utils'
import { Matrix4, Vector4, Vector3 } from '../common/matrix'

const vertices = [
    // 前
    vec3(1, 1, 1),
    vec3(-1, 1, 1),
    vec3(-1, -1, 1),
    vec3(1, -1, 1),
    // 右
    vec3(1, 1, 1),
    vec3(1, -1, 1),
    vec3(1, -1, -1),
    vec3(1, 1, -1),
    // 上
    vec3(1, 1, 1),
    vec3(1, 1, -1),
    vec3(-1, 1, -1),
    vec3(-1, 1, 1),
    // 左
    vec3(-1, 1, 1),
    vec3(-1, 1, -1),
    vec3(-1, -1, -1),
    vec3(-1, -1, 1),
    // 下
    vec3(-1, -1, 1),
    vec3(1, -1, 1),
    vec3(1, -1, -1),
    vec3(-1, -1, -1),
    // 后
    vec3(-1, -1, -1),
    vec3(1, -1, -1),
    vec3(1, 1, -1),
    vec3(-1, 1, -1)
]

const normalizes = [
    vec3(0, 0, 1),
    vec3(0, 0, 1),
    vec3(0, 0, 1),
    vec3(0, 0, 1),

    vec3(0, 1, 0),
    vec3(0, 1, 0),
    vec3(0, 1, 0),
    vec3(0, 1, 0),

    vec3(1, 0, 0),
    vec3(1, 0, 0),
    vec3(1, 0, 0),
    vec3(1, 0, 0),

    vec3(0, -1, 0),
    vec3(0, -1, 0),
    vec3(0, -1, 0),
    vec3(0, -1, 0),

    vec3(-1, 0, 0),
    vec3(-1, 0, 0),
    vec3(-1, 0, 0),
    vec3(-1, 0, 0),

    vec3(0, 0, -1),
    vec3(0, 0, -1),
    vec3(0, 0, -1),
    vec3(0, 0, -1)
]

const indices = [
    // 前
    vec3(0, 1, 2),
    vec3(0, 2, 3),
    // 右
    vec3(4, 5, 6),
    vec3(4, 6, 7),
    // 上
    vec3(8, 9, 10),
    vec3(8, 10, 11),
    // 左
    vec3(12, 13, 14),
    vec3(12, 14, 15),
    // 下
    vec3(16, 17, 18),
    vec3(16, 18, 19),
    // 后
    vec3(20, 21, 22),
    vec3(20, 22, 23)
]

const colors = []
for (let i = 0; i < 24; i++) {
    colors.push(vec3(1, 1, 1))
}

function initVertexBuffers(gl) {
    let positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW)
    let positionLoc = gl.getAttribLocation(gl.program, 'a_Position')
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(positionLoc)

    let colorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW)
    let colorLoc = gl.getAttribLocation(gl.program, 'a_Color')
    gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(colorLoc)

    let normalBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalizes), gl.STATIC_DRAW)
    let normalLoc = gl.getAttribLocation(gl.program, 'a_Normal')
    gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(normalLoc)

    let indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, flatten(indices, 'Uint8Array'), gl.STATIC_DRAW)
}

function main() {
    // let gl = getGL('vertexShader0', 'fragmentShader0')
    let gl = getGL('vertexShader', 'fragmentShader')
    initVertexBuffers(gl)
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.enable(gl.DEPTH_TEST)

    // 设置光线颜色
    let lightColorLoc = gl.getUniformLocation(gl.program, 'u_LightColor')
    gl.uniform3f(lightColorLoc, 1.0, 1.0, 1.0)

    let lightPositionLoc = gl.getUniformLocation(gl.program, 'u_LightPosition')
    gl.uniform3f(lightPositionLoc, 0.0, 3.0, 4.0)

    // 设置光线方向
    let lightDirectionLoc = gl.getUniformLocation(gl.program, 'u_LightDirection')
    let lightDirection = new Vector3([0.5, 3.0, 4.0])
    lightDirection.normalize()
    gl.uniform3fv(lightDirectionLoc, lightDirection.elements)

    // 设置环境光
    let ambientLightLoc = gl.getUniformLocation(gl.program, 'u_AmientLight')
    gl.uniform3f(ambientLightLoc, 0.0, 0.2, 0.5)

    draw(gl)
}

let angle = 0
function draw(gl) {
    angle += 1
    // 模型矩阵，计算移动数据
    let modelMatrix = new Matrix4()
    // modelMatrix.setTranslate(0, 1, 0)
    modelMatrix.rotate(angle, 0, 1, 1)
    let modelMatrixLoc = gl.getUniformLocation(gl.program, 'u_ModelMatrix')
    gl.uniformMatrix4fv(modelMatrixLoc, false, modelMatrix.elements)

    // 模视矩阵
    let mvpMatrix = new Matrix4()
    mvpMatrix.setPerspective(40, gl.canvas.width / gl.canvas.height, 1, 100)
    mvpMatrix.lookAt(-7, 2.5, 6, 0, 0, 0, 0, 1, 0)
    mvpMatrix.multiply(modelMatrix)
    let mvpMatrixLoc = gl.getUniformLocation(gl.program, 'u_MvpMatrix')
    gl.uniformMatrix4fv(mvpMatrixLoc, false, mvpMatrix.elements)

    // 逆转置矩阵，重新计算法向量使用
    let normalMatrix = new Matrix4()
    normalMatrix.setInverseOf(modelMatrix)
    normalMatrix.transpose()
    let normalMatrixLoc = gl.getUniformLocation(gl.program, 'u_NormalMatrix')
    gl.uniformMatrix4fv(normalMatrixLoc, false, normalMatrix.elements)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.drawElements(gl.TRIANGLES, indices.length * 3, gl.UNSIGNED_BYTE, 0)

    requestAnimationFrame(() => draw(gl))
}

window.onload = main
