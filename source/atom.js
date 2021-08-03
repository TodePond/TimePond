
const makeAtom = ({
	element = Box,
	x = WORLD_WIDTH/2 - element.w/2,
	y = WORLD_HEIGHT/2 - element.h/2,
	dx = 0,
	dy = 0
} = {}) => {
	const atom = {x, y, dx, dy, ...element}
	return atom
}

const addAtom = (atom, world = worlds[0]) => {
	world.atoms.push(atom)
}
