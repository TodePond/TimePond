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
const drawWorld = (world, context) => {

	context.fillStyle = Colour.Grey
	context.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT)

	for (const atom of world.atoms) {
		drawAtom(atom, context)
	}

}
