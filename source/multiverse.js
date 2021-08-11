//=======//
// Setup //
//=======//
const makeMultiverse = () => {
	const multiverse = {}
	multiverse.worlds = [makeWorld()]
	multiverse.void = {atoms: []}

	// Menu
	addMenuElement(ELEMENT_FROG, multiverse)
	addMenuElement(ELEMENT_BOX, multiverse)
	addMenuElement(ELEMENT_PLATFORM, multiverse)
	addMenuElement(ELEMENT_PORTAL_VOID, multiverse, ELEMENT_SPAWNER_PORTAL)

	return multiverse
}

const menu = {atoms: [], x: 0}
const addMenuElement = (element, multiverse, menuElement = ELEMENT_SPAWNER) => {
	menu.x += 25
	const atom = makeAtom({
		...element,
		...menuElement,
		spawn: element,
		x: menu.x,
	})

	const remainingY = MENU_HEIGHT - atom.height
	atom.y = remainingY/2

	multiverse.void.atoms.push(atom)

	menu.x += atom.width
}

const makeMultiverseCanvas = (multiverse) => {
	const stage = Stage.make()
	stage.tick = () => {}
	const {context, canvas} = stage
	canvas.style["background-color"] = Colour.Black
	//canvas.style["image-rendering"] = "pixelated"
	on.resize(() => {
		const multiverseHeight = getMultiverseHeight(multiverse, canvas)
		const height = Math.max(multiverseHeight, document.body.clientHeight)
		canvas.height = height
		canvas.style["height"] = height
		canvas.width = document.body.clientWidth
		canvas.style["width"] = document.body.clientWidth
		requestAnimationFrame(() => drawMultiverse(multiverse, context))
	})
	
	setInterval(() => tickMultiverse(multiverse, context), 1000 / 60)
	return canvas
}

//=====//
// API //
//=====//
const addWorld = (multiverse, world) => {
	multiverse.worlds.push(world)
	trigger("resize")
}

//===========//
// Game Loop //
//===========//
const tickMultiverse = (multiverse, context) => {
	updateCursor(multiverse, context)
	updateMultiverse(multiverse)
	drawMultiverse(multiverse, context)
}

const hand = {
	atom: undefined,
	source: undefined,
	offset: {x: undefined, y: undefined},
	previous: {x: undefined, y: undefined}
}

const CURSOR_SQUEEZE_EFFORT = 100
const updateCursor = (multiverse, context) => {
	const [cx, cy] = Mouse.position
	const [mx, my] = [cx + scrollX, cy + scrollY]
	const down = Mouse.Left
	const address = getAddress(mx, my, multiverse, context)
	const {world, x, y} = address

	// State: EMPTY HAND
	if (hand.atom === undefined) {

		if (down) {
			for (const atom of world.atoms) {
				if (pointOverlaps({x, y}, atom)) {
					const {grab} = atom
					const grabbed = grab(atom, hand, world)
					hand.atom = grabbed
					if (grabbed !== undefined) {
						hand.source = world
						hand.offset = {x: atom.x-x, y: atom.y-y}
						hand.previous = {x: mx, y: my}
					}
				}
			}
		}

	}

	// State: HOLDING SOMETHING
	else {

		// Move it to the dragged position!
		hand.atom.x = x + hand.offset.x
		hand.atom.y = y + hand.offset.y
			
		// Transfer the dragged atom to another world if needed
		if (world !== hand.source) {
			hand.source.atoms = hand.source.atoms.filter(atom => atom !== hand.atom)
			world.atoms.push(hand.atom)
			hand.source = world
		}
		
		// Are we letting go of the atom?
		if (!down) {

			// Can we actually drop it here?
			let canDrop = true
			for (const atom of world.atoms) {
				if (atom === hand.atom) continue
				if (atomOverlaps(hand.atom, atom)) {
					canDrop = false
					break
				}
			}
			
			// If there's room, drop it!
			if (canDrop) {
				hand.atom.dx = (mx - hand.previous.x)
				hand.atom.dy = (my - hand.previous.y)
				hand.atom = undefined
			}
		}
		
		// Help keep track of hand speed
		hand.previous = {x: mx, y: my}

	}

}

const updateMultiverse = (multiverse) => {
	if (hand.atom !== undefined) return
	for (const world of multiverse.worlds) {
		updateWorld(world)
	}
	for (const world of multiverse.worlds) {
		prepWorld(world)
	}
}

const drawMultiverse = (multiverse, context) => {
	context.clearRect(0, 0, canvas.width, canvas.height)
	drawWorld(multiverse.void, context, false)
	
	let x = 0
	let y = 0
	
	context.translate(0, MENU_HEIGHT)
	for (let i = 0; i < multiverse.worlds.length; i++) {
		const world = multiverse.worlds[i]
		drawWorld(world, context)
		if (i >= multiverse.worlds.length-1) break
		x += WORLD_WIDTH
		context.translate(WORLD_WIDTH, 0)
		if (x + WORLD_WIDTH >= context.canvas.width) {
			x = 0
			y += WORLD_HEIGHT
			context.resetTransform()
			context.translate(0, y + MENU_HEIGHT)
		}
	}
	context.resetTransform()
}

//=========//
// Usefuls //
//=========//
const getAddress = (mx, my, multiverse) => {
	const column = Math.floor(mx / WORLD_WIDTH)
	const row = Math.floor((my-MENU_HEIGHT) / WORLD_HEIGHT)
	const world = getWorldFromGridPosition(column, row, multiverse, canvas)
	if (world === multiverse.void) return {world, x: mx, y: my}
	const x = mx - column*WORLD_WIDTH
	const y = my-MENU_HEIGHT - row*WORLD_HEIGHT
	return {world, x, y}
}

const getWorldFromGridPosition = (column, row, multiverse, canvas) => {
	const columns = getGridMaxWidth(canvas)
	if (column >= columns) return multiverse.void
	const world = multiverse.worlds[row*columns + column]
	if (world === undefined) return multiverse.void
	return world
}

const getGridMaxWidth = (canvas) => Math.floor(canvas.width / WORLD_WIDTH)

const getMultiverseHeight = (multiverse, canvas) => {
	let x = 0
	let y = 0
	for (let i = 0; i < multiverse.worlds.length-1; i++) {
		x += WORLD_WIDTH
		if (x + WORLD_WIDTH >= canvas.width) {
			x = 0
			y += WORLD_HEIGHT
		}
	}
	return y + WORLD_HEIGHT + MENU_HEIGHT
}