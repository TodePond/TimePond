//=======//
// Debug //
//=======//
const addAtomOfElement = (element, world = multiverse.worlds[0]) => {
	const atom = makeAtom(element)
	world.atoms.push(atom)
}

//=========//
// Drawers //
//=========//
const DRAW_RECTANGLE = (atom, context) => {
	const {x, y, width, height, colour = Colour.Red} = atom
	context.fillStyle = colour
	context.fillRect(x, y, width, height)
}

//==========//
// Updaters //
//==========//
const UPDATE_MOVER_GRAVITY = 0.5
const UPDATE_MOVER = () => {
	
}

//==========//
// Elements //
//==========//
const ELEMENT_BOX = {
	colour: Colour.Orange,
	draw: DRAW_RECTANGLE,
	update: UPDATE_MOVER,
}