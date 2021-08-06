
const DRAW_RECTANGLE = (context, ox, oy, atom) => {
	const {x, y, width, height, colour} = atom
	context.fillStyle = colour
	context.fillRect(x+ox, y+oy, width, height)
}

const UPDATE_MOVER_GRAVITY = 0.5
const UPDATE_MOVER = () => {

}