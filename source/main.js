//=======//
// Setup //
//=======//
const multiverse = makeMultiverse()
const canvas = makeMultiverseCanvas(multiverse)

on.load(() => {
	document.body.style["background-color"] = Colour.Black
	document.body.style["overflow-x"] = "hidden"
	document.body.style["margin"] = "0"
	document.body.appendChild(canvas)
	trigger("resize")
})

on.keydown((e) => {
	if (e.key === " ") PAUSED = !PAUSED
	else if (e.key === "ArrowRight") {
		STEP = true
		PAUSED = true
	}
})
