
const makeElement = ({w = 20, h = 20, update = defaultElementUpdate, draw = defaultElementDraw, colour = "rgb(255, 70, 70)"}) => {
	const element = {w, h, draw, update, colour}
	return element
}

// Defaults
const defaultElementDraw = (self, context) => {
	context.fillStyle = self.colour
	context.fillRect(self.x, self.y, self.w, self.h)
}

const defaultElementUpdate = (self) => {

	const {x, y, dx, dy} = self
	let nx = x + dx
	let ny = y + dy

	const bottom = ny + self.h
	if (bottom > WORLD_HEIGHT) {
		ny = WORLD_HEIGHT - self.h
		self.dy = 0
	}
	
	self.x = nx
	self.y = ny
	self.dy += GRAVITY

}