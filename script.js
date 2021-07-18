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

	
	world.atoms = []
	world.update = () => {
		for (const atom of world.atoms) {
			atom.update(atom, world)
		}
	}

	world.draw = () => {
		context.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
		for (const atom of world.atoms) {
			atom.draw(atom, context)
		}
	}


	

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

const GRAVITY = 0.5
const defaultElementUpdate = (self, world) => {

	const {x, y, dx, dy} = self

	let nx = x + dx
	let ny = y + dy

	const bottom = ny + self.height

	if (bottom > WORLD_HEIGHT) {
		ny = WORLD_HEIGHT - self.height
		self.dy = 0
	}
	
	self.x = nx
	self.y = ny
	self.dy += GRAVITY


}

const makeElement = ({width = 20, height = 20, update = defaultElementUpdate, draw = defaultElementDraw, colour = "rgb(255, 70, 70)"}) => {
	const element = {width, height, draw, update, colour}
	return element
}

const Box = makeElement({width: 50, height: 50})

const makeAtom = ({element = Box, x = 20, y = 20, dx = 0, dy = 0}) => {
	const atom = {x, y, dx, dy, ...element}
	return atom
}

const createAtom = (world = worlds[0], atom = {}) => {
	world.atoms.push(makeAtom(atom))
	return atom
}

