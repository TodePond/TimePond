//=========//
// Drawers //
//=========//
const DRAW_RECTANGLE = (self, context) => {
	const {x, y, width, height, colour = Colour.Red} = self
	context.fillStyle = colour
	context.fillRect(x, y, width, height)
}

const images = {}
const DRAW_IMAGE = (self, context) => {
	const {x, y, width, height, source} = self
	if (images[source] === undefined) {
		const image = new Image()
		image.src = source
		images[source] = image
	}
	const image = images[source]
	context.drawImage(image, x, y, width, height)
}

const DRAW_SPAWNER = (self, context) => {
	const {spawn} = self
	const {draw} = spawn
	draw(self, context)
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

const UPDATE_MOVER_GRAVITY = 0.5
const UPDATE_MOVER_AIR_RESISTANCE = 0.99
const UPDATE_MOVER_FRICTION = 0.8
const UPDATE_MOVER = (self, world) => {
	const {x, y, dx, dy, width, height} = self
	let [nx, ny] = [x+dx, y+dy]

	let nbounds = getBounds({x: nx, y: ny, width, height})
	const bounds = getBounds(self)
	for (const atom of world.atoms) {
		if (atom === self) continue
		const abounds = getBounds(atom)

		// vert collision
		if (dy >= 0) {
			if (bounds.bottom <= abounds.top && nbounds.bottom >= abounds.top) {
				if (aligns([bounds.left, bounds.right], [nbounds.left, nbounds.right], [abounds.left, abounds.right])) {
					ny = abounds.top - height
					self.nextdy = atom.dy
					self.nextdx *= UPDATE_MOVER_FRICTION
					nbounds = getBounds({x: nx, y: ny, width, height})
				}
			}
		}
		else if (dy < 0) {
			if (bounds.top >= abounds.bottom && nbounds.top <= abounds.bottom) {
				if (aligns([bounds.left, bounds.right], [nbounds.left, nbounds.right], [abounds.left, abounds.right])) {
					ny = abounds.bottom
					self.nextdy = 0
					nbounds = getBounds({x: nx, y: ny, width, height})
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
					self.nextdx *= -0.5
					self.nextdx += atom.dx/2
					nbounds = getBounds({x: nx, y: ny, width, height})
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
					nbounds = getBounds({x: nx, y: ny, width, height})
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
const GRAB_SPAWNER = (self, hand, world) => {
	const atom = makeAtom(self.spawn)
	world.atoms.push(atom)
	atom.x = self.x
	atom.y = self.y
	return atom
}

//==========//
// Elements //
//==========//
const ELEMENT_FROG = {
	colour: Colour.Red,
	draw: DRAW_RECTANGLE,
	update: UPDATE_MOVER,
	grab: GRAB_DRAG,
	source: "images/Blank.png",
	width: 354 / 2,
	height: 254 / 2,
}

const ELEMENT_BOX = {
	colour: Colour.Orange,
	draw: DRAW_RECTANGLE,
	update: UPDATE_MOVER,
	grab: GRAB_DRAG,
}

const ELEMENT_PLATFORM = {
	colour: Colour.White,
	draw: DRAW_RECTANGLE,
	update: UPDATE_STATIC,
	grab: GRAB_DRAG,
	width: 150,
	height: 25,
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
	update: UPDATE_STATIC,
	draw: DRAW_SPAWNER,
	grab: GRAB_SPAWNER,
	spawn: ELEMENT_BOX,
}