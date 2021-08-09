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
	grab = GRAB_DRAG,
	turns = 0,
	...args
} = {}) => {
	const atom = {width, height, x, y, dx, dy, nextdx: dx, nextdy: dy, draw, update, grab, ...args}
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

const pointOverlaps = ({x, y}, atom) => {
	const {left, right, top, bottom} = getBounds(atom)
	return x >= left && x <= right && y >= top && y <= bottom
}

const atomOverlaps = (self, atom) => {

	const bounds = getBounds(self)
	const abounds = getBounds(atom)

	const horizAligns = aligns([bounds.left, bounds.right], [], [abounds.left, abounds.right])
	const vertAligns = aligns([bounds.top, bounds.bottom], [], [abounds.top, abounds.bottom])
	if (horizAligns && vertAligns) return true
	//if (horizAligns && bounds.top <= abounds.top && bounds.bottom >= abounds.bottom) return true
	//if (horizAligns && bounds.left <= abounds.left && bounds.right >= abounds.right) return true

	const ahorizAligns = aligns([abounds.left, abounds.right], [], [bounds.left, bounds.right])
	const avertAligns = aligns([abounds.top, abounds.bottom], [], [bounds.top, bounds.bottom])
	if (ahorizAligns && avertAligns) return true
	//if (ahorizAligns && abounds.top <= bounds.top && abounds.bottom >= bounds.bottom) return true
	//if (avertAligns && abounds.left <= bounds.left && abounds.right >= bounds.right) return true

	return false

}

const getPointSide = (point, [left, right]) => {
	if (point < left) return -1
	if (point > right) return 1
	return 0
}

const aligns = ([left, right], [nleft, nright], [aleft, aright]) => {
	const leftSide = getPointSide(left, [aleft, aright])
	const rightSide = getPointSide(right, [aleft, aright])
	if (leftSide === 0) return true
	if (rightSide === 0) return true
	if (leftSide*-1 == rightSide) return true

	// For moving things
	if (nleft !== undefined && nright !== undefined) {
		const nleftSide = getPointSide(nleft, [aleft, aright])
		const nrightSide = getPointSide(nright, [aleft, aright])
		if (nleftSide === 0) return true
		if (nrightSide === 0) return true
		if (leftSide*-1 == nleftSide) return true
		if (rightSide*-1 == nrightSide) return true
	}

	return false
}