on.load(() => {
	document.body.style["background-color"] = "rgb(45, 56, 77)"
	document.body.style["margin"] = "0"
	
	// Create and start initial timeline
	createWorld()
	tick()
})

const tick = () => {
	for (const world of worlds) {
		world.update()
		world.draw()
	}
	requestAnimationFrame(tick)
}

const WORLD_WIDTH = 500
const WORLD_HEIGHT = 500
const worlds = []
const makeWorld = () => {
	const world = Stage.make()

	const {context, canvas} = world
	canvas.height = WORLD_WIDTH
	canvas.width = WORLD_HEIGHT
	canvas.style["width"] = WORLD_WIDTH
	canvas.style["height"] = WORLD_HEIGHT
	canvas.style["background-color"] = "rgb(65, 76, 97)"
	canvas.style["margin"] = 10
	canvas.style["image-rendering"] = "pixelated"
	world.tick = () => {}

	world.draw = () => {
		for (const atom of world.atoms) {
			atom.draw(atom, context)
		}
	}

	world.atoms = []

	

	return world
}

const createWorld = () => {
	const world = makeWorld()
	document.body.appendChild(world.canvas)
	worlds.push(world)
}

const defaultElementDraw = (self, context) => {
	context.fillStyle = self.colour
	context.fillRect(self.x, self.y, self.width, self.height)
}

const makeElement = ({width = 20, height = 20, draw = defaultElementDraw, colour = "rgb(255, 70, 70)"}) => {
	const element = {width, height, draw, colour}
	return element
}

const Box = makeElement({width: 50, height: 50})

const makeAtom = ({element = Box, x = 20, y = 20}) => {
	const atom = {x, y, ...element}
	return atom
}

const createAtom = (world = worlds[0], atom = {}) => {
	world.atoms.push(makeAtom(atom))
	return atom
}

