
const WORLD_WIDTH = 500
const WORLD_HEIGHT = 500

const makeMultiverse = () => {

	const multiverse = {}

	// Canvas Setup
	const stage = Stage.make()
	stage.tick = () => {}
	const {context, canvas} = stage
	canvas.style["background-color"] = Colour.Black
	canvas.style["image-rendering"] = "pixelated"
	on.resize(() => {
		const height = getMultiverseHeight(multiverse)
		canvas.height = height
		canvas.width = document.body.clientWidth
		canvas.style["height"] = height
		canvas.style["width"] = document.body.clientWidth
	})

	// Multiverse Setup
	multiverse.worlds = [makeWorld()]
	multiverse.context = context
	setInterval(() => tickMultiverse(multiverse), 1000 / 60)

	return multiverse
}

const tickMultiverse = (multiverse) => {
	drawMultiverse(multiverse)
}

const drawMultiverse = (multiverse) => {
	const {context, worlds} = multiverse
	let x = 0
	let y = 0
	for (let i = 0; i < worlds.length; i++) {
		const world = worlds[i]
		drawWorld(context, world, x, y)
		x += WORLD_WIDTH
		if (x + WORLD_WIDTH >= context.canvas.width) {
			x = 0
			y += WORLD_HEIGHT
		}
	}
}

const getMultiverseHeight = (multiverse) => {
	const {context, worlds} = multiverse
	let x = 0
	let y = 0
	for (let i = 0; i < worlds.length; i++) {
		x += WORLD_WIDTH
		if (x + WORLD_WIDTH >= context.canvas.width) {
			x = 0
			y += WORLD_HEIGHT
		}
	}
	return y + WORLD_HEIGHT
}