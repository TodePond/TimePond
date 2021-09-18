const URL_QUERY = new URLSearchParams(window.location.search)
let SPEED_MOD = URL_QUERY.has("speed")? parseFloat(URL_QUERY.get("speed")) : 1
let PAUSED = URL_QUERY.has("paused")? URL_QUERY.get("paused").as(Boolean) : false
let FROGGY_BOUNDS = URL_QUERY.has("bounds")? URL_QUERY.get("bounds").as(Boolean) : false
let ONION_SKIN = URL_QUERY.has("onion")? parseInt(URL_QUERY.get("onion")) : 0
let TRAIL_LENGTH = URL_QUERY.has("trail")? parseInt(URL_QUERY.get("trail")) : 0
let EXPERIMENT_ID = URL_QUERY.has("experiment")? URL_QUERY.get("experiment") : "headpoke"
let STEP = false

//=======//
// Setup //
//=======//
const makeMultiverse = () => {
	const multiverse = {}
	multiverse.worlds = []
	multiverse.void = {atoms: []}
	const world = makeWorld()
	addWorld(multiverse, world)

	// Menu
	addMenuElement(ELEMENT_FROG, multiverse)
	addMenuElement(ELEMENT_BOX, multiverse)
	addMenuElement(ELEMENT_LEAF, multiverse)
	addMenuElement(ELEMENT_PLATFORM, multiverse)
	addMenuElement(ELEMENT_LILYPAD, multiverse)
	addMenuElement(ELEMENT_POTION_ROTATE, multiverse)
	addMenuElement(ELEMENT_PORTAL_MOVE, multiverse, ELEMENT_SPAWNER_PORTAL, "Portal")
	addMenuElement(ELEMENT_PORTAL_PASTNOWLINE, multiverse, ELEMENT_SPAWNER_PORTAL, "Pastnowlinal")
	addMenuElement(ELEMENT_PORTAL_PASTLINE, multiverse, ELEMENT_SPAWNER_PORTAL, "Pastlinal")
	addMenuElement(ELEMENT_PORTAL_DIMENSION, multiverse, ELEMENT_SPAWNER_PORTAL, "Dimensial")
	addMenuElement(ELEMENT_PORTAL_VOID, multiverse, ELEMENT_SPAWNER_PORTAL, "Voidal")
	//addMenuElement(ELEMENT_BOX_DOUBLE, multiverse)

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
		isMenuItem: true,
	})

	const remainingY = MENU_HEIGHT - atom.height
	atom.y = Math.round(remainingY/2)

	addAtom(multiverse.void, atom)

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
	
	setInterval(() => tickMultiverse(multiverse, context), 1000/SPEED_MOD / 60)
	return canvas
}

//=====//
// API //
//=====//
let worldCount = 0
const addWorld = (multiverse, world) => {
	multiverse.worlds.push(world)
	world.id = worldCount++
	trigger("resize")
}

//===========//
// Game Loop //
//===========//
const tickMultiverse = (multiverse, context) => {
	if (STEP) STEP = false
	else if (PAUSED) {
		updateCursor(multiverse, context)
		drawMultiverse(multiverse, context)
		return
	}

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

let handStarting = {x: 0, y: 0}
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
					hand.offset = {x: atom.x-x, y: atom.y-y}
					const grabbed = grab(atom, hand, world)
					hand.atom = grabbed
					if (grabbed !== undefined) {
						hand.source = world
						hand.previous = {x: mx, y: my}
						handStarting.x = mx
						handStarting.y = my
					}
				}
			}
		}

	}

	// State: HOLDING SOMETHING
	else {

		// Move it to the dragged position!
		//hand.atom.prevBounds = getBounds({...hand.atom})
		moveAtom(hand.atom, x + hand.offset.x, y + hand.offset.y)
		if (hand.atom.flipX !== undefined) {
			const mdx = mx - hand.previous.x
			const oldX = hand.atom.x
			if (!hand.atom.flipX && mdx > 1) flipAtom(hand.atom)
			else if (hand.atom.flipX && mdx < -1) flipAtom(hand.atom)
			const newX = hand.atom.x
			hand.offset.x += newX-oldX
		}
		//REAL
		hand.atom.dx = (mx - hand.previous.x)
		hand.atom.dy = (my - hand.previous.y)

		//DEBUG
		/*hand.atom.dx = (mx - handStarting.x) / 10
		hand.atom.dy = (my - handStarting.y) / 10*/

		hand.atom.nextdx = hand.atom.dx
		hand.atom.nextdy = hand.atom.dy
		hand.atom.jumpTick = 0

		/*for (const link of hand.atom.links) {
			link.atom.dx = (mx - hand.previous.x)
			link.atom.dy = (my - hand.previous.y)
			link.atom.nextdx = link.atom.dx
			link.atom.nextdy = link.atom.dy
			link.jumpTick = 0
		}*/
			
		// Transfer the dragged atom to another world if needed
		if (world !== hand.source) {
			/*hand.source.atoms = hand.source.atoms.filter(atom => atom !== hand.atom)
			world.atoms.push(hand.atom)*/
			moveAtomWorld(hand.atom, hand.source, world)
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
				hand.atom = undefined
			}
		}
		
		// Help keep track of hand speed
		hand.previous = {x: mx, y: my}

	}

}

const updateMultiverse = (multiverse) => {
	if (hand.atom !== undefined) return
	updateWorldLinks(multiverse.void)
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