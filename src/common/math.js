import { flatten } from './utils'

function assetMatrixMatch(u, v, fnName) {
    if (u.length !== v.length) {
        throw fnName + '：矩阵行数不匹配'
    }
}

function assetVectorMath(u, v, fnName, msg = '向量长度不匹配') {
    if (u.length !== v.length) {
        throw fnName + ':' + msg
    }
}

export function vec2(x = 0.0, y = 0.0) {
    return [x, y]
}
export function vec3(x = 0.0, y = 0.0, z = 0.0) {
    return [x, y, z]
}
export function vec4(x = 0.0, y = 0.0, z = 0.0, w = 0.0) {
    return [x, y, z, w]
}

export function mat2(v1 = vec2(1.0), v2 = vec2(0.0, 1.0)) {
    let m = [v1, v2]
    m.matrix = true
    return m
}

export function mat3(v1 = vec3(1.0), v2 = vec3(0.0, 1.0), v3 = vec3(0.0, 0.0, 1.0)) {
    let m = [v1, v2, v3]
    m.matrix = true
    return m
}

export function mat4(
    v1 = vec4(1.0, 0.0, 0.0, 0.0),
    v2 = vec4(0.0, 1.0, 0.0, 0.0),
    v3 = vec4(0.0, 0.0, 1.0, 0.0),
    v4 = vec4(0.0, 0.0, 0.0, 1.0)
) {
    let m = [v1, v2, v3, v4]
    m.matrix = true
    return m
}

export function add(u, v) {
    let result = []
    // 两个都是矩阵
    if (u.matrix && v.matrix) {
        assetMatrixMatch(u, v, 'add()')
        for (let i = 0; i < u.length; i++) {
            assetVectorMath(u[i], v[i], 'add()', '矩阵列数不匹配')
            result.push([])
            for (let j = 0; j < u[i].length; j++) {
                result[i].push(u[i][j] + v[i][j])
            }
        }
        return result
    }
    // 两个都是向量
    if (!u.matrix && !v.matrix) {
        assetVectorMath(u, v, 'add()')
        for (let i = 0; i < u.length; i++) {
            result.push(u[i] + v[i])
        }
        return result
    }
    throw 'add()：矩阵与非矩阵无法进行加法运算'
}

export function mult(u, v) {
    var result = []
    // 矩阵相乘
    if (u.matrix && v.matrix) {
        assetMatrixMatch(u, v, 'mult()')
        for (var i = 0; i < u.length; ++i) {
            assetVectorMath(u[i], v[i], 'add()', '矩阵列数不匹配')
            result.push([])
            for (var j = 0; j < v.length; ++j) {
                var sum = 0.0
                for (var k = 0; k < u.length; ++k) {
                    sum += u[i][k] * v[k][j]
                }
                result[i].push(sum)
            }
        }
        result.matrix = true
        return result
    }

    // 向量相乘
    if (!u.matrix && !v.matrix) {
        assetVectorMath(u, v, 'mult()')
        for (let i = 0; i < u.length; ++i) {
            result.push(u[i] * v[i])
        }
        return result
    }
}

export function transpose(m) {
    if (!m.matrix) {
        return 'transpose(): 试图转置一个非矩阵'
    }
    let result = []
    for (let i = 0; i < m.length; ++i) {
        result.push([])
        for (let j = 0; j < m[i].length; ++j) {
            result[i].push(m[j][i])
        }
    }

    result.matrix = true
    return result
}

export const sizeof = {
    vec2: new Float32Array(flatten(vec2())).byteLength,
    vec3: new Float32Array(flatten(vec3())).byteLength,
    vec4: new Float32Array(flatten(vec4())).byteLength,
    mat2: new Float32Array(flatten(mat2())).byteLength,
    mat3: new Float32Array(flatten(mat3())).byteLength,
    mat4: new Float32Array(flatten(mat4())).byteLength
}
