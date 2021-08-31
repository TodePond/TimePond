//=======//
// Setup //
//=======//
let hasMadeFirstWorld = false
const makeWorld = () => {
	const world = {}
	const top = makeAtom(ELEMENT_VOID)
	const bottom = makeAtom({...ELEMENT_VOID, y: WORLD_HEIGHT-ELEMENT_VOID.height})
	const left = makeAtom({...ELEMENT_VOID, turns: 1})
	const right = makeAtom({...ELEMENT_VOID, turns: 1, x: WORLD_WIDTH-ELEMENT_VOID.height})
	world.atoms = [top, bottom, left, right]

	if (hasMadeFirstWorld) return world
	hasMadeFirstWorld = true
	
	if (EXPERIMENT_ID === "freefall") {
		addAtom(world, makeAtom({...ELEMENT_PORTAL_MOVE, x: 300, y: 160}))
		addAtom(world, makeAtom({...ELEMENT_PORTAL_MOVE, x: 300, y: 300}))
	}
	else if (EXPERIMENT_ID === "headpoke") {
		addAtom(world, makeAtom({...ELEMENT_PORTAL_MOVE, x: 100, y: 360}))
		addAtom(world, makeAtom({...ELEMENT_PORTAL_MOVE, x: 300, y: 150}))
		addAtom(world, makeAtom({...ELEMENT_FROG, x: 175, y: 380, flipX: false}))
	}
	else if (EXPERIMENT_ID === "jumpright") {
		addAtom(world, makeAtom({...ELEMENT_PORTAL_MOVE, x: 182, y: 320, turns: 1}))
		addAtom(world, makeAtom({...ELEMENT_PORTAL_MOVE, x: 350, y: 320, turns: 1}))
		addAtom(world, makeAtom({...ELEMENT_FROG, x: 100, y: 380, flipX: true}))
	}
	else if (EXPERIMENT_ID === "dimensionright") {
		addAtom(world, makeAtom({...ELEMENT_PORTAL_DIMENSION, x: 178, y: 330, turns: 1}))
		addAtom(world, makeAtom({...ELEMENT_PORTAL_DIMENSION, x: 350, y: 330, turns: 1}))
		addAtom(world, makeAtom({...ELEMENT_FROG, x: 100, y: 380, flipX: true}))
		
		addAtom(world, makeAtom({...ELEMENT_PORTAL_MOVE, x: 205, y: 125}))
		addAtom(world, makeAtom({...ELEMENT_PORTAL_MOVE, x: 205, y: 250}))
	}
	else {
		// PORTAL FLING 1
		/*addAtom(world, makeAtom({...ELEMENT_FROG, x: 130, y: 200, flipX: false}))
		//addAtom(world, makeAtom({...ELEMENT_FROG, x: 135, y: 380, flipX: false}))
		addAtom(world, makeAtom({...ELEMENT_LILYPAD, x: 120, y: 475, flipX: false}))
		addAtom(world, makeAtom({...ELEMENT_PORTAL_MOVE, x: 100, y: 350, turns: 0}))
		addAtom(world, makeAtom({...ELEMENT_PORTAL_MOVE, x: 400, y: 150, turns: 1}))
		*/
		//addAtom(world, makeAtom({...ELEMENT_FROG, x: 260, y: 440, flipX: true}))
		//addAtom(world, makeAtom({...ELEMENT_FROG, x: 380, y: 440, flipX: false}))
		//addAtom(world, makeAtom({...ELEMENT_PORTAL_MOVE, x: 350, y: 320, turns: 3}))
		//addAtom(world, makeAtom({...ELEMENT_PORTAL_MOVE, x: 340, y: 240}))
		

		// CHAOTIC TEST
		/*addAtom(world, makeAtom({...ELEMENT_FROG, x: 120, y: 200, turns: 1}))
		//addAtom(world, makeAtom({...ELEMENT_FROG, y: 100, x: 180}))
		//addAtom(world, makeAtom({...ELEMENT_FROG, y: 50, x: 340}))
		//addAtom(world, makeAtom({...ELEMENT_FROG, y: 400}))
		
		addAtom(world, makeAtom({...ELEMENT_PORTAL_MOVE, x: 100, y: 400}))
		addAtom(world, makeAtom({...ELEMENT_PORTAL_MOVE, x: 300, y: 160}))
		
		addAtom(world, makeAtom({...ELEMENT_PORTAL_MOVE, x: 300, y: 240}))
		addAtom(world, makeAtom({...ELEMENT_PORTAL_MOVE, x: 450, y: 350, turns: 1}))

		addAtom(world, makeAtom({...ELEMENT_PLATFORM, x: 290, y: 170}))*/
	
	}
	
	
	return world
}

//=========//
// Usefuls //
//=========//
const LINKED_PROPERTIES = [
	"width",
	"height",
	//"cutTop",
	//"cutBottom",
	//"cutRight",
	//"cutLeft",
	"x",
	"y",
	"dx",
	"dy",
	"nextdx",
	"nextdy",
	"turns",
	"nextturns",
	"flipX",
]

// TODO!!! These should allow you to NOT bring over specific links. Add a parameter and/or special link properties to cater to this.
const addAtom = (world, atom) => {
	world.atoms.push(atom)
	atom.world = world // I give up. Lets use state... :(
	for (const link of atom.links) {
		addAtom(world, link.atom)
	}
	atom.prevBounds = getBounds(atom)
	updateAtomLinks(atom)
}

const removeAtom = (world, atom, {includingChildren = true, destroy = false} = {}) => {

	world.atoms = world.atoms.filter(a => a !== atom)

	if (destroy) {
		if (atom.parent !== undefined) {
			atom.parent.links = atom.parent.links.filter(link => link.atom !== atom)
		}

		for (const link of atom.links) {
			link.atom.parent = undefined
			if (link.atom.onPromote !== undefined) link.atom.onPromote(link.atom)
		}
	}

	if (includingChildren) {
		for (const link of atom.links) {
			removeAtom(world, link.atom, {destroy})
		}
	}
}

const moveAtomWorld = (atom, world, nworld) => {
	removeAtom(world, atom)
	addAtom(nworld, atom)
}

const numberWorldAtoms = (world) => {
	let i = 0
	for (const atom of world.atoms) {
		atom.world_id = i++
	}
}

const cloneWorld = (world) => {
	numberWorldAtoms(world)
	const clone_world = makeWorld()
	for (const atom of world.atoms) {
		addAtom(clone_world, atom)
	}
	return clone_world
}

//===========//
// Game Loop //
//===========//
const prepWorld = (world) => {
	for (const atom of world.atoms) {
		atom.dx = atom.nextdx
		atom.dy = atom.nextdy
	}
}

const updateWorld = (world) => {
	for (const atom of world.atoms) {
		atom.nextdx = atom.dx
		atom.nextdy = atom.dy
	}
	
	for (const atom of world.atoms) {
		updateAtom(atom, world)
	}
}

const updateWorldLinks = (world) => {
	for (const atom of world.atoms) {
		updateAtomLinks(atom)
	}
}

const drawWorld = (world, context, colourBackground = true) => {

	if (colourBackground) {
		context.fillStyle = Colour.Grey
		context.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
	}

	for (const atom of world.atoms) {
		drawAtom(atom, context)
	}

}
