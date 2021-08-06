//=======//
// Setup //
//=======//
const makeAtom = ({
	width = 50,
	height = 50,
	x = WORLD_WIDTH/2 - width/2,
	y = WORLD_HEIGHT/2 - height/2,
	dx = 0,
	dy = 0,
	draw = DRAW_RECTANGLE,
	update = UPDATE_MOVER,
	...args
} = {}) => {
	const atom = {width, height, x, y, dx, dy, draw, update, ...args}
	return atom
}

//===========//
// Game Loop //
//===========//
const drawAtom = (atom, context) => {
	const {draw} = atom
	draw(atom, context)
}

//=========//
// Usefuls //
//=========//
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


