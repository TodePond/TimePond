
const makeAtom = ({
	element = Box,
	x = WORLD_WIDTH/2 - element.width/2,
	y = WORLD_HEIGHT/6 - element.height/2,
	dx = 0,
	dy = 0
} = {}) => {
	const atom = {x, y, dx, dy, ...element}
	return atom
}

const addAtom = (self, world = worlds[0]) => {
	world.atoms.push(self)
}

const getBounds = ({x, y, width, height}) => {
	const top = y
	const bottom = y + height
	const left = x
	const right = x + width
	return {top, bottom, left, right}
}

const pointOverlaps = (point, atom) => {
	const {x, y} = point
	const {left, right, top, bottom} = getBounds(atom)
	return x >= left && x <= right && y >= top && y <= bottom
}
