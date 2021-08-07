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
const UPDATE_STATIC = (self) => {
	self.dx = 0
	self.dy = 0
	self.nextdx = 0
	self.nextdy = 0
}

const getSide = (point, [left, right]) => {
	if (point < left) return -1
	if (point > right) return 1
	return 0
}

const aligns = ([left, right], [nleft, nright], [aleft, aright]) => {
	const leftSide = getSide(left, [aleft, aright])
	const rightSide = getSide(right, [aleft, aright])
	const nleftSide = getSide(nleft, [aleft, aright])
	const nrightSide = getSide(nright, [aleft, aright])

	if (leftSide === 0) return true
	if (rightSide === 0) return true
	if (nleftSide === 0) return true
	if (nrightSide === 0) return true
	if (leftSide*-1 == nleftSide) return true
	if (rightSide*-1 == nrightSide) return true

	return false
}

const UPDATE_MOVER_GRAVITY = 0.5
const UPDATE_MOVER_AIR_RESISTANCE = 0.99
const UPDATE_MOVER_FRICTION = 0.8
const UPDATE_MOVER = (self, world) => {
	const {x, y, dx, dy, width, height} = self
	let [nx, ny] = [x+dx, y+dy]

	const nbounds = getBounds({x: nx, y: ny, width, height})
	const bounds = getBounds(self)
	for (const atom of world.atoms) {
		if (atom === self) continue
		const abounds = getBounds(atom)

		// vert collision
		if (dy > 0) {
			if (bounds.bottom <= abounds.top && nbounds.bottom >= abounds.top) {
				if (aligns([bounds.left, bounds.right], [nbounds.left, nbounds.right], [abounds.left, abounds.right])) {
					ny = abounds.top - height
					self.nextdy = atom.dy
					self.nextdx *= UPDATE_MOVER_FRICTION
				}
			}
		}
		else if (dy < 0) {
			if (bounds.top >= abounds.bottom && nbounds.top <= abounds.bottom) {
				if (aligns([bounds.left, bounds.right], [nbounds.left, nbounds.right], [abounds.left, abounds.right])) {
					ny = abounds.bottom
					self.nextdy = 0
				}
			}
		}

		// horiz collision
		if (dx > 0) {
			if (bounds.right <= abounds.left && nbounds.right >= abounds.left) {
				if (aligns([bounds.top, bounds.bottom], [nbounds.top, nbounds.bottom], [abounds.top, abounds.bottom])) {
					nx = abounds.left - width
					atom.nextdx *= 0.5
					atom.nextdx += self.dx/2
					self.nextdx = -0.5
					self.nextdx += atom.dx/2
				}
			}
		}
		else if (dx < 0) {
			if (bounds.left >= abounds.right && nbounds.left <= abounds.right) {
				if (aligns([bounds.top, bounds.bottom], [nbounds.top, nbounds.bottom], [abounds.top, abounds.bottom])) {
					nx = abounds.right
					atom.nextdx *= 0.5
					atom.nextdx += self.dx/2
					self.nextdx *= -0.5
					self.nextdx += atom.dx/2
				}
			}
		}

	}
	
	self.nextdy += UPDATE_MOVER_GRAVITY
	self.nextdx *= UPDATE_MOVER_AIR_RESISTANCE

	self.x = nx
	self.y = ny
}

//==========//
// Grabbers //
//==========//
const GRAB_DRAG = (self) => self
const GRAB_STATIC = () => {}

//==========//
// Elements //
//==========//
const ELEMENT_BOX = {
	colour: Colour.Orange,
	draw: DRAW_RECTANGLE,
	update: UPDATE_MOVER,
	grab: GRAB_DRAG,
}

const ELEMENT_VOID = {
	colour: Colour.Black,
	draw: DRAW_RECTANGLE,
	update: UPDATE_STATIC,
	grab: GRAB_STATIC,
	height: 10,
	width: WORLD_WIDTH,
	y: 0,
}

const ELEMENT_SPAWNER = {
	
}