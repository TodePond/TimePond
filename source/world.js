//=======//
// Setup //
//=======//
let hasMadeFirstWorld = false
const makeWorld = ({isProjection = false} = {}) => {
	const world = {}
	const top = makeAtom(ELEMENT_VOID)
	const bottom = makeAtom({...ELEMENT_VOID, y: WORLD_HEIGHT-ELEMENT_VOID.height})
	const left = makeAtom({...ELEMENT_VOID, turns: 1})
	const right = makeAtom({...ELEMENT_VOID, turns: 1, x: WORLD_WIDTH-ELEMENT_VOID.height})
	world.atoms = [top, bottom, left, right]

	world.pastProjections = []
	world.isProjection = isProjection

	if (hasMadeFirstWorld) return world
	hasMadeFirstWorld = true

	if (EXPERIMENT_ID === "empty") {

	}
	else if (EXPERIMENT_ID === "simpleport") {
		addAtom(world, makeAtom({...ELEMENT_PORTAL_MOVE, x: 100, y: 360}))
		addAtom(world, makeAtom({...ELEMENT_PORTAL_MOVE, x: 300, y: 150}))
	}
	else if (EXPERIMENT_ID === "fling") {
		addAtom(world, makeAtom({...ELEMENT_FROG, x: 130, y: 100, flipX: true}))
		//addAtom(world, makeAtom({...ELEMENT_FROG, x: 130, y: 250, flipX: true}))
		//addAtom(world, makeAtom({...ELEMENT_FROG, x: 130, y: 400, flipX: true}))
		/*
		addAtom(world, makeAtom({...ELEMENT_PORTAL_MOVE, x: 400, y: 360}))
		addAtom(world, makeAtom({...ELEMENT_PORTAL_MOVE, x: 100, y: 150, turns: 1}))
		*/
		
		addAtom(world, makeAtom({...ELEMENT_PORTAL_MOVE, x: 100, y: 460}))
		//addAtom(world, makeAtom({...ELEMENT_PORTAL_MOVE, x: 100, y: 360}))
		addAtom(world, makeAtom({...ELEMENT_PORTAL_MOVE, x: 400, y: 150, turns: 1}))
		
	}
	else if (EXPERIMENT_ID === "pastlinefling") {
		addAtom(world, makeAtom({...ELEMENT_FROG, x: 130, y: 100, flipX: true}))
		//addAtom(world, makeAtom({...ELEMENT_FROG, x: 130, y: 250, flipX: true}))
		//addAtom(world, makeAtom({...ELEMENT_FROG, x: 130, y: 400, flipX: true}))
		addAtom(world, makeAtom({...ELEMENT_PORTAL_PASTLINE, x: 100, y: 460}))
		addAtom(world, makeAtom({...ELEMENT_PORTAL_PASTLINE, x: 400, y: 150, turns: 1}))
		
	}
	else if (EXPERIMENT_ID === "futurelinefling") {
		addAtom(world, makeAtom({...ELEMENT_FROG, x: 130, y: 150, flipX: true}))
		addAtom(world, makeAtom({...ELEMENT_LEAF, x: 450, y: 100, flipX: true}))
		//addAtom(world, makeAtom({...ELEMENT_FROG, x: 130, y: 250, flipX: true}))
		//addAtom(world, makeAtom({...ELEMENT_FROG, x: 130, y: 400, flipX: true}))
		addAtom(world, makeAtom({...ELEMENT_PORTAL_FUTURELINE, x: 100, y: 460}))
		addAtom(world, makeAtom({...ELEMENT_PORTAL_FUTURELINE, x: 400, y: 150, turns: 1}))
		
	}
	else if (EXPERIMENT_ID === "pastnowlinefling") {
		addAtom(world, makeAtom({...ELEMENT_FROG, x: 130, y: 90, flipX: true}))
		//addAtom(world, makeAtom({...ELEMENT_LEAF, x: 450, y: 50, flipX: true}))
		//addAtom(world, makeAtom({...ELEMENT_FROG, x: 130, y: 250, flipX: true}))
		//addAtom(world, makeAtom({...ELEMENT_FROG, x: 130, y: 400, flipX: true}))
		addAtom(world, makeAtom({...ELEMENT_PORTAL_PASTNOWLINE, x: 105, y: 460}))
		addAtom(world, makeAtom({...ELEMENT_PORTAL_PASTNOWLINE, x: 450, y: 180, turns: 1}))
		
	}
	else if (EXPERIMENT_ID === "pastnowfling") {
		addAtom(world, makeAtom({...ELEMENT_FROG, x: 130, y: 90, flipX: true}))
		//addAtom(world, makeAtom({...ELEMENT_LEAF, x: 450, y: 50, flipX: true}))
		//addAtom(world, makeAtom({...ELEMENT_FROG, x: 130, y: 250, flipX: true}))
		//addAtom(world, makeAtom({...ELEMENT_FROG, x: 130, y: 400, flipX: true}))
		addAtom(world, makeAtom({...ELEMENT_PORTAL_PASTNOW, x: 100, y: 460}))
		addAtom(world, makeAtom({...ELEMENT_PORTAL_PASTNOW, x: 400, y: 150, turns: 1}))
		
	}
	else if (EXPERIMENT_ID === "pastnow") {
		addAtom(world, makeAtom({...ELEMENT_FROG, x: 130, y: 90, flipX: true}))
		//addAtom(world, makeAtom({...ELEMENT_LEAF, x: 450, y: 50, flipX: true}))
		//addAtom(world, makeAtom({...ELEMENT_FROG, x: 130, y: 250, flipX: true}))
		//addAtom(world, makeAtom({...ELEMENT_FROG, x: 130, y: 400, flipX: true}))
		addAtom(world, makeAtom({...ELEMENT_PORTAL_PASTNOW, x: 100, y: 460}))
		addAtom(world, makeAtom({...ELEMENT_PORTAL_PASTNOW, x: 310, y: 150, turns: 0}))
		
	}
	else if (EXPERIMENT_ID === "pastnowline") {
		addAtom(world, makeAtom({...ELEMENT_FROG, x: 130, y: 90, flipX: true}))
		//addAtom(world, makeAtom({...ELEMENT_LEAF, x: 450, y: 50, flipX: true}))
		//addAtom(world, makeAtom({...ELEMENT_FROG, x: 130, y: 250, flipX: true}))
		//addAtom(world, makeAtom({...ELEMENT_FROG, x: 130, y: 400, flipX: true}))
		addAtom(world, makeAtom({...ELEMENT_PORTAL_PASTNOWLINE, x: 100, y: 460}))
		addAtom(world, makeAtom({...ELEMENT_PORTAL_PASTNOWLINE, x: 310, y: 150, turns: 0}))
		
	}
	else if (EXPERIMENT_ID === "pastnowlinebounce") {
		addAtom(world, makeAtom({...ELEMENT_FROG, x: 75, y: 90, flipX: true}))
		//addAtom(world, makeAtom({...ELEMENT_LEAF, x: 450, y: 50, flipX: true}))
		//addAtom(world, makeAtom({...ELEMENT_FROG, x: 130, y: 250, flipX: true}))
		//addAtom(world, makeAtom({...ELEMENT_FROG, x: 130, y: 400, flipX: true}))
		addAtom(world, makeAtom({...ELEMENT_PORTAL_PASTNOWLINE, x: 50, y: 460}))
		addAtom(world, makeAtom({...ELEMENT_PORTAL_PASTNOWLINE, x: 220, y: 300, turns: 0}))
		addAtom(world, makeAtom({...ELEMENT_LILYPAD, x: 312, y: 475}))
		
	}
	else if (EXPERIMENT_ID === "simplepastline") {
		addAtom(world, makeAtom({...ELEMENT_PORTAL_PASTLINE, x: 100, y: 360}))
		addAtom(world, makeAtom({...ELEMENT_PORTAL_PASTLINE, x: 300, y: 150}))
	}
	else if (EXPERIMENT_ID === "simpledimension") {
		addAtom(world, makeAtom({...ELEMENT_PORTAL_DIMENSION, x: 100, y: 360}))
		addAtom(world, makeAtom({...ELEMENT_PORTAL_DIMENSION, x: 300, y: 150}))
	}
	else if (EXPERIMENT_ID === "simplefuture") {
		addAtom(world, makeAtom({...ELEMENT_FROG, x: 130, y: 100, flipX: true}))
		addAtom(world, makeAtom({...ELEMENT_PORTAL_FUTURELINE, x: 100, y: 360}))
		addAtom(world, makeAtom({...ELEMENT_PORTAL_FUTURELINE, x: 300, y: 150}))
	}
	else if (EXPERIMENT_ID === "freefall") {
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
		
		//addAtom(world, makeAtom({...ELEMENT_PORTAL_MOVE, x: 205, y: 125}))
		//addAtom(world, makeAtom({...ELEMENT_PORTAL_MOVE, x: 205, y: 250}))
	}
	
	else if (EXPERIMENT_ID === "pastlineright") {
		addAtom(world, makeAtom({...ELEMENT_PORTAL_PASTLINE, x: 178, y: 330, turns: 1}))
		addAtom(world, makeAtom({...ELEMENT_PORTAL_PASTLINE, x: 350, y: 330, turns: 1}))
		addAtom(world, makeAtom({...ELEMENT_FROG, x: 100, y: 380, flipX: true}))
		
		//addAtom(world, makeAtom({...ELEMENT_PORTAL_MOVE, x: 205, y: 125}))
		//addAtom(world, makeAtom({...ELEMENT_PORTAL_MOVE, x: 205, y: 250}))
	}
	else if (EXPERIMENT_ID === "dimensionfall") {
		addAtom(world, makeAtom({...ELEMENT_PORTAL_DIMENSION, x: 300, y: 160}))
		addAtom(world, makeAtom({...ELEMENT_PORTAL_DIMENSION, x: 300, y: 300}))
	}
	else if (EXPERIMENT_ID === "pastlinefall") {
		addAtom(world, makeAtom({...ELEMENT_PORTAL_PASTLINE, x: 300, y: 160}))
		addAtom(world, makeAtom({...ELEMENT_PORTAL_PASTLINE, x: 300, y: 300}))
	}
	else if (EXPERIMENT_ID === "gfling") {
		const ptype = PORTAL_TYPE_ID
		const pelement = eval("ELEMENT_PORTAL_" + ptype)
		const felement = eval("ELEMENT_FROG_" + MENU_ID.as(UpperCase))
		if (!NO_FROG_SPAWN_ID) addAtom(world, makeAtom({...felement, x: 130, y: 90, flipX: true}))
		
		addAtom(world, makeAtom({...pelement, x: 100, y: 460}))
		addAtom(world, makeAtom({...pelement, x: 400, y: 150, turns: 1}))
	}
	else if (EXPERIMENT_ID === "gfall") {
		const ptype = PORTAL_TYPE_ID
		const pelement = eval("ELEMENT_PORTAL_" + ptype)
		const felement = eval("ELEMENT_FROG_" + MENU_ID.as(UpperCase))
		if (!NO_FROG_SPAWN_ID) addAtom(world, makeAtom({...felement, x: 130, y: 90, flipX: true}))
		addAtom(world, makeAtom({...pelement, x: 300, y: 160}))
		addAtom(world, makeAtom({...pelement, x: 300, y: 300}))
	}
	else if (EXPERIMENT_ID === "gsimple") {
		const ptype = PORTAL_TYPE_ID
		const pelement = eval("ELEMENT_PORTAL_" + ptype)
		const felement = eval("ELEMENT_FROG_" + MENU_ID.as(UpperCase))
		if (!NO_FROG_SPAWN_ID) addAtom(world, makeAtom({...felement, x: 130, y: 90, flipX: true}))
		//addAtom(world, makeAtom({...ELEMENT_LEAF, x: 20, y: 90, flipX: true}))
		addAtom(world, makeAtom({...pelement, x: 100, y: 360}))
		addAtom(world, makeAtom({...pelement, x: 300, y: 150}))
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
const addAtom = (world, atom, {ignoreLinks = false} = {}) => {
	world.atoms.push(atom)
	atom.world = world // I give up. Lets use state... :(
	if (!ignoreLinks) {
		for (const link of atom.links) {
			addAtom(world, link.atom)
		}
	}
	//atom.prevBounds = getBounds(atom)
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

const numberAtoms = (atoms) => {
	let i = 0
	for (const atom of atoms) {
		atom.atom_id = i++
	}
}

// THIS FUNCTION IS TOTALLY BROKEN
// AVOID AT ALL COSTS
// target (for portals)
// parent
// links link.atom
// portals.top left right bottom
const betterCloneAtoms = (atoms, new_world) => {

	// Number stuff relatively speaking
	numberAtoms(atoms)
	const cloned_atoms = []
	for (const atom of atoms) {
		const cloned_atom = {atom_id: atom.atom_id}
		cloned_atoms[atom.atom_id] = cloned_atom
	}

	for (const atom of atoms) {
		const cloned_atom = cloned_atoms[atom.atom_id]
		for (const key in atom) {
			if (key === "atom_id") {
				continue
			}
			if (key === "world") {
				cloned_atom.world = new_world
				continue
			}
			if (key === "id") {
				cloned_atom.id = atom.id //JUST FOR DEBUGGING NOT FOR ANYTHING ELSE //HAHA I USED IT FOR SOMETHING ELSE WHAT A BAD IDEA
				continue
			}
			if (key === "target" || key === "parent") {
				if (atoms.includes(atom[key])) {
					cloned_atom[key] = cloned_atoms[atom[key].atom_id]
					continue
				}
				const a = atom[key]
				if (a === undefined) {
					cloned_atom[key] = undefined
					continue
				}
				if (!a.world.atoms.includes(a)) {
					cloned_atom[key] = undefined
					if (key === "parent" && cloned_atom.onPromote !== undefined) cloned_atom.onPromote(cloned_atom)
					continue
				}
			}
			if (key === "portals") {
				cloned_atom[key] = {}
				for (const subKey in atom[key]) {
					if (atoms.includes(atom[key][subKey])) {
						cloned_atom[key][subKey] = cloned_atoms[atom[key][subKey].atom_id]
					}
					else {
						cloned_atom[key][subKey] = atom[key][subKey]
					}
				}
				continue
			}
			if (key === "links") {
				cloned_atom.links = []
				for (const link of atom.links) {
					const cloned_link = {}
					cloned_link.offset = link.offset
					cloned_link.transfer = link.transfer

					if (atoms[link.atom.atom_id] === link.atom) {
						cloned_link.atom = cloned_atoms[link.atom.atom_id]
						//cloned_link.atom = link.atom
						cloned_atom.links.push(cloned_link)
					}
					else {
						cloned_link.atom = link.atom
						const a = cloned_link.atom
						if (a.world.atoms.includes(a)) {
							cloned_atom.links.push(cloned_link)
						}
					}

					
				}
				continue
			}

			cloned_atom[key] = atom[key]

		}
	}



	return cloned_atoms
}

const cloneWorld = (world) => {
	const cloned_world = makeWorld()
	const cloned_atoms = betterCloneAtoms(world.atoms, cloned_world)
	cloned_world.atoms = cloned_atoms
	cloned_world.id = world.id
	return cloned_world
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

const savePastProjection = (world) => {
	const projection = cloneWorld(world)
	projection.isProjection = true
	world.pastProjections.unshift(projection)
	world.pastProjections.length = 60
}

const saveFutureProjection = (world, num=30, autoCatchUp=true) => {
	//world.futureProjections = []
	const projection = cloneWorld(world)
	projection.isProjection = true
	world.futureProjection = projection
	projection.realWorld = world
	for (let i = 0; i < num; i++) {
		//const p = cloneWorld(world.futureProjection)
		//p.isProjection = true
		const p = world.futureProjection
		p.isOnCatchup = i < num-1
		if (!autoCatchUp) p.isOnCatchup = true
		updateWorld(p)
		prepWorld(p)
		//world.futureProjection = p
		p.isOnCatchup = false
	}
	projection.isOnCatchup = false
}

const fullUpdateWorld = (world) => {
	updateWorld(world)
	prepWorld(world)
	
}

const killOrphans = (world) => {
	for (const atom of world.atoms) {
		if (atom.parent === undefined) continue
		if (!atom.parent.links.some(link => link.atom === atom)) {
			removeAtom(world, atom)
			print("ORPHAN")
		}
	}
}

const updateWorld = (world) => {

	if (world.overridePaused) return
	if (world.bounceTimer !== undefined) {
		world.bounceTimer--
		if (world.bounceTimer < 0) {
			world.bounceTimer = undefined
			saveFutureProjection(world)
		}
	}

	if (world.pruneTimer !== undefined) {
		if (world.pruneTimer <= 0) {
			return removeWorld(multiverse, world)
		}
		else {
			world.pruneTimer--
		}

	}

	if (world.fadeReliance !== undefined) {
		if (world.fadeReliance > 0) {
			world.fadeReliance--
		}
		else for (const atom of world.atoms) {
			if (atom.opacity === undefined) atom.opacity = 1
			//print(atom.fadeReliantOn)
			if (world.atoms.includes(atom.fadeReliantOn)) {
				atom.opacity -= 0.02
				if (atom.opacity <= 0) {
					removeAtom(world, atom)
				}
			}
			else {
				atom.opacity = 1.0
			}
		}
	}

	if (world.futureNowRecordings !== undefined) {

		if (world.futureNowReplay !== undefined) {
			
			if (world.futureNowRecordings[world.futureNowReplay] === undefined) {
				removeWorld(multiverse, world)
				world.futureNowBaseWorld.overridePaused = false
				return
			}

			replaceWorld(world.futureNowBaseWorld, world.futureNowRecordings[world.futureNowReplay])
			world.futureNowRecordings[world.futureNowReplay].overridePaused = true
			world.futureNowBaseWorld = world.futureNowRecordings[world.futureNowReplay]
			world.futureNowReplay++
		}
		else {
			const copy = cloneWorld(world)
			world.futureNowRecordings.push(copy)
			
			if (world.futureNowRecordings.length >= 29) {

				//removeWorld(multiverse, world.futureNowBaseWorld)
				//world.futureNowRecordings = undefined
				world.futureNowReplay = 0
				
				
			}
		}
	}

	if (!world.isProjection) {
		if (world.projection_skip > 0) {
			world.projection_skip--
		}
		else {
			savePastProjection(world)
		}
		//print("update real", world.id)

	}
	
	if (!world.isProjection && world.atoms.some(a => a.requiresFutureProjections)) {
		if (world.futureProjection === undefined || !world.futureProjection.isProjection) {
			if (world.future_projection_skip > 0) {
				world.future_projection_skip--
				//saveFutureProjection(world, 30, false)
				//print("skip", world)
			}
			else {

				saveFutureProjection(world)
			}
		}
		else {
			/*if (world.future_projection_skip > 0) {
				world.future_projection_skip--
			}
			else {
				saveFutureProjection(world)
			}*/
			world.futureProjection.isOnCatchup = false
			fullUpdateWorld(world.futureProjection)
			//print("update", world.id)
		}
	}

	for (const atom of world.atoms) {
		atom.nextdx = atom.dx
		atom.nextdy = atom.dy
	}
	
	for (const atom of world.atoms) {
		updateAtom(atom, world)
	}

	killOrphans(world)
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

	//if (world.pastProjections === undefined) return
	//const projection = world.pastProjections[30]
	const projection = world
	if (projection !== undefined) {
		for (const atom of projection.atoms) {
			drawAtom(atom, context)
		}
	}

}
