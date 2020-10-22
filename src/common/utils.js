import { vec4, mat4, mult } from './math'
import { Vector3 } from './matrix'

export function getColors(index) {
    let colors = [
        vec4(0.0, 0.0, 0.0, 1.0), // 黑
        vec4(1.0, 0.0, 0.0, 1.0), // 红
        vec4(1.0, 1.0, 0.0, 1.0), // 黄
        vec4(0.0, 1.0, 0.0, 1.0), // 绿
        vec4(0.0, 0.0, 1.0, 1.0), // 蓝
        vec4(1.0, 0.0, 1.0, 1.0), // 品红
        vec4(0.0, 1.0, 1.0, 1.0), // 青
        vec4(1.0, 1.0, 1.0, 1.0) // 白
    ]
    if (Number.isInteger(index) && index < 8) {
        return colors[index]
    }
    return colors
}

export function getRadian(angle) {
    return (Math.PI * angle) / 180.0
}

export function initTypeArray(type, n = 0) {
    switch (type) {
        case 'Float32Array':
            return new Float32Array(n)
        case 'Uint16Array':
            return new Uint16Array(n)
        case 'Uint8Array':
            return new Uint8Array(n)
    }
}

export function flatten(v, type = 'Float32Array') {
    let n = v.length
    let elemsAreArrays = false

    if (Array.isArray(v[0])) {
        elemsAreArrays = true
        n *= v[0].length
    }

    let floats = initTypeArray(type, n)

    if (elemsAreArrays) {
        let idx = 0
        for (let i = 0; i < v.length; ++i) {
            for (let j = 0; j < v[i].length; ++j) {
                floats[idx++] = v[i][j]
            }
        }
    } else {
        for (let i = 0; i < v.length; ++i) {
            floats[i] = v[i]
        }
    }

    return floats
}

/**
 * 创建绕任意轴旋转的变换矩阵
 * @param theta 旋转弧度
 * @param x x轴
 * @param y y轴
 * @param z z轴
 */
export function createRotateMatrix(theta, x, y, z) {
    let s = Math.sin(theta)
    let c = Math.cos(theta)
    let omc = 1 - Math.cos(theta)
    let matrix = mat4()

    matrix[0][0] = x * x * omc + c
    matrix[0][1] = x * y * omc + z * s
    matrix[0][2] = x * z * omc - y * s

    matrix[1][0] = x * y * omc - z * s
    matrix[1][1] = y * y * omc + c
    matrix[1][2] = y * z * omc + x * s

    matrix[2][0] = x * z * omc + y * s
    matrix[2][1] = y * z * omc - x * s
    matrix[3][2] = z * z * omc + c

    return matrix
}

/**
 * 创建绕任意轴平移的变换矩阵
 * @param x x轴
 * @param y y轴
 * @param z z轴
 */
export function createTranslateMatrix(x, y, z) {
    let matrix = mat4()
    matrix[3][0] = x
    matrix[3][1] = y
    matrix[3][2] = z
    return matrix
}

export function setLookAt(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ) {
    let e, fx, fy, fz, rlf, sx, sy, sz, rls, ux, uy, uz

    fx = centerX - eyeX
    fy = centerY - eyeY
    fz = centerZ - eyeZ

    // Normalize f.
    rlf = 1 / Math.sqrt(fx * fx + fy * fy + fz * fz)
    fx *= rlf
    fy *= rlf
    fz *= rlf

    // Calculate cross product of f and up.
    sx = fy * upZ - fz * upY
    sy = fz * upX - fx * upZ
    sz = fx * upY - fy * upX

    // Normalize s.
    rls = 1 / Math.sqrt(sx * sx + sy * sy + sz * sz)
    sx *= rls
    sy *= rls
    sz *= rls

    // Calculate cross product of s and f.
    ux = sy * fz - sz * fy
    uy = sz * fx - sx * fz
    uz = sx * fy - sy * fx

    let m = mat4(vec4(sx, ux, -fx, 0), vec4(sy, uy, -fy, 0), vec4(sz, uz, -fz), vec4(0, 0, 0, 1))
    let t = createTranslateMatrix(-eyeX, -eyeY, -eyeZ)
    return mult(t, m)
}

export function calcNormal(p0, p1, p2) {
    let v0 = new Float32Array(3)
    let v1 = new Float32Array(3)
    for (let i = 0; i < 3; i++) {
        v0[i] = p0[i] - p1[i]
        v1[i] = p2[i] - p1[i]
    }
    let c = new Float32Array(3)
    c[0] = v0[1] * v1[2] - v0[2] * v1[1]
    c[1] = v0[2] * v1[0] - v0[0] * v1[2]
    c[2] = v0[0] * v1[1] - v0[1] * v1[0]
    let v = new Vector3(c)
    v.normalize()
    return v.elements
}
