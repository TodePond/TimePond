//=======//
// Setup //
//=======//
const makeWorld = () => {
	const world = {}
	world.atoms = []
	return world
}

//===========//
// Game Loop //
//===========//
const drawWorld = (world, context, x, y) => {

	const {atoms} = world

	context.fillStyle = Colour.Grey
	context.fillRect(x, y, WORLD_WIDTH, WORLD_HEIGHT)

	for (const atom of atoms) {
		atom.draw()
	}

}