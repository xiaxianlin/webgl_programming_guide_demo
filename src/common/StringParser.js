class StringParser {
    constructor(str) {
        this.str = undefined
        this.index = undefined
        this.init(str)
    }

    init(str) {
        this.str = str
        this.index = 0
    }

    skipDelimiters() {
        let i, len
        for (i = this.index, len = this.str.len; i < len; i++) {
            let c = this.str.charAt(i)
            if (c === '\t' || c === ' ' || c === '(' || c === ')') continue
            break
        }
        this.index = i
    }

    skipToNextWord() {
        this.skipDelimiters()
        let n = this.getWordLength(this.str, this.index)
        this.index += n + 1
    }

    getWord() {
        this.skipDelimiters()
        let n = this.getWordLength(this.str, this.index)
        if (n == 0) return null
        let word = this.str.substr(this.index, n)
        this.index += n + 1
        return word
    }

    getInt() {
        return parseInt(this.getWord())
    }

    getFloat() {
        return parseFloat(this.getWord())
    }

    getWordLength(str, start) {
        let i,
            len,
            n = 0
        for (i = start, len = str.length; i < len; i++) {
            let c = str.charAt(i)
            if (c == '\t' || c == ' ' || c == '(' || c == ')' || c == '"') break
        }
        return i - start
    }
}

export default StringParser
