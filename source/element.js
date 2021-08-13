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
	for (let i = 0; i < self.turns; i++) [cutRight, cutBottom, cutLeft, cutTop] = [cutBottom, cutLeft, cutTop, cutRight]

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

	axes.dy.blocker = {atom: undefined, bounds: undefined, distance: Infinity}
	axes.dy.small = "top"
	axes.dy.big = "bottom"
	axes.dy.direction = dy >= 0? 1 : -1
	axes.dy.front = axes.dy.direction === 1? axes.dy.big : axes.dy.small
	axes.dy.back = axes.dy.front === axes.dy.small? axes.dy.big : axes.dy.small
	axes.dy.new = y + dy
	axes.dy.size = height
	axes.dy.cutSmall = cutTop
	axes.dy.cutBig = cutBottom
	axes.dy.other = axes.dx
	axes.dy.cutFrontName = "cut" + axes.dy.front.as(Capitalised)
	axes.dy.cutBackName = "cut" + axes.dy.back.as(Capitalised)

	axes.dx.blocker = {atom: undefined, bounds: undefined, distance: Infinity}
	axes.dx.small = "left"
	axes.dx.big = "right"
	axes.dx.direction = dx >= 0? 1 : -1
	axes.dx.front = axes.dx.direction === 1? axes.dx.big : axes.dx.small
	axes.dx.back = axes.dx.front === axes.dx.big? axes.dx.small : axes.dx.big
	axes.dx.new = x + dx
	axes.dx.size = width
	axes.dx.cutSmall = cutLeft
	axes.dx.cutBig = cutRight
	axes.dx.other = axes.dy
	axes.dx.cutFrontName = "cut" + axes.dx.front.as(Capitalised)
	axes.dx.cutBackName = "cut" + axes.dx.back.as(Capitalised)

	// Get my current bounding box
	// And get my potential NEW bounding box (assuming I can complete the whole movement)
	const bounds = getBounds(self)
	const nbounds = getBounds({x: axes.dx.new, y: axes.dy.new, width, height, cutTop, cutBottom, cutLeft, cutRight})

	//==================================================================//
	// Find the FIRST atom I would hit if I travel forever in each axis //
	//==================================================================//
	for (const atom of world.atoms) {

		if (atom === self) continue
		const abounds = getBounds(atom)

		for (const axis of axes) {

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
			axis.blocker = {atom, bounds: abounds, distance}
		}
	}

	//===================================================//
	// COLLIDE with the closest atoms to me in each axis //
	//===================================================//
	for (const axis of axes) {
		const {atom} = axis.blocker
		if (atom === undefined) continue
		const bbounds = axis.blocker.bounds
		

		// Allow MODs by elements/atoms
		if (self.preCollide !== undefined) {
			const result = self.preCollide({self, atom, axis, world, bounds, nbounds, abounds: axis.blocker.bounds})
			if (result === false) continue
		}
		if (atom.preCollided !== undefined) {
			const result = atom.preCollided({self, atom, axis, world, bounds, nbounds, abounds: axis.blocker.bounds})
			if (result === false) continue
		}
		
		// SNAP to the surface!
		const newOffset = axis.front === axis.small? -axis.cutSmall : -axis.size + axis.cutBig
		axis.new = bbounds[axis.back] + newOffset
		
		// Change ACCELERATIONS!
		// Moving right or left
		if (axis === axes.dx) {

			// 2-way BOUNCE!
			atom.nextdx *= 0.5
			atom.nextdx += self.dx/2
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
				if (self.slip !== undefined) self.nextdx * self.slip
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
	world.atoms.push(atom)
	atom.x = self.x
	atom.y = self.y
	return atom
}

const GRAB_SPAWNER_PORTAL = (self, hand, world) => {
	if (self.tally === undefined) self.tally = 0
	const grabbed = GRAB_SPAWNER(self, hand, world)
	self.tally++
	if (self.tally % 2 === 0) {
		if (self.tally/2 >= ELEMENT_PORTAL_COLOURS.length) self.tally = 0
		self.spawn = {...self.spawn, colour: ELEMENT_PORTAL_COLOURS[self.tally/2]}
		self.colour = self.spawn.colour
	}
	return grabbed
}

//=========//
// Portals //
//=========//
const PORTAL_VOID = {
	enter: () => {
		print("Enter voidal!")
	},
	end: (atom, world) => {
		world.atoms = world.atoms.filter(a => a !== atom)
		print("End voidal!")
	},
	moveIn: (atom, world) => {
		print("Move in voidal!")
	},
	moveOut: (atom, world) => {
		print("Move out voidal!")
	},
	leave: () => {
		print("Leave voidal!")
	},
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
const COLLIDE_POTION_ROTATE = ({self, atom, axis, world}) => {
	if (self.used) return
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

const COLLIDED_POTION_ROTATE = ({self, atom, world}) => {
	if (atom.used) return
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
	
	
	const reach = [bounds[axis.other.small], bounds[axis.other.big]]
	const nreach = [nbounds[axis.other.small], nbounds[axis.other.big]]

	const sideBumps = {
		small: aligns(reach, nreach, [abounds[axis.other.small]]),
		big: aligns(reach, nreach, [abounds[axis.other.big]]),
	}

	// Collide with the edges of the portal
	if (sideBumps.small || sideBumps.big) {
		self.slip = 0.975
		return true
	}

	// Otherwise, go through...

	// TODO
	//
	// IGNORE THIS PART, do it later...
	// here, keep track of this portaling within atom.portals[axis.front] or something
	// the portal could have an array of portaling atoms maybe?
	// but why? not sure, therefore DONT DO IT yet
	//
	// DO THIS FIRST
	// i guess it would need to update the cut somewhere else in code, EG: a separate function in UPDATE_MOVER
	// this is where the thingy above comes in. it needs to keep track of what its portal is for each side.
	// so it can update its cut if it moves slightly OUT of the portal.
	//
	// MUCH LATER... after implementing children
	// It should make a child and connect it at the other portal

	const amountInPortal = axis.direction * (nbounds[axis.front] - abounds[axis.back])
	self[axis.cutFrontName.d] += amountInPortal
	const remainingSize = axis.size - self[axis.cutBackName]
	if (self[axis.cutFrontName] >= remainingSize) {
		world.atoms = world.atoms.filter(a => a !== self)
	}

	return false

}

//==========//
// Elements //
//==========//
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
	cutLeft: 10,
	//cutTop: 10,
	showBounds: true,
}

const ELEMENT_BOX = {
	colour: Colour.Orange,
	draw: DRAW_RECTANGLE,
	update: UPDATE_MOVER,
	grab: GRAB_DRAG,
	isMover: true,
	width: 40,
	height: 40
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
	width: 115,
	colour: Colour.Purple,
	isPortal: true,
	isPortalActive: false,
	//preCollide: choose your collider,
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

const ELEMENT_FROG_DOUBLE = {
	...ELEMENT_FROG,
	construct: (self) => {
		self.children = [makeAtom({...ELEMENT_FROG, x: 0, y: 50})]
	}
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
