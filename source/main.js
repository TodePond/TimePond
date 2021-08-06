//========//
// Config //
//========//
const WORLD_WIDTH = 500
const WORLD_HEIGHT = 500

//=======//
// Setup //
//=======//
const worlds = makeWorlds()
const canvas = makeWorldsCanvas(worlds)

on.load(() => {
	document.body.style["background-color"] = Colour.Black
	document.body.style["margin"] = "0"
	document.body.appendChild(canvas)
	trigger("resize")
})
