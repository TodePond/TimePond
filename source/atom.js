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
	update = UPDATE_STATIC,
	turns = 0,
	...args
} = {}) => {
	const atom = {width, height, x, y, dx, dy, draw, update, ...args}
	turnAtom(atom, turns)
	return atom
}

//===========//
// Game Loop //
//===========//
const updateAtom = (atom, world) => {
	const {update} = atom
	update(atom, world)
}

const drawAtom = (atom, context) => {
	const {draw} = atom
	draw(atom, context)
}

//=========//
// Usefuls //
//=========//
const turnAtom = (atom, turns) => {
	if (turns === 0) return
	if (turns < 0) return turnAtom(atom, 4+turns)
	if (turns > 1) {
		turnAtom(atom, 1)
		turnAtom(atom, turns-1)
		return
	}
	const {height, width} = atom
	atom.height = width
	atom.width = height
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


