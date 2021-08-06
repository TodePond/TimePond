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

	if (nbounds.bottom >= WORLD_HEIGHT) {
		ny = WORLD_HEIGHT - height
		self.dy = 0
	}

	const bounds = getBounds(self)
	for (const atom of world.atoms) {
		if (atom === self) continue
		const abounds = getBounds(atom)

		// vert collision
		if (dy > 0 && bounds.bottom <= abounds.top && nbounds.bottom >= abounds.top) {
			if (bounds.right >= abounds.left && bounds.left <= abounds.right) {
				ny = abounds.top - height
				self.dy = 0
			}
		}

		// horiz collision


	}

	self.x = nx
	self.y = ny
	self.dy += UPDATE_MOVER_GRAVITY
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
}