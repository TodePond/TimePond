//=======//
// Setup //
//=======//
const makeWorlds = () => [makeWorld()]
const makeWorldsCanvas = (worlds) => {
	const stage = Stage.make()
	stage.tick = () => {}
	const {context, canvas} = stage
	canvas.style["background-color"] = Colour.Black
	canvas.style["image-rendering"] = "pixelated"
	on.resize(() => {
		const worldsHeight = getWorldsHeight(worlds, canvas)
		const height = Math.max(worldsHeight, document.body.clientHeight)
		canvas.height = height
		canvas.style["height"] = height
		canvas.width = document.body.clientWidth
		canvas.style["width"] = document.body.clientWidth
		requestAnimationFrame(() => drawWorlds(worlds, context))
	})

	setInterval(() => tickWorlds(worlds, context), 1000 / 60)
	return canvas
}

//=====//
// API //
//=====//
const addWorld = (worlds, world) => {
	worlds.push(world)
	trigger("resize")
}

//===========//
// Game Loop //
//===========//
const tickWorlds = (worlds, context) => {
	drawWorlds(worlds, context)
}

const drawWorlds = (worlds, context) => {
	let x = 0
	let y = 0
	for (let i = 0; i < worlds.length; i++) {
		const world = worlds[i]
		drawWorld(world, context, x, y)
		x += WORLD_WIDTH
		if (x + WORLD_WIDTH >= context.canvas.width) {
			x = 0
			y += WORLD_HEIGHT
		}
	}
}

//=========//
// Usefuls //
//=========//
const getWorldsHeight = (worlds, canvas) => {
	let x = 0
	let y = 0
	for (let i = 0; i < worlds.length-1; i++) {
		x += WORLD_WIDTH
		if (x + WORLD_WIDTH >= canvas.width) {
			x = 0
			y += WORLD_HEIGHT
		}
	}
	return y + WORLD_HEIGHT
}