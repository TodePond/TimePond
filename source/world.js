//=======//
// Setup //
//=======//
const makeWorld = () => {
	const world = {}
	const top = makeAtom(ELEMENT_VOID)
	const bottom = makeAtom({...ELEMENT_VOID, y: WORLD_HEIGHT-ELEMENT_VOID.height})
	const left = makeAtom({...ELEMENT_VOID, turns: 1})
	const right = makeAtom({...ELEMENT_VOID, turns: 1, x: WORLD_WIDTH-ELEMENT_VOID.height})
	world.atoms = [top, bottom, left, right]

	// TINKERING
	/*addAtom(world, makeAtom({...ELEMENT_FROG, x: 120, y: 300}))
	//addAtom(world, makeAtom({...ELEMENT_FROG, y: 100, x: 180}))
	//addAtom(world, makeAtom({...ELEMENT_FROG, y: 50, x: 340}))
	//addAtom(world, makeAtom({...ELEMENT_FROG, y: 400}))

	addAtom(world, makeAtom({...ELEMENT_PORTAL_MOVE, x: 100, y: 400}))
	addAtom(world, makeAtom({...ELEMENT_PORTAL_MOVE, x: 300, y: 160}))
	addAtom(world, makeAtom({...ELEMENT_PORTAL_MOVE, x: 300, y: 180}))
	addAtom(world, makeAtom({...ELEMENT_PORTAL_MOVE, x: 300, y: 240}))
	addAtom(world, makeAtom({...ELEMENT_PORTAL_MOVE, x: 300, y: 260}))
	addAtom(world, makeAtom({...ELEMENT_PORTAL_MOVE, x: 300, y: 320}))*/

	/*addAtom(world, makeAtom({...ELEMENT_PORTAL_MOVE, x: 290, y: 180}))
	addAtom(world, makeAtom({...ELEMENT_PORTAL_MOVE, x: 290, y: 300}))*/

	//addAtom(world, makeAtom({...ELEMENT_PLATFORM, x: 300, y: 180}))

	//addAtom(world, makeAtom({...ELEMENT_PLATFORM, x: 100, y: 370}))
	//addAtom(world, makeAtom({...ELEMENT_PLATFORM, x: 120, y: 385}))
	//addAtom(world, makeAtom({...ELEMENT_BOX_DOUBLE, x: 135, y: 160}))

	// MAX SPEED TEST

	addAtom(world, makeAtom({...ELEMENT_FROG, x: 120, y: 200}))

	addAtom(world, makeAtom({...ELEMENT_PORTAL_MOVE, x: 300, y: 160}))
	addAtom(world, makeAtom({...ELEMENT_PORTAL_MOVE, x: 300, y: 360}))

	// CHAOTIC TEST
	/*
	addAtom(world, makeAtom({...ELEMENT_FROG, x: 120, y: 200}))
	addAtom(world, makeAtom({...ELEMENT_FROG, y: 100, x: 180}))
	addAtom(world, makeAtom({...ELEMENT_FROG, y: 50, x: 340}))
	addAtom(world, makeAtom({...ELEMENT_FROG, y: 400}))
	
	addAtom(world, makeAtom({...ELEMENT_PORTAL_MOVE, x: 100, y: 400}))
	addAtom(world, makeAtom({...ELEMENT_PORTAL_MOVE, x: 300, y: 160}))
	
	addAtom(world, makeAtom({...ELEMENT_PORTAL_MOVE, x: 300, y: 240}))
	addAtom(world, makeAtom({...ELEMENT_PORTAL_MOVE, x: 350, y: 400}))

	addAtom(world, makeAtom({...ELEMENT_PLATFORM, x: 290, y: 170}))
	*/
	

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
