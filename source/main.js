
const worlds = []

on.load(() => {
	document.body.style["background-color"] = "rgb(45, 56, 77)"
	document.body.style["margin"] = "0"
	
	// Create and start initial timeline
	const world = makeWorld()
	addWorld(world)
	tick()

	
})


const tick = () => {
	for (const world of worlds) {
		world.update()
		world.draw()
	}
	requestAnimationFrame(tick)
}
