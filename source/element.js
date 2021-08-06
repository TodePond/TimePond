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
const UPDATE_STATIC = () => {}

const UPDATE_MOVER_GRAVITY = 0.5
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
				if (bounds.right >= abounds.left && bounds.left <= abounds.right) {
					ny = abounds.top - height
					self.nextdy = atom.dy
					self.nextdx = self.dx * 0.9
				}
			}
		}
		else if (dy < 0) {
			if (bounds.top >= abounds.bottom && nbounds.top <= abounds.bottom) {
				if (bounds.right >= abounds.left && bounds.left <= abounds.right) {
					ny = abounds.bottom
					self.nextdy = 0
				}
			}
		}

		// horiz collision
		if (dx > 0) {
			if (bounds.right <= abounds.left && nbounds.right >= abounds.left) {
				if (bounds.bottom >= abounds.top && bounds.top <= abounds.bottom) {
					nx = abounds.left - width
					self.nextdx = 0
				}
			}
		}
		else if (dx < 0) {
			if (bounds.left >= abounds.right && nbounds.left <= abounds.right) {
				if (bounds.bottom >= abounds.top && bounds.top <= abounds.bottom) {
					nx = abounds.right
					self.nextdx = 0
				}
			}
		}

	}
	
	self.nextdy += UPDATE_MOVER_GRAVITY

	self.x = nx
	self.y = ny
}

//==========//
// Elements //
//==========//
const ELEMENT_BOX = {
	colour: Colour.Orange,
	draw: DRAW_RECTANGLE,
	update: UPDATE_MOVER,
}

const ELEMENT_VOID = {
	colour: Colour.Black,
	draw: DRAW_RECTANGLE,
	update: UPDATE_STATIC,
	height: 10,
	width: WORLD_WIDTH,
	y: 0,
	grabbable: false,
}