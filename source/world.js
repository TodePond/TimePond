const makeWorld = () => {
	const world = {}
	return world
}

const drawWorld = (context, world, x, y) => {
	context.fillStyle = Colour.Grey
	context.fillRect(x, y, WORLD_WIDTH, WORLD_HEIGHT)
}