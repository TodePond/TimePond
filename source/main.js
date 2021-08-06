
const multiverse = makeMultiverse()

on.load(() => {
	document.body.style["background-color"] = Colour.Black
	document.body.style["margin"] = "0"
	document.body.appendChild(multiverse.context.canvas)
	trigger("resize")
})

