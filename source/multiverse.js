//=======//
// Setup //
//=======//
const makeMultiverse = () => {
	const multiverse = {}
	multiverse.worlds = [makeWorld()]
	return multiverse
}

const makeMultiverseCanvas = (multiverse) => {
	const stage = Stage.make()
	stage.tick = () => {}
	const {context, canvas} = stage
	canvas.style["background-color"] = Colour.Black
	canvas.style["image-rendering"] = "pixelated"
	on.resize(() => {
		const multiverseHeight = getMultiverseHeight(multiverse, canvas)
		const height = Math.max(multiverseHeight, document.body.clientHeight)
		canvas.height = height
		canvas.style["height"] = height
		canvas.width = document.body.clientWidth
		canvas.style["width"] = document.body.clientWidth
		requestAnimationFrame(() => drawMultiverse(multiverse, context))
	})
	
	setInterval(() => tickMultiverse(multiverse, context), 1000 / 60)
	return canvas
}

//=====//
// API //
//=====//
const addWorld = (multiverse, world) => {
	multiverse.worlds.push(world)
	trigger("resize")
}

//===========//
// Game Loop //
//===========//
const tickMultiverse = (multiverse, context) => {
	updateMultiverse(multiverse)
	drawMultiverse(multiverse, context)
}

const updateMultiverse = (multiverse) => {
	for (const world of multiverse.worlds) {
		updateWorld(world)
	}
}

const drawMultiverse = (multiverse, context) => {
	let x = 0
	let y = 0
	for (let i = 0; i < multiverse.worlds.length; i++) {
		const world = multiverse.worlds[i]
		drawWorld(world, context)
		if (i >= multiverse.worlds.length-1) break
		x += WORLD_WIDTH
		context.translate(WORLD_WIDTH, 0)
		if (x + WORLD_WIDTH >= context.canvas.width) {
			x = 0
			y += WORLD_HEIGHT
			context.resetTransform()
			context.translate(0, y)
		}
	}
	context.resetTransform()
}

//=========//
// Usefuls //
//=========//
const getMultiverseHeight = (multiverse, canvas) => {
	let x = 0
	let y = 0
	for (let i = 0; i < multiverse.worlds.length-1; i++) {
		x += WORLD_WIDTH
		if (x + WORLD_WIDTH >= canvas.width) {
			x = 0
			y += WORLD_HEIGHT
		}
	}
	return y + WORLD_HEIGHT
}