const GRAVITY = 0.5

const WORLD_WIDTH = 500
const WORLD_HEIGHT = 500

const makeWorld = () => {
	const world = Stage.make()

	const {context, canvas} = world
	canvas.height = WORLD_WIDTH
	canvas.width = WORLD_HEIGHT
	canvas.style["width"] = WORLD_WIDTH
	canvas.style["height"] = WORLD_HEIGHT
	canvas.style["background-color"] = "rgb(50, 61, 88)"
	canvas.style["margin"] = 10
	canvas.style["image-rendering"] = "pixelated"

	world.tick = () => {}
	world.atoms = []
	world.update = (paused) => {
		if (!paused) for (const atom of world.atoms) {
			atom.update(atom, world)
		}
	}

	world.draw = () => {
		context.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
		for (const atom of world.atoms) {
			atom.draw(atom, context)
		}
	}

	canvas.on.mousemove(e => {
		updateCursor(world, e.offsetX, e.offsetY, Mouse.Left)
	})

	canvas.on.touchstart(e => {
		const x = Math.round(e.touches[0].pageX - e.touches[0].target.offsetLeft)
		const y = Math.round(e.touches[0].pageY - e.touches[0].target.offsetTop)
		if (x < 0) return
		if (y < 0) return
		if (x >= WORLD_WIDTH) return
		if (y >= WORLD_HEIGHT) return
		updateCursor(world, x, y, true)
	})

	canvas.on.touchmove(e => {
		const x = Math.round(e.touches[0].pageX - e.touches[0].target.offsetLeft)
		const y = Math.round(e.touches[0].pageY - e.touches[0].target.offsetTop)
		if (x < 0) return
		if (y < 0) return
		if (x >= WORLD_WIDTH) return
		if (y >= WORLD_HEIGHT) return
		updateCursor(world, x, y, true)
	})

	canvas.on.touchend(e => {
		const x = Math.round(e.touches[0].pageX - e.touches[0].target.offsetLeft)
		const y = Math.round(e.touches[0].pageY - e.touches[0].target.offsetTop)
		if (x < 0) return
		if (y < 0) return
		if (x >= WORLD_WIDTH) return
		if (y >= WORLD_HEIGHT) return
		updateCursor(world, x, y, false)
	})

	canvas.on.touchcancel(e => {
		const x = Math.round(e.touches[0].pageX - e.touches[0].target.offsetLeft)
		const y = Math.round(e.touches[0].pageY - e.touches[0].target.offsetTop)
		if (x < 0) return
		if (y < 0) return
		if (x >= WORLD_WIDTH) return
		if (y >= WORLD_HEIGHT) return
		updateCursor(world, x, y, false)
	})

	return world
}

let cursor = {x: 0, y: 0}
const updateCursor = (world, x, y, down) => {
	
	// Pick up new atom
	if (hand === undefined && down) {
		for (const atom of world.atoms) {
			if (pointOverlaps({x, y}, atom)) {
				hand = atom
				break
			}
		}
	}

	else if (hand !== undefined && down) {
		const {x: cx, y: cy} = cursor
		const [dx, dy] = [x-cx, y-cy]
		hand.x += dx
		hand.y += dy
	}

	else if (hand !== undefined && !down) {
		hand = undefined
	}

	cursor = {x, y}
}

const addWorld = (world) => {
	document.body.appendChild(world.canvas)
	worlds.push(world)
}

