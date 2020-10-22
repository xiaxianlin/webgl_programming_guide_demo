export function initCanvasDragEvent(canvas, callback) {
    let dargging = false
    let lastX = -1
    let lastY = -1

    canvas.onmousedown = (ev) => {
        let x = ev.clientX
        let y = ev.clientY
        let rect = ev.target.getBoundingClientRect()

        if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
            lastX = x
            lastY = y
            dargging = true
        }
    }

    canvas.onmouseup = () => (dargging = false)

    canvas.onmousemove = (ev) => {
        let x = ev.clientX
        let y = ev.clientY
        if (!dargging) return
        let factor = 100 / canvas.height
        let dx = factor * (x - lastX)
        let dy = factor * (y - lastY)
        let axis = getCanvasEventAxis(ev, canvas)
        callback(axis.x, axis.y, dx, dy)
        lastX = x
        lastY = y
    }
}

export function getCanvasEventAxis(ev, canvas) {
    let x = ev.clientX
    let y = ev.clientY
    let rect = ev.target.getBoundingClientRect()

    if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
        let cx = x - rect.left
        let cy = rect.bottom - y
        x = (x - rect.left - canvas.width / 2) / (canvas.width / 2)
        y = (canvas.height / 2 - y + rect.top) / (canvas.height / 2)
        return { x, y, cx, cy }
    } else {
        return
    }
}
