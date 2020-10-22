export class Material {
    constructor(name, r, g, b, a) {
        this.name = name
        this.color = new Color(r, g, b, a)
    }
}

export class Vertex {
    constructor(x, y, z) {
        this.x = x
        this.y = y
        this.z = z
    }
}

export class Normal {
    constructor(x, y, z) {
        this.x = x
        this.y = y
        this.z = z
    }
}

export class Color {
    constructor(r, g, b, a) {
        this.r = r
        this.g = g
        this.b = b
        this.a = a
    }
}

export class Face {
    constructor(materialName) {
        this.materialName = materialName || ''
        this.vIndices = []
        this.nIndices = []
    }
}

export class OBJObject {
    constructor(name) {
        this.name = name
        this.faces = []
        this.numIndices = 0
    }

    addFace(face) {
        this.faces.push(face)
        this.numIndices += face.numIndices
    }
}

export class DrawingInfo {
    constructor(vertices, normals, colors, indices) {
        this.vertices = vertices
        this.normals = normals
        this.colors = colors
        this.indices = indices
    }
}

export class MTLDoc {
    constructor() {
        this.complete = false
        this.materials = []
    }

    parseNewmtl(sp) {
        return sp.getWord()
    }

    parseRGB(sp, name) {
        let r = sp.getFloat()
        let g = sp.getFloat()
        let b = sp.getFloat()
        return new Material(name, r, g, b, 1)
    }
}
