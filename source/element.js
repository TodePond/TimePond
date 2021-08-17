//=========//
// Drawers //
//=========//
const DRAW_RECTANGLE = (self, context) => {
	const {x, y, width, height, colour = Colour.Red, cutTop=0, cutBottom=0, cutLeft=0, cutRight=0} = self
	context.fillStyle = colour
	context.fillRect(x+cutLeft, y+cutTop, width-(cutRight+cutLeft), height-(cutBottom+cutTop))
}

const DRAW_CIRCLE = (self, context) => {
	const {x, y, width, height, colour = Colour.Red, cutTop=0, cutBottom=0, cutLeft=0, cutRight=0} = self
	context.fillStyle = colour
	context.beginPath()
	context.arc(x+height/2, y+height/2, height/2, 0, 2*Math.PI)
	context.fill()
}

const images = {}
const DRAW_IMAGE = (self, context) => {

	// Sprite
	if (images[self.source] === undefined) {
		const image = new Image()
		image.src = self.source
		images[self.source] = image
	}
	const image = images[self.source]
	const imageHeightRatio = image.height/self.height
	const imageWidthRatio = image.width/self.width

	// Positioning
	const bounds = getBounds(self)
	const boundsWidth = bounds.right - bounds.left
	const boundsHeight = bounds.bottom - bounds.top
	const boundsDimensionDiff = boundsWidth - boundsHeight

	const centerX = (bounds.right + bounds.left)/2
	const centerY = (bounds.bottom + bounds.top)/2

	// Cuts
	let {cutRight, cutLeft, cutBottom, cutTop} = self
	if (self.flipX) [cutLeft, cutRight] = [cutRight, cutLeft]
	if (self.flipX)  for (let i = 0; i < self.turns; i++) [cutRight, cutTop, cutLeft, cutBottom] = [cutTop, cutLeft, cutBottom, cutRight]
	if (!self.flipX) for (let i = 0; i < self.turns; i++) [cutRight, cutBottom, cutLeft, cutTop] = [cutBottom, cutLeft, cutTop, cutRight]
	
	const cutWidth = cutRight + cutLeft
	const cutHeight = cutBottom + cutTop

	// Snippet
	const snippetX = cutLeft*imageWidthRatio
	const snippetY = cutTop*imageHeightRatio
	const snippetWidth = image.width - cutWidth*imageWidthRatio
	const snippetHeight = image.height - cutHeight*imageHeightRatio

	// Flips and Rotations
	context.save()
	if (self.flipX || self.turns > 0) {
		context.translate(centerX, centerY)
		if (self.flipX) context.scale(-1, 1)
		if (self.turns > 0) context.rotate(Math.PI/2 * self.turns)
		context.translate(-centerX, -centerY)
	}

	// Draw!
	if (self.turns % 2 !== 0) context.drawImage(image, snippetX, snippetY, snippetWidth, snippetHeight, bounds.left+boundsDimensionDiff/2, bounds.top-boundsDimensionDiff/2, boundsHeight, boundsWidth)
	else context.drawImage(image, snippetX, snippetY, snippetWidth, snippetHeight, bounds.left, bounds.top, boundsWidth, boundsHeight)
	context.restore()

	// Debug: Showing bounding box!
	if (self.showBounds) {
		context.strokeStyle = Colour.White
		context.strokeRect(bounds.left, bounds.top, bounds.right-bounds.left, bounds.bottom-bounds.top)
	}
}

const DRAW_SPAWNER = (self, context) => {
	const {spawn} = self
	const {draw} = spawn
	draw(self, context)
}

//==========//
// Updaters //
//==========//
const UPDATE_STATIC = (self) => {
	self.dx = 0
	self.dy = 0
	self.nextdx = 0
	self.nextdy = 0
}

const UPDATE_NONE = () => {}

const UPDATE_MOVER_GRAVITY = 0.5
const UPDATE_MOVER_AIR_RESISTANCE = 0.99
const UPDATE_MOVER_FRICTION = 0.8
const UPDATE_MOVER_BEING = (self, world) => {
	UPDATE_MOVER(self, world)
	if (self.flipX && self.dx < -0.1) {
		flipAtom(self)
	}
	else if (!self.flipX && self.dx > 0.1) {
		flipAtom(self)
	}
	if (self.nextdx < 0.1 && self.nextdx > -0.1 && self.grounded) {
		if (self.jumpTick > 60) {
			if (self.turns !== 0) {
				turnAtom(self, -self.turns, true, true, world)
				self.nextdx = 1 * (self.flipX? 1 : -1)
				self.nextdy = -2
				self.jumpTick = 0
			}
			else {
				self.nextdx = 3 * (self.flipX? 1 : -1)
				self.nextdy = -10
				self.jumpTick = 0
			}
		}
		else {
			if (self.jumpTick === undefined) self.jumpTick = 0
			self.jumpTick++
		}
	}
}

const Capitalised = {
	convert: (s) => s[0].as(UpperCase) + s.slice(1)
}

const makeBlink = () => ({})
const UPDATE_MOVER = (self, world) => {

	const {x, y, dx, dy, width, height, cutTop=0, cutBottom=0, cutLeft=0, cutRight=0} = self

	// Reset some game state info
	self.grounded = false
	self.slip = undefined

	// Prepare axis-independent info
	const axes = {
		dy: {},
		dx: {},
	}

	axes.dy.name = "y"
	axes.dy.new = y + dy
	axes.dy.blocker = {atom: undefined, bounds: undefined, distance: Infinity}
	axes.dy.small = "top"
	axes.dy.big = "bottom"
	axes.dy.direction = dy >= 0? 1 : -1
	axes.dy.front = axes.dy.direction === 1? axes.dy.big : axes.dy.small
	axes.dy.back = axes.dy.front === axes.dy.small? axes.dy.big : axes.dy.small
	axes.dy.other = axes.dx
	axes.dy.cutFrontName = "cut" + axes.dy.front.as(Capitalised)
	axes.dy.cutBackName = "cut" + axes.dy.back.as(Capitalised)
	
	axes.dx.name = "x"
	axes.dx.new = x + dx
	axes.dx.blocker = {atom: undefined, bounds: undefined, distance: Infinity}
	axes.dx.small = "left"
	axes.dx.big = "right"
	axes.dx.direction = dx >= 0? 1 : -1
	axes.dx.front = axes.dx.direction === 1? axes.dx.big : axes.dx.small
	axes.dx.back = axes.dx.front === axes.dx.big? axes.dx.small : axes.dx.big
	axes.dx.other = axes.dy
	axes.dx.cutFrontName = "cut" + axes.dx.front.as(Capitalised)
	axes.dx.cutBackName = "cut" + axes.dx.back.as(Capitalised)
	
	// TODO: Oh, I just realised that this should ALSO include my children's children!!!
	// I should write a function that like... gets an atom and its children as an array or something
	// Then I could use that to like... um... yeah I could just use that. ez
	// I WILL COME BACK TO THIS IN A SECOND I PROMISE

	// Get my current bounding box
	// And get my potential NEW bounding box (assuming I can complete the whole movement)
	// ALSO, let's get the bounding boxes of each of my children
	const sbounds = getBounds(self)
	const snbounds = getBounds({x: axes.dx.new, y: axes.dy.new, width, height, cutTop, cutBottom, cutLeft, cutRight})
	const lsbounds = self.links.map(link => getBounds(link.atom))
	const lnsbounds = self.links.map(link => getBounds({...link.atom, x: link.atom.x+dx, y: link.atom.y+dy}))

	// Get a list going of all atoms in this molecule
	// They are 'candidates' for being the atom that hits something first in each axis
	// For each candidate, let's note down their current bounding box, and their POTENTIAL new bounding box
	const candidates = []
	candidates.push({
		atom: self,
		bounds: sbounds,
		nbounds: snbounds,
		axes: {dx: {}, dy: {}}
	})
	for (let i = 0; i < self.links.length; i++) {
		const candidate = {
			atom: self.links[i].atom,
			bounds: lsbounds[i],
			nbounds: lnsbounds[i],
			axes: {dx: {}, dy: {}},
		}
		candidates.push(candidate)
	}

	// Also, let's get some useful dimension info for each candidate
	for (const candidate of candidates) {

		candidate.axes.dy.old = candidate.atom.y
		candidate.axes.dx.old = candidate.atom.x
		candidate.axes.dy.new = candidate.atom.y + dy //WARNING: this is repeated code from above. kinda dodgy TBH
		candidate.axes.dx.new = candidate.atom.x + dx //WARNING: this is repeated code from above. kinda dodgy TBH

		candidate.axes.dy.size = height
		candidate.axes.dy.cutSmall = cutTop
		candidate.axes.dy.cutBig = cutBottom

		candidate.axes.dx.size = width
		candidate.axes.dx.cutSmall = cutLeft
		candidate.axes.dx.cutBig = cutRight
	}

	//================================//
	// Process the EXITING of portals // TODO: Come back to this after I make basic children collisions!!!!!!!!!!!!!!!!!
	//================================//       to implement children moving out of portals
	for (const key in self.portals) {
		const portal = self.portals[key]
		if (portal === undefined) continue
		const pbounds = getBounds(portal)
		for (const axis of axes) {
			if (axis.back !== key) continue
			
			// Re-cut myself so that I slightly leave portal! Yikes
			const gapToPortal = axis.direction * (snbounds[axis.back] - pbounds[axis.front])
			self[axis.cutBackName] -= gapToPortal

			if (portal.portal.move !== undefined) portal.portal.move()
			if (portal.portal.moveIn !== undefined) portal.portal.moveIn()

			if (self[axis.cutBackName] <= 0) {
				self.portals[axis.back] = undefined
				if (portal.portal.exit !== undefined) portal.portal.exit()
			}

		}
	}
	//==================================================================//
	// Find the FIRST atom I would hit if I travel forever in each axis //
	//==================================================================//
	for (const atom of world.atoms) {

		if (self.parent === atom) continue
		if (atom.parent === self) continue
		if (atom.isVisual) continue
		if (atom === self) continue
		const abounds = getBounds(atom)

		for (const axis of axes) {

			for (const candidate of candidates) {

				const bounds = candidate.bounds
				const nbounds = candidate.nbounds
				
				// Do I go PAST this atom?
				const startsInFront = bounds[axis.front]*axis.direction <= abounds[axis.back]*axis.direction
				const endsThrough = nbounds[axis.front]*axis.direction >= abounds[axis.back]*axis.direction
				if (!startsInFront || !endsThrough) continue

				// Do I actually BUMP into this atom? (ie: I don't go to the side of it)
				let bumps = true
				const otherAxes = axes.values().filter(a => a !== axis)
				for (const other of otherAxes) {
					const reach = [bounds[other.small], bounds[other.big]]
					const nreach = [nbounds[other.small], nbounds[other.big]]
					const areach = [abounds[other.small], abounds[other.big]]
					if (!aligns(reach, nreach, areach)) bumps = false
				}
				if (!bumps) continue
				
				// Work out the distance to this atom we would crash into
				// We don't care about it if we already found a NEARER one to crash into :)
				const distance = (abounds[axis.back] - bounds[axis.front]) * axis.direction
				if (distance < 0) continue
				if (distance >= axis.blocker.distance) continue
				axis.blocker = {atom, bounds: abounds, distance, cbounds: bounds, cnbounds: nbounds, candidate}
			}
		}
	}

	//===================================================//
	// COLLIDE with the closest atoms to me in each axis //
	//===================================================//
	for (const axis of axes) {
		const {atom} = axis.blocker
		if (atom === undefined) continue
		const bbounds = axis.blocker.bounds
		const baxis = axis.blocker.candidate.axes["d"+axis.name]
		
		// Allow MODs by elements/atoms
		if (self.preCollide !== undefined) {
			const result = self.preCollide({self, atom, axis, world, bounds: axis.blocker.cbounds, nbounds: axis.blocker.cnbounds, abounds: axis.blocker.bounds})
			if (result === false) continue
		}
		if (atom.preCollided !== undefined) {
			const result = atom.preCollided({self, atom, axis, world, bounds: axis.blocker.cbounds, nbounds: axis.blocker.cnbounds, abounds: axis.blocker.bounds})
			if (result === false) continue
		}
		
		// SNAP to the surface!
		const newOffset = axis.front === axis.small? -baxis.cutSmall : -baxis.size + baxis.cutBig
		baxis.new = bbounds[axis.back] + newOffset
		const snapMovement = baxis.new - baxis.old
		axis.new = self[axis.name] + snapMovement
		
		// Change ACCELERATIONS!
		// Moving right or left
		if (axis === axes.dx) {

			// 2-way BOUNCE! I think this is the only 2-way collision resolution. I think...
			atom.nextdx *= 0.5
			atom.nextdx += self.dx/2
			transferToParent(atom, "nextdx", atom.nextdx)
			self.nextdx *= -0.5
			self.nextdx += atom.dx/2
			
			// Hardcoded trampoline override
			if (atom.bounce !== undefined && atom.turns % 2 !== 0) {
				self.nextdx = atom.bounce * -axis.direction/2
			}
		}
		else if (axis === axes.dy) {

			// Moving down
			if (axis.direction === 1) {

				// I'm on the ground!
				self.nextdy = atom.dy
				if (self.slip !== undefined) self.nextdx *= self.slip
				else self.nextdx *= UPDATE_MOVER_FRICTION
				self.grounded = true
				atom.jumpTick = 0

				// Hardcoded trampoline override
				if (atom.bounce !== undefined && atom.turns % 2 === 0) {
					self.nextdy = -atom.bounce
					self.nextdx *= 1.8
				}
				
			}

			// Moving up
			else {
				
				// Hit my head on something...
				self.nextdy = 0
				self.jumpTick = 0

			}
		}


	}
	
	// Apply natural forces
	self.nextdy += UPDATE_MOVER_GRAVITY
	self.nextdx *= UPDATE_MOVER_AIR_RESISTANCE

	// TODO: Fix this!
	// currently, it is moving the Ancestor to where the Candidate makes contact.
	// But it should like, move the Ancestor just a little bit or something/
	// Can I hardcode this here, ignoring 'offset' and 'trigger'??
	// Yeahhhhh >:)

	// Now that I've checked all potential collisions, and corrected myself...
	// MOVE to the new position!
	self.x = axes.dx.new
	self.y = axes.dy.new
	
	// Now that I've moved, I can safely rotate without messing anything else up!
	// ROTATE! (if there is enough room)
	if (self.nextturns !== 0) {
		turnAtom(self, self.nextturns, true, true, world)
		self.nextturns = 0
	}
}

//==========//
// Grabbers //
//==========//
const GRAB_DRAG = (self) => {
	// TODO: uncomment these two lines to prevent cutting froggies in half
	//if (self.portals !== undefined && self.portals.size > 0) return undefined
	//if (self.subjects !== undefined && self.subjects.size > 0) return undefined
	return self
}
const GRAB_STATIC = () => {}
const GRAB_SPAWNER = (self, hand, world) => {
	const atom = makeAtom(self.spawn)
	addAtom(world, atom)
	atom.x = self.x
	atom.y = self.y
	return atom
}

const GRAB_SPAWNER_PORTAL = (self, hand, world) => {
	//if (self.tally === undefined) self.tally = 0
	const grabbed = GRAB_SPAWNER(self, hand, world)
	/*self.tally++
	if (self.tally % 2 === 0) {
		if (self.tally/2 >= ELEMENT_PORTAL_COLOURS.length) self.tally = 0
		self.spawn = {...self.spawn, colour: ELEMENT_PORTAL_COLOURS[self.tally/2]}
		self.colour = self.spawn.colour
	}*/
	return grabbed
}

const GRAB_LINKEE = (self, hand, world) => {
	hand.offset.x -= self.x - self.parent.x
	hand.offset.y -= self.y - self.parent.y
	return self.parent.grab(self.parent, hand, world)
}

//=========//
// Portals //
//=========//
const PORTAL_VOID = {
	enter: () => {
		//print("Enter voidal!")
	},
	exit: (atom, world) => {
		//print("End voidal!")
	},
	moveIn: (atom, world) => {
		//print("Move in voidal!")
	},
	moveOut: (atom, world) => {
		//print("Move out voidal!")
	},
	move: () => {
		//print("Move through voidal!")
	}
}

const PORTAL_MOVE = {
	enter: () => {},
	end: () => {},
	moveIn: () => {},
	moveOut: () => {},
	leave: () => {},
}

//===========//
// Colliders //
//===========//
// TODO: stop the rotate potion from rotating portals/frogs that are currently portaling because it would tear atoms in half
const COLLIDE_POTION_ROTATE = ({self, atom, axis, world}) => {
	if (self.used) return
	atom = getAtomAncestor(atom)
	if (!atom.isVoid && !atom.isPotion) {
		world.atoms = world.atoms.filter(a => a !== self)
		if (!atom.isMover) turnAtom(atom, 1, true, true, world, [self])
		else atom.nextturns++
		self.used = true
		//atom.nextdx = 0
		atom.nextdy = -5
		atom.jumpTick = 0
		return false
	}
}

// TODO: stop the rotate potion from rotating portals/frogs that are currently portaling because it would tear atoms in half
const COLLIDED_POTION_ROTATE = ({self, atom, world}) => {
	if (atom.used) return
	atom = getAtomAncestor(atom)
	if (!self.isVoid && !self.isPotion) {
		world.atoms = world.atoms.filter(a => a !== atom)
		if (!self.isMover) turnAtom(self, 1, true, true, world, [atom])
		else self.nextturns++
		atom.used = true
		//atom.nextdx = 0
		self.nextdy = -5
		self.jumpTick = 0
		return false
	}
}

const COLLIDED_PORTAL_VOID = ({self, atom, axis, world, bounds, nbounds, abounds}) => {
	
	//==================================================//
	// BUMP edges of portal if I'm NOT going through it //
	//==================================================//
	if (self.portals[axis.front] !== atom) {

		const reach = [bounds[axis.other.small], bounds[axis.other.big]]
		const nreach = [nbounds[axis.other.small], nbounds[axis.other.big]]

		const sideBumps = {
			small: aligns(reach, nreach, [abounds[axis.other.small]]),
			big: aligns(reach, nreach, [abounds[axis.other.big]]),
		}

		// Collide with the edges of the portal
		if (sideBumps.small || sideBumps.big) {
			self.slip = 0.95
			return true
		}
	}

	// Otherwise, go through...

	// TODO
	//
	// MUCH LATER... after implementing children
	// It should make a child and connect it at the other portal
	//
	// still fixing children collisions (see above)

	// Cut myself down to go into portal
	const amountInPortal = axis.direction * (nbounds[axis.front] - abounds[axis.back])
	self[axis.cutFrontName] += amountInPortal
	const remainingSize = axis.size - self[axis.cutBackName]
	if (self[axis.cutFrontName] >= remainingSize) {
		removeAtom(world, self)
	}
	
	// Register (or re-register) that I am currently using this portal
	if (self.portals[axis.front] === undefined) {
		self.portals[axis.front] = atom
		if (atom.portal.enter !== undefined) atom.portal.enter()
	}
	
	if (atom.portal.move !== undefined) atom.portal.move()
	if (atom.portal.moveIn !== undefined) atom.portal.moveIn()

	if (self.portals[axis.front] !== atom) throw new Error(`[TimePond] An atom tried to go through two portals in the same direction.`)
	return false

}

//==========//
// Elements //
//==========//
const ELEMENT_BOX = {
	colour: Colour.Orange,
	draw: DRAW_RECTANGLE,
	update: UPDATE_MOVER,
	grab: GRAB_DRAG,
	isMover: true,
	width: 40,
	height: 40,
	/*autoLinks: [
		{
			element: {draw: DRAW_RECTANGLE, grab: GRAB_LINKEE, colour: Colour.Black, update: UPDATE_NONE, isVisual: true},
			offset: {width: () => 2, x: (x) => x},
		},
		{
			element: {draw: DRAW_RECTANGLE, grab: GRAB_LINKEE, colour: Colour.Black, update: UPDATE_NONE, isVisual: true},
			offset: {width: () => 2, x: (x) => x+40-2},
		},
		{
			element: {draw: DRAW_RECTANGLE, grab: GRAB_LINKEE, colour: Colour.Black, update: UPDATE_NONE, isVisual: true},
			offset: {height: () => 2, x: (x) => x},
		},
	]*/
}

const ELEMENT_PLATFORM = {
	colour: Colour.Silver,
	draw: DRAW_RECTANGLE,
	update: UPDATE_STATIC,
	grab: GRAB_DRAG,
	width: 150,
	height: 10,
}

const ELEMENT_VOID = {
	colour: Colour.Black,
	draw: DRAW_RECTANGLE,
	update: UPDATE_STATIC,
	grab: GRAB_STATIC,
	height: 10,
	width: WORLD_WIDTH,
	isVoid: true,
	y: 0,
}

const ELEMENT_SPAWNER = {
	update: UPDATE_STATIC,
	draw: DRAW_SPAWNER,
	grab: GRAB_SPAWNER,
	spawn: ELEMENT_BOX,
}

const ELEMENT_SPAWNER_PORTAL = {
	...ELEMENT_SPAWNER,
	grab: GRAB_SPAWNER_PORTAL,
}

const ELEMENT_PORTAL_COLOURS = [
	Colour.Purple,
	Colour.Orange,
	Colour.Green,
	Colour.Pink,
	Colour.Yellow,
	Colour.Cyan,
	Colour.Red,
]
const ELEMENT_PORTAL = {
	update: UPDATE_STATIC,
	draw: DRAW_RECTANGLE,
	grab: GRAB_DRAG,
	height: 5,
	width: 125,
	colour: Colour.Purple,
	isPortal: true,
	isPortalActive: false,
	autoLinks: [
		/*{
			element: {...ELEMENT_PLATFORM, grab: GRAB_LINKEE, colour: Colour.Black},
			offset: {width: (w) => w, y: (y) => y-2, x: (x) => x, height: () => 2,},
		},*/
		{
			element: {...ELEMENT_PLATFORM, grab: GRAB_LINKEE, colour: Colour.Black},
			offset: {width: () => 2, x: (x) => x-2},
		},
		{
			element: {...ELEMENT_PLATFORM, grab: GRAB_LINKEE, colour: Colour.Black},
			offset: {width: () => 2, x: (x) => x+125},
		},
		/*{
			element: {...ELEMENT_PLATFORM, grab: GRAB_LINKEE, colour: Colour.Black},
			offset: {width: (w) => w+4, y: (y) => y+5, x: (x) => x-2, height: () => 2,},
		},*/
	]

}

const ELEMENT_LILYPAD = {
	update: UPDATE_STATIC,
	draw: DRAW_RECTANGLE,
	grab: GRAB_DRAG,
	bounce: 15,
	height: 8,
	width: 80,
	colour: Colour.Green,
	isPortal: true,
	isPortalActive: false,
}

const ELEMENT_PORTAL_VOID = {
	...ELEMENT_PORTAL,
	portal: PORTAL_VOID,
	isPortalActive: true,
	preCollided: COLLIDED_PORTAL_VOID,
}

const ELEMENT_PORTAL_MOVE = {
	...ELEMENT_PORTAL,
	portal: PORTAL_MOVE,
}

const ELEMENT_POTION = {
	colour: Colour.Purple,
	draw: DRAW_CIRCLE,
	update: UPDATE_MOVER,
	height: 20,
	width: 20,
	isPotion: true,
	//preCollide: COLLIDE_POTION_ROTATE,
}

const ELEMENT_POTION_ROTATE = {
	...ELEMENT_POTION,
	colour: Colour.Orange,
	preCollide: COLLIDE_POTION_ROTATE,
	preCollided: COLLIDED_POTION_ROTATE,
}

const ELEMENT_FROG = {
	//filter: "invert(58%) sepia(77%) saturate(5933%) hue-rotate(336deg) brightness(110%) contrast(108%)",
	draw: DRAW_IMAGE,
	update: UPDATE_MOVER_BEING,
	grab: GRAB_DRAG,
	source: "images/Blank@0.25x.png",
	width: 354/6/* - 11 - 7*/,
	height: 254/6,
	isMover: true,
	//cutBottom: (254/6)/2,
	//cutRight: 5,
	//cutLeft: 10,
	//cutTop: 10,
	showBounds: true,
}

const ELEMENT_BOX_DOUBLE = {
	...ELEMENT_BOX,
	update: UPDATE_MOVER,
	isMover: false,
	autoLinks: [
		//...ELEMENT_BOX.autoLinks,
		{
			element: {...ELEMENT_BOX, update: UPDATE_STATIC, grab: GRAB_LINKEE},
			offset: {
				y: (y) => y + 50,
				//dy: () => 0,
				//dx: () => 0,
				//nextdy: () => 0,
				//nextdx: () => 0,
			},
		},
	]
}