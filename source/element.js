
const makeElement = ({width = 20, height = 20, update = UPDATE_MOVER, draw = DRAW_RECTANGLE, colour = "rgb(255, 70, 70)"}) => {
	const element = {width, height, draw, update, colour}
	return element
}

// Defaults
const DRAW_RECTANGLE = (self, context) => {
	const {x, y, width, height, colour} = self
	context.fillStyle = colour
	context.fillRect(x, y, width, height)
}

const UPDATE_MOVER = (self, world) => {
	
	const {x, y, dx, dy, width, height} = self
	let [nx, ny] = [x+dx, y+dy]

	const bounds = getBounds(self)
	const nbounds = getBounds({x: nx, y: ny, width, height})

	// Hit bottom of screen... TODO: replace with default objects around edge to unify systems
	if (nbounds.bottom >= WORLD_HEIGHT) {
		ny = WORLD_HEIGHT - height
		self.dy = 0
	}

	// Hit other atoms
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
	self.dy += GRAVITY

}