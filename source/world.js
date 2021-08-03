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

const addWorld = (world) => {
	document.body.appendChild(world.canvas)
	worlds.push(world)
}

