//=======//
// Setup //
//=======//
const makeWorld = () => {
	const world = {}
	const top = makeAtom(ELEMENT_VOID)
	const bottom = makeAtom({...ELEMENT_VOID, y: WORLD_HEIGHT-ELEMENT_VOID.height})
	const left = makeAtom({...ELEMENT_VOID, turns: 1})
	const right = makeAtom({...ELEMENT_VOID, turns: 1, x: WORLD_WIDTH-ELEMENT_VOID.height})
	world.atoms = [top, bottom, left, right]

	// Debug
	world.atoms.push(makeAtom(ELEMENT_BOX))

	return world
}

//===========//
// Game Loop //
//===========//
const updateWorld = (world) => {
	for (const atom of world.atoms) {
		updateAtom(atom, world)
	}
}

const drawWorld = (world, context) => {

	context.fillStyle = Colour.Grey
	context.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT)

	for (const atom of world.atoms) {
		drawAtom(atom, context)
	}

}
