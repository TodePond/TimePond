
const worlds = []

on.load(() => {
	document.body.style["background-color"] = "rgb(23, 29, 40)"
	document.body.style["margin"] = "0"
	
	// Create and start initial timeline
	const world = makeWorld()
	addWorld(world)
	tick()

	
})


let hand = undefined

const tick = () => {
	const paused = hand !== undefined
	for (const world of worlds) {
		world.update(paused)
		world.draw()
	}
	requestAnimationFrame(tick, 0)
}
