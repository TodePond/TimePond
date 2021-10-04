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

	if (self === undefined) return

	/*if (self.previousDraw !== undefined) {
		let prev = self.previousDraw
		DRAW_IMAGE(prev, context)
		//self.trailCount--
			
	}

	if (self.trailCount === undefined || self.trailCount < TRAIL_LENGTH) {
		self.previousDraw = cloneAtom(self)
		self.previousDraw.trailCount = self.trailCount + 1
	}
	else {
		self.previousDraw = undefined
	}*/

	//self.previousDraw = cloneAtom(self)
	//self.previousDraw.previousDraw = undefined

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

	let centerX = (bounds.right + bounds.left)/2
	let centerY = (bounds.bottom + bounds.top)/2
	const centerDiff = centerX - centerY

	if (self.turns === 1) {
		//centerY += boundsDimensionDiff/2
	}
/*	else if (self.turns === 3) {
		centerY -= boundsDimensionDiff/2
		centerX -= boundsDimensionDiff/4
	}*/

	// Cuts
	let {cutRight, cutLeft, cutBottom, cutTop} = self
	if (!self.flipX) {
		for (let i = 0; i < self.turns; i++) [cutRight, cutBottom, cutLeft, cutTop] = [cutBottom, cutLeft, cutTop, cutRight]
	}
	if (self.flipX) {
		//;[cutLeft, cutRight] = [cutRight, cutLeft]
		if (self.turns % 2 !== 0) [cutLeft, cutRight] = [cutRight, cutLeft]
		if (self.turns % 2 === 0) [cutLeft, cutRight] = [cutRight, cutLeft]
		//if (self.turns % 2 !== 0) [cutTop, cutBottom] = [cutBottom, cutTop]
		for (let i = 0; i < self.turns; i++) [cutRight, cutBottom, cutLeft, cutTop] = [cutBottom, cutLeft, cutTop, cutRight]
	}
	//for (let i = 0; i < self.turns; i++) [cutRight, cutBottom, cutLeft, cutTop] = [cutBottom, cutLeft, cutTop, cutRight]
	
	//else if (self.flipX && self.turns % 2 === 0) [cutTop, cutBottom] = [cutBottom, cutTop]

	const cutWidth = cutRight + cutLeft
	const cutHeight = cutBottom + cutTop

	// Snippet
	const snippetX = cutLeft*imageWidthRatio
	const snippetY = cutTop*imageHeightRatio
	const snippetWidth = image.width - cutWidth*imageWidthRatio
	const snippetHeight = image.height - cutHeight*imageHeightRatio

	const flipWidthRatio = image.height/self.width
	const flipHeightRatio = image.width/self.height


	// Flips and Rotations
	context.save()
	if (self.flipX || self.turns > 0) {
		context.translate(centerX, centerY)
		if (self.flipX) context.scale(-1, 1)
		if (self.turns > 0) context.rotate(Math.PI/2 * self.turns)
		context.translate(-centerX, -centerY)
	}

	// Draw!
	/*if (self.turns % 2 !== 0) {
		//context.drawImage(image, snippetX, snippetY, snippetWidth, snippetHeight, bounds.left+boundsDimensionDiff/2, bounds.top-boundsDimensionDiff/2, boundsHeight, boundsWidth)
		cutLeft.d
		context.drawImage(image, snippetX, snippetY, snippetWidth+boundsDimensionDiff, snippetHeight-boundsDimensionDiff, bounds.left+boundsDimensionDiff/2, bounds.top-boundsDimensionDiff/2, boundsHeight, boundsWidth)
	}
	else {
		context.drawImage(image, snippetX, snippetY, snippetWidth, snippetHeight, bounds.left, bounds.top, boundsWidth, boundsHeight)
	}*/

	const alpha = self.opacity !== undefined? self.opacity : 1.0
	context.globalAlpha = alpha
	//print(self.opacity)

	if (self.turns % 2 !== 0) {
		context.drawImage(image, cutLeft*flipWidthRatio, cutTop*flipHeightRatio, image.width - cutLeft*flipWidthRatio - cutRight*flipWidthRatio, image.height - cutTop*flipHeightRatio - cutBottom*flipHeightRatio, bounds.left + boundsDimensionDiff/2, bounds.top - boundsDimensionDiff/2, boundsHeight, boundsWidth)
	}
	else {
		context.drawImage(image, snippetX, snippetY, snippetWidth, snippetHeight, bounds.left, bounds.top, boundsWidth, boundsHeight)
	}

	//context.drawImage(image, snippetX, snippetY, snippetWidth, snippetHeight, bounds.left, bounds.top, boundsWidth, boundsHeight)
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
	return moverUpdate(self, world)
}

const getOppositeSideName = (side) => {
	if (side === "top") return "bottom"
	if (side === "bottom") return "top"
	if (side === "left") return "right"
	if (side === "right") return "left"
}

//==========//
// Grabbers //
//==========//
const GRAB_DRAG = (self) => {
	if (self.portals !== undefined) {
		if (self.portals.top !== undefined) return undefined
		if (self.portals.bottom !== undefined) return undefined
		if (self.portals.left !== undefined) return undefined
		if (self.portals.right !== undefined) return undefined
	}
	if (self.isPortal) {
		for (const atom of self.world.atoms) {
			if (atom.portals !== undefined) {
				if (atom.portals.top === self) return undefined
				if (atom.portals.bottom === self) return undefined
				if (atom.portals.left === self) return undefined
				if (atom.portals.right === self) return undefined
			}
		}
	}
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
	enter: ({froggy}) => {
		
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

const PORTAL_BOUNCE = {
	enter: (event) => {
		
		const realWorld = event.world.realWorld
		if (event.world.bounceTimer !== undefined) {
			event.froggy.nextdy *= -0.9
			//event.world.bounceTimer = undefined
			return
		}

		if (event.world.isCrashTest) {
			if (event.froggy.id === event.world.crashNeededFroggy) {
				event.world.crashSuccess = true
				return "CRASH"
			}
		}

		//print(event.world.id)
		if (event.world.isProjection && event.world.isOnCatchup !== true) {
			//print("proj")
		}
		else {
			//print("bye")
			PORTAL_VOID.enter(event) 
			return
		}

		if (realWorld.isProjection) {
			PORTAL_VOID.enter(event) 
			return
		}

		const crashTestRealWorld = cloneWorld(event.world)
		const crashTestWorld = cloneWorld(realWorld)
		crashTestWorld.realWorld = crashTestRealWorld
		crashTestWorld.future_projection_skip = 30

		crashTestRealWorld.isCrashTest = true
		crashTestWorld.isCrashTest = true

		const crash_froggy = crashTestRealWorld.atoms.find(a => a.id === event.froggy.id)
		const crash_portal = crashTestWorld.atoms.find(a => a.id === event.portal.id)
		const crash_target = crash_portal.target
		
		crashTestRealWorld.crashNeededFroggy = event.froggy.id
		crashTestWorld.crashNeededFroggy = event.froggy.id

		PORTAL_MOVE.enter({portal:crash_portal, froggy: crash_froggy, axis: event.axis}, {target: crash_target})
		for (let i = 0; i < 31; i++) {
			fullUpdateWorld(crashTestRealWorld)
			fullUpdateWorld(crashTestWorld)
		}

		if (!crashTestWorld.crashSuccess) {
			print("PARADOX")
			realWorld.bounceTimer = 30
			//realWorld.future_projection_skip = 30
			//saveFutureProjection(realWorld)
			return
		}


		//realWorld.futureProjection = undefined
		//saveFutureProjection(realWorld)
		const clone_world = cloneWorld(realWorld)
		clone_world.future_projection_skip = 30

		addWorld(multiverse, clone_world)

		const clone_portal = clone_world.atoms.find(a => a.id === event.portal.id)
		const clone_target = clone_portal.target
		PORTAL_MOVE.enter(event, {target: clone_target})
		print("nowline from", clone_portal, "to", clone_target)

		replaceWorld(realWorld, clone_world)
		realWorld.pruneTimer = 30

		return

	}
}

const PORTAL_FADE = {
	enter: (event) => {
		
		//print(event.world.id)
		if (event.world.isProjection && event.world.isOnCatchup !== true) {
			//print("proj")
		}
		else {
			//print("bye")
			PORTAL_VOID.enter(event) 
			return
		}

		const realWorld = event.world.realWorld
		if (realWorld.isProjection) {
			PORTAL_VOID.enter(event) 
			return
		}

		//realWorld.futureProjection = undefined
		//saveFutureProjection(realWorld)
		const clone_world = cloneWorld(realWorld)
		//clone_world.futureProjection = undefined
		clone_world.future_projection_skip = 30
		//clone_world.projection_skip = 1
		//clone_world.isProjection = false

		addWorld(multiverse, clone_world)

		const clone_portal = clone_world.atoms.find(a => a.id === event.portal.id)
		const clone_target = clone_portal.target
		const variant = PORTAL_MOVE.enter(event, {target: clone_target})
		const clone_froggy = clone_world.atoms.find(a => a.id === event.froggy.id)
		print("nowline from", clone_portal, "to", clone_target)

		replaceWorld(realWorld, clone_world)
		realWorld.pruneTimer = 30

		variant.fadeReliantOn = clone_froggy
		//variant.fadeReliantOn = clone_froggy
		//clone_froggy.fadeReliantOn = variant
		clone_world.fadeReliance = 30

		return

	}
}

const PORTAL_FREEZE = {
	enter: (event) => {
		
		//print(event.world.id)
		if (event.world.isProjection && event.world.isOnCatchup !== true) {
			//print("proj")
		}
		else {
			//print("bye")
			PORTAL_VOID.enter(event)
			//event.froggy.fadeReliantOn = undefined
			if (event.froggy.fadeRelier !== undefined) event.froggy.fadeRelier.d.fadeReliantOn = undefined
			event.world.fadeReliance = undefined
			return
		}

		const realWorld = event.world.realWorld
		if (realWorld.isProjection) {
			PORTAL_VOID.enter(event) 
			return
		}

		//realWorld.futureProjection = undefined
		//saveFutureProjection(realWorld)
		const clone_world = cloneWorld(realWorld)
		//clone_world.futureProjection = undefined
		clone_world.future_projection_skip = 30
		//clone_world.projection_skip = 1
		//clone_world.isProjection = false

		addWorld(multiverse, clone_world)

		const clone_portal = clone_world.atoms.find(a => a.id === event.portal.id)
		const clone_target = clone_portal.target
		const variant = PORTAL_MOVE.enter(event, {target: clone_target})
		const clone_froggy = clone_world.atoms.find(a => a.id === event.froggy.id)
		print("nowline from", clone_portal, "to", clone_target)

		replaceWorld(realWorld, clone_world)
		realWorld.pruneTimer = 30

		variant.fadeReliantOn = clone_froggy
		clone_froggy.fadeRelier = variant
		variant.isFreezeFadeType = true
		//variant.fadeReliantOn = clone_froggy
		//clone_froggy.fadeReliantOn = variant
		clone_world.fadeReliance = 30

		return

	}
}

const PORTAL_MAD = {
	enter: (event) => {
		
		//print(event.world.id)
		if (event.world.isProjection && event.world.isOnCatchup !== true) {
			//print("proj")
		}
		else {
			//print("bye")
			PORTAL_VOID.enter(event)
			//event.froggy.fadeReliantOn = undefined
			if (event.froggy.fadeRelier !== undefined) event.froggy.fadeRelier.d.fadeReliantOn = undefined
			event.world.fadeReliance = undefined
			return
		}

		const realWorld = event.world.realWorld
		if (realWorld.isProjection) {
			PORTAL_VOID.enter(event) 
			return
		}

		//realWorld.futureProjection = undefined
		//saveFutureProjection(realWorld)
		const clone_world = cloneWorld(realWorld)
		//clone_world.futureProjection = undefined
		clone_world.future_projection_skip = 30
		//clone_world.projection_skip = 1
		//clone_world.isProjection = false

		addWorld(multiverse, clone_world)

		const clone_portal = clone_world.atoms.find(a => a.id === event.portal.id)
		const clone_target = clone_portal.target
		const variant = PORTAL_MOVE.enter(event, {target: clone_target})
		const clone_froggy = clone_world.atoms.find(a => a.id === event.froggy.id)
		print("nowline from", clone_portal, "to", clone_target)

		replaceWorld(realWorld, clone_world)
		realWorld.pruneTimer = 30

		variant.fadeReliantOn = clone_froggy
		clone_froggy.fadeRelier = variant
		variant.isMadFadeType = true
		//variant.fadeReliantOn = clone_froggy
		//clone_froggy.fadeReliantOn = variant
		clone_world.fadeReliance = 30

		return

	}
}

const PORTAL_PASTNOW = {
	enter: (event) => {
		
		//print(event.world.id)
		if (event.world.isProjection && event.world.isOnCatchup !== true) {
			//print("proj")
		}
		else {
			//print("bye")
			PORTAL_VOID.enter(event) 
			return
		}

		const realWorld = event.world.realWorld
		if (realWorld.isProjection) {
			PORTAL_VOID.enter(event) 
			return
		}

		//realWorld.futureProjection = undefined
		//saveFutureProjection(realWorld)
		const clone_world = cloneWorld(realWorld)
		//clone_world.futureProjection = undefined
		clone_world.future_projection_skip = 30
		//clone_world.projection_skip = 1
		//clone_world.isProjection = false

		addWorld(multiverse, clone_world)

		const clone_portal = clone_world.atoms.find(a => a.id === event.portal.id)
		const clone_target = clone_portal.target
		PORTAL_MOVE.enter(event, {target: clone_target})
		print("nowline from", clone_portal, "to", clone_target)

		replaceWorld(realWorld, clone_world)
		realWorld.pruneTimer = 30

		return

	}
}

const PORTAL_PASTNOWLINE = {
	enter: (event) => {
		
		//print(event.world.id)
		if (event.world.isProjection && event.world.isOnCatchup !== true) {
			//print("proj")
		}
		else {
			//print("bye")
			PORTAL_VOID.enter(event) 
			return
		}

		const realWorld = event.world.realWorld
		if (realWorld.isProjection) {
			"hi".d
			PORTAL_VOID.enter(event) 
			return
		}

		//realWorld.futureProjection = undefined
		//saveFutureProjection(realWorld)
		const clone_world = cloneWorld(realWorld)
		//clone_world.futureProjection = undefined
		clone_world.future_projection_skip = 30
		//clone_world.projection_skip = 1
		//clone_world.isProjection = false

		addWorld(multiverse, clone_world)

		const clone_portal = clone_world.atoms.find(a => a.id === event.portal.id)
		const clone_target = clone_portal.target
		PORTAL_MOVE.enter(event, {target: clone_target})
		print("nowline from", clone_portal, "to", clone_target)

		return

	}
}

const PORTAL_FUTURENOW = {
	enter: (event) => {

		if (event.world.isProjection) {
			PORTAL_VOID.enter(event) 
			return
		}

		const projection = event.world.futureProjection

		if (projection === undefined) {
			PORTAL_VOID.enter(event) 
			return
		}

		const clone_world = projection
		projection.isProjection = false
		projection.futureProjection = undefined
		event.world.futureProjection = undefined
		saveFutureProjection(event.world)
		//savePastProjection(clone_world)
		/*clone_world.projection_skip = 1*/
		
		const clone_portal = clone_world.atoms.find(a => a.atom_id === event.portal.atom_id)
		const clone_target = clone_portal.target

		print(event.world.isProjection, event.world.id)
		addWorld(multiverse, clone_world)
		clone_world.futureNowRecordings = []
		clone_world.futureNowBaseWorld = event.world
		
		PORTAL_MOVE.enter(event, {target: clone_target})
		
		const clone_froggy = clone_world.atoms.find(a => a.atom_id === event.froggy.atom_id).d

		saveFutureProjection(projection)
		//event.world.futureProjection = undefined
		//saveFutureProjection(event.world)
		//if (clone_froggy != undefined) clone_froggy.variantParent = event.froggy
		//else print(clone_froggy)
		
		//clone_froggy.variantParent = event.froggy

		//if (clone_froggy === undefined) return true
		//else {
			//clone_froggy.variantParent = event.froggy
		//}

		//clone_froggy.hh
		//replaceWorld(clone_world, event.world)

		return
	}
}

const PORTAL_FUTURELINE = {
	enter: (event) => {

		if (event.world.isProjection) {
			PORTAL_VOID.enter(event) 
			return
		}

		const projection = event.world.futureProjection

		if (projection === undefined) {
			PORTAL_VOID.enter(event) 
			return
		}

		const clone_world = projection
		projection.isProjection = false
		projection.futureProjection = undefined
		event.world.futureProjection = undefined
		saveFutureProjection(event.world)
		//savePastProjection(clone_world)
		/*clone_world.projection_skip = 1*/
		
		const clone_portal = clone_world.atoms.find(a => a.atom_id === event.portal.atom_id)
		const clone_target = clone_portal.target

		print(event.world.isProjection, event.world.id)
		addWorld(multiverse, clone_world)
		
		PORTAL_MOVE.enter(event, {target: clone_target})
		
		const clone_froggy = clone_world.atoms.find(a => a.atom_id === event.froggy.atom_id).d

		saveFutureProjection(projection)
		//event.world.futureProjection = undefined
		//saveFutureProjection(event.world)
		//if (clone_froggy != undefined) clone_froggy.variantParent = event.froggy
		//else print(clone_froggy)
		
		//clone_froggy.variantParent = event.froggy

		//if (clone_froggy === undefined) return true
		//else {
			//clone_froggy.variantParent = event.froggy
		//}

		//clone_froggy.hh

		return
	}
}
const PORTAL_NEXUS = {
	enter: (event) => {
		
		const realWorld = event.world.realWorld
		if (event.world.bounceTimer !== undefined) {
			//event.froggy.nextdy *= -0.9
			//event.world.bounceTimer = undefined
			//return
			print("nexus")
			
			return PORTAL_PASTLINE.enter(event)
		}

		if (event.world.isCrashTest) {
			if (event.froggy.id === event.world.crashNeededFroggy) {
				event.world.crashSuccess = true
				return "CRASH"
			}
		}

		//print(event.world.id)
		if (event.world.isProjection && event.world.isOnCatchup !== true) {
			//print("proj")
		}
		else {
			//print("bye")
			PORTAL_VOID.enter(event) 
			return
		}

		if (realWorld.isProjection) {
			PORTAL_VOID.enter(event) 
			return
		}

		const crashTestRealWorld = cloneWorld(event.world)
		const crashTestWorld = cloneWorld(realWorld)
		crashTestWorld.realWorld = crashTestRealWorld
		crashTestWorld.future_projection_skip = 30

		crashTestRealWorld.isCrashTest = true
		crashTestWorld.isCrashTest = true

		const crash_froggy = crashTestRealWorld.atoms.find(a => a.id === event.froggy.id)
		const crash_portal = crashTestWorld.atoms.find(a => a.id === event.portal.id)
		const crash_target = crash_portal.target
		
		crashTestRealWorld.crashNeededFroggy = event.froggy.id
		crashTestWorld.crashNeededFroggy = event.froggy.id

		PORTAL_MOVE.enter({portal:crash_portal, froggy: crash_froggy, axis: event.axis}, {target: crash_target})
		for (let i = 0; i < 31; i++) {
			fullUpdateWorld(crashTestRealWorld)
			fullUpdateWorld(crashTestWorld)
		}

		if (!crashTestWorld.crashSuccess) {
			print("PARADOX")
			realWorld.bounceTimer = 30
			//realWorld.future_projection_skip = 30
			//saveFutureProjection(realWorld)
			return PORTAL_VOID.enter(event)
		}


		//realWorld.futureProjection = undefined
		//saveFutureProjection(realWorld)
		const clone_world = cloneWorld(realWorld)
		clone_world.future_projection_skip = 30

		addWorld(multiverse, clone_world)

		const clone_portal = clone_world.atoms.find(a => a.id === event.portal.id)
		const clone_target = clone_portal.target
		PORTAL_MOVE.enter(event, {target: clone_target})
		print("nowline from", clone_portal, "to", clone_target)

		realWorld.isHidden = true
		replaceWorld(realWorld, clone_world)
		realWorld.pruneTimer = 31

		return

	},
	exit: (event) => {
		const froggy = event.froggy
		froggy.cutTop = 0
		froggy.cutLeft = 0
		froggy.cutRight = 0
		froggy.cutBottom = 0
	}
}

const PORTAL_PASTLINE = {
	enter: (event) => {
		
		// UNCOMMENT WHEN NOT DOING NEXUS
		if (event.world.bounceTimer !== undefined) {
			return PORTAL_VOID.enter(event) 
		}

		const projection = event.world.pastProjections[30]

		
		if (projection === undefined) {
			PORTAL_VOID.enter(event) 
			return
		}

		//print(projection.id)

		const clone_world = cloneWorld(projection)
		savePastProjection(clone_world)
		clone_world.projection_skip = 1
		
		const clone_portal = clone_world.atoms[event.portal.atom_id]
		const clone_target = clone_portal.target
		const clone_froggy = clone_world.atoms[event.froggy.atom_id]

		if (!event.world.isProjection) {
			addWorld(multiverse, clone_world)
		}
		PORTAL_MOVE.enter(event, {target: clone_target})

		clone_froggy.variantParent = event.froggy
		clone_world.bounceTimer = 31

		//clone_froggy.d
		//event.froggy.links[0].atom.d

		//removeAtom(event.world, variant, {includingChildren: false, destroy: false})
		//addAtom(clone_world, variant, {ignoreLinks: false})

		//variant.portals[event.axis.back] = clone_target

		/*clone_variant.parent = froggy
		for (const link of froggy.links) {
			if (link.atom === variant) {
				link.atom = clone_variant
			}
		}*/
		
		//removeAtom(event.world, variant, {includingChildren: false})
		//removeAtom(clone_world, clone_froggy)

		

		//moveAtomWorld(clone_variant, event.world, clone_world)



		return
	}
}

const PORTAL_REFROG = {
	enter: (event) => {
		const variant = PORTAL_MOVE.enter(event)
		if (variant !== undefined) {
			variant.refrogTrackPlay = true
		}
	}
}

const PORTAL_INVERT = {
	enter: (event) => {
		
		/*if (event.world.bounceTimer !== undefined) {
			return PORTAL_VOID.enter(event) 
		}*/

		const projection = event.world

		
		if (projection === undefined) {
			PORTAL_VOID.enter(event) 
			return
		}

		//print(projection.id)

		const clone_world = cloneWorld(projection)
		savePastProjection(clone_world)
		//clone_world.projection_skip = 1
		
		const clone_portal = clone_world.atoms[event.portal.atom_id]
		const clone_target = clone_portal.target
		const clone_froggy = clone_world.atoms[event.froggy.atom_id]

		if (!event.world.isProjection) {
			addWorld(multiverse, clone_world)
		}

		clone_world.rewindAutoPlay = event.world.pastProjections.map(w => cloneWorld(w))
		//replaceWorld(clone_world, event.world)
		//event.world.isHidden = true
		//event.world.pruneTimer = 200
		//PORTAL_MOVE.enter(event, {target: clone_target})

		//clone_froggy.variantParent = event.froggy
		//clone_world.bounceTimer = 31

		//clone_froggy.d
		//event.froggy.links[0].atom.d

		//removeAtom(event.world, variant, {includingChildren: false, destroy: false})
		//addAtom(clone_world, variant, {ignoreLinks: false})

		//variant.portals[event.axis.back] = clone_target

		/*clone_variant.parent = froggy
		for (const link of froggy.links) {
			if (link.atom === variant) {
				link.atom = clone_variant
			}
		}*/
		
		//removeAtom(event.world, variant, {includingChildren: false})
		//removeAtom(clone_world, clone_froggy)

		

		//moveAtomWorld(clone_variant, event.world, clone_world)

		const variant = PORTAL_MOVE.enter(event)
		moveAtomWorld(variant, event.world, clone_world)
		if (clone_world.bonusAtoms === undefined) {
			clone_world.bonusAtoms = []
		}
		clone_world.bonusAtoms.push(variant)


		return
	}
}

const PORTAL_REWIND = {
	enter: (event) => {
		
		/*if (event.world.bounceTimer !== undefined) {
			return PORTAL_VOID.enter(event) 
		}*/

		const projection = event.world

		
		if (projection === undefined) {
			PORTAL_VOID.enter(event) 
			return
		}

		//print(projection.id)

		const clone_world = cloneWorld(projection)
		savePastProjection(clone_world)
		//clone_world.projection_skip = 1
		
		const clone_portal = clone_world.atoms[event.portal.atom_id]
		const clone_target = clone_portal.target
		const clone_froggy = clone_world.atoms[event.froggy.atom_id]

		if (!event.world.isProjection) {
			addWorld(multiverse, clone_world)
		}

		clone_world.rewindAutoPlay = event.world.pastProjections.map(w => cloneWorld(w))

		//PORTAL_MOVE.enter(event, {target: clone_target})

		//clone_froggy.variantParent = event.froggy
		//clone_world.bounceTimer = 31

		//clone_froggy.d
		//event.froggy.links[0].atom.d

		//removeAtom(event.world, variant, {includingChildren: false, destroy: false})
		//addAtom(clone_world, variant, {ignoreLinks: false})

		//variant.portals[event.axis.back] = clone_target

		/*clone_variant.parent = froggy
		for (const link of froggy.links) {
			if (link.atom === variant) {
				link.atom = clone_variant
			}
		}*/
		
		//removeAtom(event.world, variant, {includingChildren: false})
		//removeAtom(clone_world, clone_froggy)

		

		//moveAtomWorld(clone_variant, event.world, clone_world)



		return
	}
}

const PORTAL_REWRITE = {
	enter: (event) => {
		
		if (event.world.bounceTimer !== undefined) {
			return PORTAL_VOID.enter(event) 
		}
		
		const projection = event.world.pastProjections[30]

		if (projection === undefined) {
			PORTAL_VOID.enter(event) 
			return
		}

		//print(projection.id)

		const clone_world = cloneWorld(projection)
		savePastProjection(clone_world)
		clone_world.projection_skip = 1
		
		const clone_portal = clone_world.atoms[event.portal.atom_id]
		const clone_target = clone_portal.target
		const clone_froggy = clone_world.atoms[event.froggy.atom_id]

		if (!event.world.isProjection) {
			addWorld(multiverse, clone_world)
		}
		PORTAL_MOVE.enter(event, {target: clone_target})

		clone_froggy.variantParent = event.froggy
		
		replaceWorld(event.world, clone_world)

		event.world.pruneTimer = 30
		event.world.isHidden = true
		clone_world.bounceTimer = 31

		//clone_froggy.d
		//event.froggy.links[0].atom.d

		//removeAtom(event.world, variant, {includingChildren: false, destroy: false})
		//addAtom(clone_world, variant, {ignoreLinks: false})

		//variant.portals[event.axis.back] = clone_target

		/*clone_variant.parent = froggy
		for (const link of froggy.links) {
			if (link.atom === variant) {
				link.atom = clone_variant
			}
		}*/
		
		//removeAtom(event.world, variant, {includingChildren: false})
		//removeAtom(clone_world, clone_froggy)

		

		//moveAtomWorld(clone_variant, event.world, clone_world)



		return
	}
}

const PORTAL_DIMENSION = {
	enter: (event) => {
		

		
		if (event.world.isProjection) {
			//PORTAL_VOID.enter(event) 
			return
		}


		const clone_world = cloneWorld(event.world)
		addWorld(multiverse, clone_world)
		
		const clone_portal = clone_world.atoms[event.portal.atom_id]
		const clone_target = clone_portal.target

		const variant = PORTAL_MOVE.enter(event, {target: clone_target})
		const clone_froggy = clone_world.atoms[event.froggy.atom_id]
		const clone_variant = clone_world.atoms[variant.atom_id]
		const froggy = event.froggy

		/*clone_variant.parent = froggy
		for (const link of froggy.links) {
			if (link.atom === variant) {
				link.atom = clone_variant
			}
		}*/
		
		//removeAtom(event.world, variant, {includingChildren: false})
		removeAtom(clone_world, clone_froggy, {includingChildren: false})



		return
	}
}

const PORTAL_MOVE = {
	enter: ({portal, pbounds, froggy, world, axis, blockers}, {target = portal.target} = {}) => {
		if (target !== undefined) {

			// UNCOMMENT FOR SOME THINGS!?!?!
			/*if (world !== undefined && world.isProjection) {
				return
			}*/

			const variant = cloneAtom(froggy)
			variant.fling = target.turns - portal.turns
			while (variant.fling < 0) {
				variant.fling += 4
			}
			//if (variant.fling === 3) variant.fling = 1
			
			const size = (variant.turns % 2 === 0)? variant[axis.sizeName] : variant[axis.otherSizeName]
			variant[axis.cutBackName] = size
			variant[axis.cutFrontName] = 0

			variant.links = []
			if (froggy !== undefined && froggy.world !== undefined) {
				variant.update = froggy.world.atoms.includes(froggy)? UPDATE_NONE : froggy.update
			}

			//variant.portals.d
			//froggy.portals.d

			let displacementOther = 0
			let displacement = 0

			if (variant.fling === 0) {
				
				variant.portals[axis.front] = undefined
				variant.portals[axis.back] = target
				displacement = target[axis.name] - portal[axis.name]
				displacement += target[axis.sizeName] * axis.direction // Go to other side of portal
				
				displacementOther = target[axis.other.name] - portal[axis.other.name]
				
				
				variant.onPromote = (self) => {
					self.update = froggy.update
					self.skipUpdate = true
					self.fling = undefined
				}

				const link = linkAtom(froggy, variant, {
					[axis.other.name]: v => v + displacementOther,
					[axis.name]: v => v + displacement,
					["turns"]: (them, me) => me,
					["width"]: (them, me) => me,
					
					
					["nextdx"]: () => froggy.dx,
					["nextdy"]: () => froggy.dy,
					
					["dx"]: () => froggy.dx,
					["dy"]: () => froggy.dy,

					["height"]: (them, me) => me,
					["flipX"]: (them, me) => me,
				})
			}
			else if (variant.fling === 1) {

				variant.portals[axis.flingFrontName] = undefined
				variant.portals[axis.flingBackName] = target

				const variantStartingPlaceOther = target[axis.other.name]
				const froggyStartingPlaceOther = portal[axis.name] - froggy[axis.sizeName]

				const variantStartingPlace = target[axis.name] + (froggy[axis.other.name] - portal[axis.other.name])
				const froggyStartingPlace = froggy[axis.other.name]

				variant.onPromote = (self) => {
					self.update = froggy.update
					self.skipUpdate = true
					self.fling = undefined
				}

				const flipXDirection = froggy.flipX? -1 : 1
				const link = linkAtom(froggy, variant, {
					[axis.other.name]: () => variantStartingPlaceOther - (froggy[axis.name] - froggyStartingPlaceOther) - 1, //TODO: remove need for minus one
					[axis.name]: () => variantStartingPlace + (froggy[axis.other.name] - froggyStartingPlace),
					["turns"]: (them, me) => me,
					["width"]: (them, me) => me,
					["height"]: (them, me) => me,
					
					["nextdx"]: () => -froggy.dy,
					["nextdy"]: () => froggy.dx,
					
					["dx"]: () => -froggy.dy,
					["dy"]: () => froggy.dx,
					["flipX"]: (them, me) => me,
				})
			}
			else if (variant.fling === 2) {
				throw new Error(`[TimePond] Unimplemented fling type ${variant.fling}`)
			}
			else if (variant.fling === 3) {
				throw new Error(`[TimePond] Unimplemented fling type ${variant.fling}`)
			}
			else {
				throw new Error(`[TimePond] Invalid fling type ${variant.fling}... Please tell @todepond`)
			}
			
			const flipXDirection = froggy.flipX? -1 : 1
			updateAtomLinks(froggy)
			variant.turns = froggy.turns //band-aid because makeAtom doesn't do turns properly
			

			addAtom(target.world, variant)
			turnAtom(variant, variant.fling * flipXDirection, false, false, target.world, [], true)
			//if (variant.turns % 4 === 1) flipAtom(variant)
			
			//variant.prevBounds = getBounds(variant)

			return variant
		}
	},
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

const COLLIDED_PORTAL = ({self, bself, atom, axis, baxis, world, bounds, nbounds, abounds, iveHitSomething}) => {
	
	// Only allow going through this portal in the correct axis
	const portalIsHoriz = atom.turns % 2 === 0
	const movementIsVert = axis.dname === "dy"
	if (portalIsHoriz !== movementIsVert) {
		return true
	}

	//==================================================//
	// BUMP edges of portal if I'm NOT going through it //
	//==================================================//
	/*if (bself.portals[axis.front] !== atom) {

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
	}*/

	// Otherwise, go through...

	const portalIsNew = bself.portals[axis.front] === undefined

	let induceError = false

	// BEGIN to cut myself down to go into portal
	if (portalIsNew) {

		if (iveHitSomething) return true
		//const amountInPortal = axis.direction * (nbounds[axis.front] - abounds[axis.back])
		//bself[axis.cutFrontName] += amountInPortal
		//const remainingSize = baxis.size - bself[axis.cutBackName]
		/*if (bself[axis.cutFrontName] >= remainingSize) {
			removeAtom(world, bself, {includingChildren: false, destroy: true})
		}*/

		if (bself[axis.cutFrontName] < 0) {
			bself[axis.cutFrontName] = 0
			return false
		}

		// Register (or re-register) that I am currently using this portal
		bself.portals[axis.front] = atom
		
		if (atom.portal.enter !== undefined) {
			const result = atom.portal.enter({pbounds: abounds, fnbounds: nbounds, portal: atom, froggy: bself, world, axis})
			if (result === true) induceError = true
		}
		

	}

	// CONTINUE to cut myself down to go into portal
	else {
		
		const amountInPortal = axis.direction * (nbounds[axis.front] - abounds[axis.back])
		bself[axis.cutFrontName] += amountInPortal
		const remainingSize = baxis.size/* - bself[axis.cutBackName]*/
		if (bself[axis.cutFrontName] >= remainingSize) {
			removeAtom(world, bself, {includingChildren: false, destroy: true})
		}

		if (bself[axis.cutFrontName] < 0) {
			bself[axis.cutFrontName] = 0
			return false
		}
		
	}
	//bself.portals.d
	
	if (atom.portal.move !== undefined) atom.portal.move()
	if (atom.portal.moveIn !== undefined) atom.portal.moveIn()

	if (bself.portals[axis.front] !== atom) {
		return true
		//throw new Error(`[TimePond] An atom tried to go through two portals in the same direction.`)
	}

	if (induceError) return "induce"
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

const ELEMENT_LEAF = {
	colour: Colour.Green,
	draw: DRAW_RECTANGLE,
	update: UPDATE_MOVER,
	grab: GRAB_DRAG,
	isMover: true,
	width: 20,
	height: 10,
	maxSpeed: 2,
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
	colour: INVERT? Colour.Black : Colour.Black,
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
	isPortalActive: true,
	preCollided: COLLIDED_PORTAL,
	autoLinks: [
		/*{
			element: {...ELEMENT_PLATFORM, grab: GRAB_LINKEE, colour: Colour.Black},
			offset: {width: (w) => w, y: (y) => y-2, x: (x) => x, height: () => 2,},
		},*/
		{
			element: {...ELEMENT_PLATFORM, grab: GRAB_LINKEE, colour: INVERT? Colour.White : Colour.Black, foo: "hi"},
			offset: {width: () => 2, x: (x) => x-2},
		},
		{
			element: {...ELEMENT_PLATFORM, grab: GRAB_LINKEE, colour: INVERT? Colour.White : Colour.Black, foo: "hi"},
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
}

const ELEMENT_PORTAL_VOID = {
	...ELEMENT_PORTAL,
	portal: PORTAL_VOID,
	colour: Colour.White,
}

const makePortalTargeter = () => {
	let lonelyPortal = undefined
	return (portal) => {
		if (portal.isMenuItem) return
		if (lonelyPortal === undefined) {
			lonelyPortal = portal
			return
		}

		lonelyPortal.target = portal
		portal.target = lonelyPortal
		lonelyPortal = undefined
	}
}
const ELEMENT_PORTAL_MOVE = {
	...ELEMENT_PORTAL,
	portal: PORTAL_MOVE,
	colour: Colour.Orange,
	construct: makePortalTargeter(),
}

const ELEMENT_PORTAL_DIMENSION = {
	...ELEMENT_PORTAL,
	portal: PORTAL_DIMENSION,
	colour: Colour.Blue,
	construct: makePortalTargeter(),
}

const ELEMENT_PORTAL_REWRITE = {
	...ELEMENT_PORTAL,
	portal: PORTAL_REWRITE,
	colour: Colour.Yellow,
	construct: makePortalTargeter(),
}

const ELEMENT_PORTAL_PASTLINE = {
	...ELEMENT_PORTAL,
	portal: PORTAL_PASTLINE,
	colour: Colour.Yellow,
	construct: makePortalTargeter(),
}

const ELEMENT_PORTAL_REWIND = {
	...ELEMENT_PORTAL,
	portal: PORTAL_REWIND,
	colour: Colour.Yellow,
	construct: makePortalTargeter(),
}


const ELEMENT_PORTAL_NEXUS = {
	...ELEMENT_PORTAL,
	portal: PORTAL_NEXUS,
	colour: Colour.Yellow,
	construct: makePortalTargeter(),
	requiresFutureProjections: true,
}

const ELEMENT_PORTAL_FUTURELINE = {
	...ELEMENT_PORTAL,
	portal: PORTAL_FUTURELINE,
	colour: Colour.Red,
	construct: makePortalTargeter(),
	requiresFutureProjections: true,
}

const ELEMENT_PORTAL_PASTNOWLINE = {
	...ELEMENT_PORTAL,
	portal: PORTAL_PASTNOWLINE,
	colour: Colour.Purple,
	construct: makePortalTargeter(),
	requiresFutureProjections: true,
}

const ELEMENT_PORTAL_PASTNOW = {
	...ELEMENT_PORTAL,
	portal: PORTAL_PASTNOW,
	colour: Colour.Cyan,
	construct: makePortalTargeter(),
	requiresFutureProjections: true,
}

const ELEMENT_PORTAL_FUTURENOW = {
	...ELEMENT_PORTAL,
	portal: PORTAL_FUTURENOW,
	colour: Colour.Red,
	construct: makePortalTargeter(),
	requiresFutureProjections: true,
}

const ELEMENT_PORTAL_BOUNCE = {
	...ELEMENT_PORTAL,
	portal: PORTAL_BOUNCE,
	colour: Colour.Cyan,
	construct: makePortalTargeter(),
	requiresFutureProjections: true,
}

const ELEMENT_PORTAL_INVERT = {
	...ELEMENT_PORTAL,
	portal: PORTAL_INVERT,
	colour: Colour.Black,
	construct: makePortalTargeter(),
	requiresFutureProjections: true,
	futureProjLength: 30,
	requiresRefrogTracking: true,
}


const ELEMENT_PORTAL_FADE = {
	...ELEMENT_PORTAL,
	portal: PORTAL_FADE,
	colour: Colour.Cyan,
	construct: makePortalTargeter(),
	requiresFutureProjections: true,
}


const ELEMENT_PORTAL_FREEZE = {
	...ELEMENT_PORTAL,
	portal: PORTAL_FREEZE,
	colour: Colour.Cyan,
	construct: makePortalTargeter(),
	requiresFutureProjections: true,
}

const ELEMENT_PORTAL_MAD = {
	...ELEMENT_PORTAL,
	portal: PORTAL_MAD,
	colour: Colour.Cyan,
	construct: makePortalTargeter(),
	requiresFutureProjections: true,
}

const ELEMENT_PORTAL_REFROG = {
	...ELEMENT_PORTAL,
	portal: PORTAL_REFROG,
	colour: Colour.Black,
	construct: makePortalTargeter(),
	//requiresFutureProjections: true,
	requiresRefrogTracking: true,
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
	//cutTop: 10,
	//cutBottom: 10,
	//cutRight: 20,
	//cutLeft: 20,
	showBounds: FROGGY_BOUNDS,
}

const ELEMENT_FROG_YELLOW = {
	//filter: "invert(58%) sepia(77%) saturate(5933%) hue-rotate(336deg) brightness(110%) contrast(108%)",
	draw: DRAW_IMAGE,
	update: UPDATE_MOVER_BEING,
	grab: GRAB_DRAG,
	source: "images/Yellow/Other@0.25x.png",
	width: 354/6/* - 11 - 7*/,
	height: 254/6,
	isMover: true,
	//cutTop: 10,
	//cutBottom: 10,
	//cutRight: 20,
	//cutLeft: 20,
	showBounds: FROGGY_BOUNDS,
}

const ELEMENT_FROG_CYAN = {
	//filter: "invert(58%) sepia(77%) saturate(5933%) hue-rotate(336deg) brightness(110%) contrast(108%)",
	draw: DRAW_IMAGE,
	update: UPDATE_MOVER_BEING,
	grab: GRAB_DRAG,
	source: "images/Cyan/Other@0.25x.png",
	width: 354/6/* - 11 - 7*/,
	height: 254/6,
	isMover: true,
	//cutTop: 10,
	//cutBottom: 10,
	//cutRight: 20,
	//cutLeft: 20,
	showBounds: FROGGY_BOUNDS,
}

const ELEMENT_FROG_CYAN_MAD = {
	//filter: "invert(58%) sepia(77%) saturate(5933%) hue-rotate(336deg) brightness(110%) contrast(108%)",
	draw: DRAW_IMAGE,
	update: UPDATE_MOVER_BEING,
	grab: GRAB_DRAG,
	source: "images/Cyan/Mad@0.25x.png",
	width: 100 * 0.75/* - 11 - 7*/,
	height: 84 * 0.75,
	isMover: true,
	//cutTop: 10,
	//cutBottom: 10,
	//cutRight: 20,
	//cutLeft: 20,
	showBounds: FROGGY_BOUNDS,
}

const ELEMENT_FROG_PURPLE = {
	//filter: "invert(58%) sepia(77%) saturate(5933%) hue-rotate(336deg) brightness(110%) contrast(108%)",
	draw: DRAW_IMAGE,
	update: UPDATE_MOVER_BEING,
	grab: GRAB_DRAG,
	source: "images/Purple/Other@0.25x.png",
	width: 354/6/* - 11 - 7*/,
	height: 254/6,
	isMover: true,
	//cutTop: 10,
	//cutBottom: 10,
	//cutRight: 20,
	//cutLeft: 20,
	showBounds: FROGGY_BOUNDS,
}

const ELEMENT_FROG_GREEN = {
	//filter: "invert(58%) sepia(77%) saturate(5933%) hue-rotate(336deg) brightness(110%) contrast(108%)",
	draw: DRAW_IMAGE,
	update: UPDATE_MOVER_BEING,
	grab: GRAB_DRAG,
	source: "images/Green/Other@0.25x.png",
	width: 354/6/* - 11 - 7*/,
	height: 254/6,
	isMover: true,
	//cutTop: 10,
	//cutBottom: 10,
	//cutRight: 20,
	//cutLeft: 20,
	showBounds: FROGGY_BOUNDS,
}

const ELEMENT_FROG_BLACK = {
	//filter: "invert(58%) sepia(77%) saturate(5933%) hue-rotate(336deg) brightness(110%) contrast(108%)",
	draw: DRAW_IMAGE,
	update: UPDATE_MOVER_BEING,
	grab: GRAB_DRAG,
	source: "images/Black/Other@0.25x.png",
	width: 354/6/* - 11 - 7*/,
	height: 254/6,
	isMover: true,
	//cutTop: 10,
	//cutBottom: 10,
	//cutRight: 20,
	//cutLeft: 20,
	showBounds: FROGGY_BOUNDS,
}

const ELEMENT_BOX_DOUBLE = {
	...ELEMENT_BOX,
	update: UPDATE_MOVER,
	isMover: false,
	autoLinks: [
		//...ELEMENT_aaBOX.autoLinks,
		{
			element: {...ELEMENT_BOX, update: UPDATE_STATIC, grab: GRAB_LINKEE, onPromote: (self) => {
				self.update = UPDATE_MOVER
				self.grab = GRAB_DRAG
			}},
			offset: {
				x: (v) => v + 50,
			},
		},
		{
			element: {...ELEMENT_BOX, update: UPDATE_STATIC, grab: GRAB_LINKEE, onPromote: (self) => {
				self.update = UPDATE_MOVER
				self.grab = GRAB_DRAG
			}},
			offset: {
				x: (v) => v + 100,
				y: (v) => v + 10,
			},
		},
	]
}