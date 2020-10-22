import { calcNormal } from '../common/utils'
import StringParser from './StringParser'
import { Vertex, OBJObject, Normal, Face, MTLDoc, DrawingInfo, Color } from './structs'

class OBJDoc {
    constructor(fileName) {
        this.fileName = fileName
        this.mtls = []
        this.objects = []
        this.vertices = []
        this.normals = []
    }

    parseMtllib(sp, fileName) {
        let i = fileName.lastIndexOf('/')
        let dirPath = ''
        if (i > 0) dirPath = fileName.substr(0, i + 1)
        return dirPath + sp.getWord()
    }

    parseObjectName(sp) {
        let name = sp.getWord()
        return new OBJObject(name)
    }

    parseVertex(sp, scale) {
        let x = sp.getFloat() * scale
        let y = sp.getFloat() * scale
        let z = sp.getFloat() * scale
        return new Vertex(x, y, z)
    }

    parseNormal(sp) {
        let x = sp.getFloat()
        let y = sp.getFloat()
        let z = sp.getFloat()
        return new Normal(x, y, z)
    }

    parseUsemtl(sp) {
        return sp.getWord()
    }

    parseFace(sp, materialName, vertices, reverse) {
        let face = new Face(materialName)
        for (;;) {
            let word = sp.getWord()
            if (word == null) break
            let subWords = word.split('/')
            if (subWords.length >= 1) {
                let vi = parseInt(subWords[0]) - 1
                face.vIndices.push(vi)
            }
            if (subWords.length >= 3) {
                let ni = parseInt(subWords[2]) - 1
                face.nIndices.push(ni)
            } else {
                face.nIndices.push(-1)
            }
        }
        let v0 = [vertices[face.vIndices[0]].x, vertices[face.vIndices[0]].y, vertices[face.vIndices[0]].z]
        let v1 = [vertices[face.vIndices[1]].x, vertices[face.vIndices[1]].y, vertices[face.vIndices[1]].z]
        let v2 = [vertices[face.vIndices[2]].x, vertices[face.vIndices[2]].y, vertices[face.vIndices[2]].z]
        let normal = calcNormal(v0, v1, v2)
        if (normal == null) {
            if (face.vIndices.length >= 4) {
                let v3 = [vertices[face.vIndices[3]].x, vertices[face.vIndices[3]].y, vertices[face.vIndices[3]].z]
                normal = calcNormal(v1, v2, v3)
            }
            if (normal == null) {
                normal = [0.0, 1.0, 0.0]
            }
        }
        if (reverse) {
            normal[0] = -normal[0]
            normal[1] = -normal[1]
            normal[2] = -normal[2]
        }
        face.normal = new Normal(normal[0], normal[1], normal[2])
        if (face.vIndices.length > 3) {
            let n = face.vIndices.length - 2
            let newVIndices = new Array(n * 3)
            let newNIndices = new Array(n * 3)
            for (let i = 0; i < n; i++) {
                newVIndices[i * 3 + 0] = face.vIndices[0]
                newVIndices[i * 3 + 1] = face.vIndices[i + 1]
                newVIndices[i * 3 + 2] = face.vIndices[i + 2]
                newNIndices[i * 3 + 0] = face.nIndices[0]
                newNIndices[i * 3 + 1] = face.nIndices[i + 1]
                newNIndices[i * 3 + 2] = face.nIndices[i + 2]
            }
            face.vIndices = newVIndices
            face.nIndices = newNIndices
        }
        face.numIndices = face.vIndices.length
        return face
    }

    parse(fileString, scale, reverse) {
        let index = 0
        let currentObject = null
        let currentMaterialName = ''

        let lines = fileString.split('\n')
        lines.push(null)

        let line,
            sp = new StringParser()

        while ((line = lines[index++]) != null) {
            sp.init(line)
            let command = sp.getWord()
            if (command == null) continue

            switch (command) {
                case '#':
                    continue
                case 'mtllib':
                    let path = this.parseMtllib(sp, this.fileName)
                    let mtl = new MTLDoc()
                    this.mtls.push(mtl)
                    let request = new XMLHttpRequest()
                    request.onreadystatechange = () => {
                        if (request.readyState == 4) {
                            if (request.status != 404) {
                                this.readMTLFile(request.responseText, mtl)
                            } else {
                                mtl.complete = true
                            }
                        }
                    }
                    request.open('GET', path, true) / request.send()
                    continue
                case 'o':
                case 'g':
                    let object = this.parseObjectName(sp)
                    this.objects.push(object)
                    currentObject = object
                    continue
                case 'v':
                    let vertex = this.parseVertex(sp, scale)
                    this.vertices.push(vertex)
                    continue
                case 'vn':
                    let normal = this.parseNormal(sp)
                    this.normals.push(normal)
                    continue
                case 'usemtl':
                    currentMaterialName = this.parseUsemtl(sp)
                    continue
                case 'f':
                    let face = this.parseFace(sp, currentMaterialName, this.vertices, reverse)
                    currentObject.addFace(face)
                    continue
            }
        }
        return true
    }

    readMTLFile(fileString, mtl) {
        let lines = fileString.split('\n')
        lines.push(null)
        let index = 0
        let line
        let name = ''
        let sp = new StringParser()
        while ((line = lines[index++]) != null) {
            sp.init(line)
            let command = sp.getWord()
            if (command == null) continue
            switch (command) {
                case '#':
                    continue
                case 'newmtl':
                    name = mtl.parseNewmtl(sp)
                    continue
                case 'Kd':
                    if (name == '') continue
                    let material = mtl.parseRGB(sp, name)
                    mtl.materials.push(material)
                    name = ''
                    continue
            }
        }
        mtl.complete = true
    }

    isMTLComplete() {
        if (this.mtls.length == 0) return true
        for (let i = 0; i < this.mtls.length; i++) {
            if (!this.mtls[i].complete) return false
        }
        return true
    }

    findColor(name) {
        for (let i = 0; i < this.mtls.length; i++) {
            for (let j = 0; j < this.mtls[i].materials.length; j++) {
                if (this.mtls[i].materials[j].name == name) {
                    return this.mtls[i].materials[j].color
                }
            }
        }
        return new Color(0.8, 0.8, 0.8, 1)
    }

    getDrawingInfo() {
        let numIndices = 0
        for (let i = 0; i < this.objects.length; i++) {
            numIndices += this.objects[i].numIndices
        }
        let numVertices = numIndices
        let vertices = new Float32Array(numVertices * 3)
        let normals = new Float32Array(numVertices * 3)
        let colors = new Float32Array(numVertices * 4)
        let indices = new Uint16Array(numIndices)
        let index_indices = 0
        for (let i = 0; i < this.objects.length; i++) {
            let object = this.objects[i]
            for (let j = 0; j < object.faces.length; j++) {
                let face = object.faces[j]
                let color = this.findColor(face.materialName)
                let faceNormal = face.normal
                for (let k = 0; k < face.vIndices.length; k++) {
                    indices[index_indices] = index_indices
                    let vIdx = face.vIndices[k]
                    let vertex = this.vertices[vIdx]
                    vertices[index_indices * 3 + 0] = vertex.x
                    vertices[index_indices * 3 + 1] = vertex.y
                    vertices[index_indices * 3 + 2] = vertex.z
                    colors[index_indices * 4 + 0] = color.r
                    colors[index_indices * 4 + 1] = color.g
                    colors[index_indices * 4 + 2] = color.b
                    colors[index_indices * 4 + 3] = color.a
                    let nIdx = face.nIndices[k]
                    if (nIdx >= 0) {
                        let normal = this.normals[nIdx]
                        normals[index_indices * 3 + 0] = normal.x
                        normals[index_indices * 3 + 1] = normal.y
                        normals[index_indices * 3 + 2] = normal.z
                    } else {
                        normals[index_indices * 3 + 0] = faceNormal.x
                        normals[index_indices * 3 + 1] = faceNormal.y
                        normals[index_indices * 3 + 2] = faceNormal.z
                    }
                    index_indices++
                }
            }
        }
        return new DrawingInfo(vertices, normals, colors, indices)
    }
}

export default OBJDoc
