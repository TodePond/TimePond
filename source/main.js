//=======//
// Setup //
//=======//
const multiverse = makeMultiverse()
const canvas = makeMultiverseCanvas(multiverse)

on.load(() => {
	document.body.style["background-color"] = Colour.Black
	document.body.style["margin"] = "0"
	document.body.appendChild(canvas)
	trigger("resize")
})
