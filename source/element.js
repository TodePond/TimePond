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
	context.save()
	context.filter = self.filter !== undefined? self.filter : ""
	let {x, y, width, height, drawWidth=width, drawHeight=height, drawOffsetX=0, drawOffsetY=0, source, cutTop=0, cutBottom=0, cutLeft=0, cutRight=0} = self
	
	if (self.flipX) {
		context.translate(self.x + self.width/2, self.y + self.height/2)
		context.scale(-1, 1)
		context.translate(-(self.x + self.width/2), -(self.y + self.height/2))
	}
	if (self.turns !== 0) {
		context.translate(self.x + self.width/2, self.y + self.height/2)
		context.rotate(Math.PI/2 * self.turns)
		context.translate(-(self.x + self.width/2), -(self.y + self.height/2))
		if (self.turns % 2 !== 0) {
			;[width, height] = [height, width]
			;[drawWidth, drawHeight] = [drawHeight, drawWidth]
			x -= (width-height)/2
			y -= (height-width)/2
		}
	}
	if (images[source] === undefined) {
		const image = new Image()
		image.src = source
		images[source] = image
	}
	const image = images[source]
	const imageHeightRatio = image.height/drawHeight
	const imageWidthRatio = image.width/drawWidth
	context.drawImage(image, cutLeft*imageWidthRatio, cutTop*imageHeightRatio, image.width-(cutRight+cutLeft)*imageWidthRatio, image.height-(cutBottom+cutTop)*imageHeightRatio, x+drawOffsetX+cutLeft, y+drawOffsetY+cutTop, drawWidth-(cutLeft+cutRight), drawHeight-(cutBottom+cutTop))
	context.restore()
	if (self.showBounds) {
		context.strokeStyle = Colour.White
		const bounds = getBounds(self)
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
	if (self.flipX) {
		self.flipX = self.dx > -0.1
	}
	else {
		self.flipX = self.dx > 0.1
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

const makeBlink = () => ({})
const UPDATE_MOVER = (self, world) => {
	const {x, y, dx, dy, width, height, cutTop=0, cutBottom=0, cutLeft=0, cutRight=0} = self
	
	self.grounded = false

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
			const result = atom.preCollided({self: atom, atom: self, axis, world, bounds, nbounds, abounds: axis.blocker.bounds})
			if (result === false) continue
		}
		
		// SNAP to the surface!
		const newOffset = axis.front === axis.small? -axis.cutSmall : -axis.size + axis.cutBig
		axis.new = bbounds[axis.back] + newOffset
		
		// Change ACCELERATIONS!
		// Moving right or left
		if (axis === axes.dx) {
			atom.nextdx *= 0.5
			atom.nextdx += self.dx/2
			self.nextdx *= -0.5
			self.nextdx += atom.dx/2
			
			if (atom.bounce !== undefined && atom.turns % 2 !== 0) {
				self.nextdx = atom.bounce * -axis.direction/2
			}
		}
		
		// Moving down or up
		else if (axis === axes.dy) {

			// Moving down
			if (axis.direction === 1) {

				self.nextdy = atom.dy
				self.nextdx *= UPDATE_MOVER_FRICTION
				self.grounded = true
				atom.jumpTick = 0

				if (atom.bounce !== undefined && atom.turns % 2 === 0) {
					self.nextdy = -atom.bounce
					self.nextdx *= 1.5
				}
				
			}

			// Moving up
			else {
				self.nextdy = 0
				self.jumpTick = 0
			}
		}


	}

	/*for (const atom of world.atoms) {
		if (atom === self) continue
		const abounds = getBounds(atom)

		//========//
		// PORTAL //
		//========//
		if (atom.isPortal && atom.isPortalActive) {
			if (atom.subjects === undefined) atom.subjects = new Map()

			if (dy > 0) {
				if (bounds.bottom <= abounds.top && nbounds.bottom >= abounds.top) {
					
					// Hit edges!
					if ((self.cutBottom === undefined || self.cutBottom === 0) && aligns([bounds.left, bounds.right], [nbounds.left, nbounds.right], [abounds.right]) || aligns([bounds.left, bounds.right], [nbounds.left, nbounds.right], [abounds.left])) {
						ny = abounds.top - height + cutBottom
						self.nextdy = atom.dy
						self.nextdx *= 0.975
						self.grounded = true
						atom.jumpTick = 0
						nbounds = getBounds({x: nx, y: ny, width, height, cutTop, cutBottom, cutLeft, cutRight})
					}
					// Going through a portal
					else if (aligns([bounds.left, bounds.right], [nbounds.left, nbounds.right], [abounds.left, abounds.right])) {
						
						let blink = self.portals.get(atom)
						if (blink === undefined) {
							blink = makeBlink()
							atom.portal.enter(self, world)
							self.portals.set(atom, blink)
							atom.subjects.set(self, blink)
						}


						// Update my cut
						if (self.cutBottom === undefined) self.cutBottom = 0
						self.cutBottom += nbounds.bottom - abounds.top
						
						atom.portal.moveIn(self, world)

						if (self.cutBottom > height) {
							self.portals.delete(atom)
							atom.subjects.delete(self)
							atom.portal.end(self, world)
						}
						nbounds = getBounds({x: nx, y: ny, width, height, cutTop, cutBottom, cutLeft, cutRight})

					}
				}
				else if (self.portals.has(atom)) {
					atom.portal.moveOut()
					self.cutTop -= (nbounds.top - abounds.bottom)
					if (self.cutTop <= 0) {
						self.cutTop = 0
						self.portals.delete(atom)
						atom.subjects.delete(self)
						atom.portal.leave(self, world)
					}
					nbounds = getBounds({x: nx, y: ny, width, height, cutTop, cutBottom, cutLeft, cutRight})
				}

			}
			
			else if (dy < 0) {
				if (bounds.top >= abounds.bottom && nbounds.top <= abounds.bottom) {
					
					// Hit edges!
					if (aligns([bounds.left, bounds.right], [nbounds.left, nbounds.right], [abounds.left]) || aligns([bounds.left, bounds.right], [nbounds.left, nbounds.right], [abounds.right])) {
						ny = abounds.bottom - cutTop
						self.nextdy = 0
						nbounds = getBounds({x: nx, y: ny, width, height, cutTop, cutBottom, cutLeft, cutRight})
					}

					// Move through portal
					else if (aligns([bounds.left, bounds.right], [nbounds.left, nbounds.right], [abounds.left, abounds.right])) {
						
						let blink = self.portals.get(atom)
						if (blink === undefined) {
							blink = makeBlink()
							atom.portal.enter(self, world)
							self.portals.set(atom, blink)
							atom.subjects.set(self, blink)
						}
						// Update my cut
						if (self.cutTop === undefined) self.cutTop = 0
						self.cutTop += abounds.bottom - nbounds.top
						
						atom.portal.moveIn(self, world)
	
						if (self.cutTop > height) {
							self.portals.delete(atom)
							atom.subjects.delete(self)
							atom.portal.end(self, world)
						}
						nbounds = getBounds({x: nx, y: ny, width, height, cutTop, cutBottom, cutLeft, cutRight})
					}
				
				}
				else if (self.portals.has(atom)) {
					atom.portal.moveOut()
					self.cutBottom -= abounds.top - nbounds.bottom
					if (self.cutBottom <= 0) {
						self.cutBottom = 0
						self.portals.delete(atom)
						atom.subjects.delete(self)
						atom.portal.leave(self, world)
					}
					nbounds = getBounds({x: nx, y: ny, width, height, cutTop, cutBottom, cutLeft, cutRight})
				}
			}

			if (dx > 0) {
				if (bounds.right <= abounds.left && nbounds.right >= abounds.left) {
					if (aligns([bounds.top, bounds.bottom], [nbounds.top, nbounds.bottom], [abounds.top, abounds.bottom])) {
						nx = abounds.left - width
						atom.nextdx *= 0.5
						atom.nextdx += self.dx/2
						self.nextdx *= -0.5
						self.nextdx += atom.dx/2
						nbounds = getBounds({x: nx, y: ny, width, height, cutTop, cutBottom, cutLeft, cutRight})
					}
				}
				else if (bounds.right <= abounds.right && nbounds.right >= abounds.right) {
					if (aligns([bounds.top, bounds.bottom], [nbounds.top, nbounds.bottom], [abounds.top, abounds.bottom])) {
						nx = abounds.right - width
						atom.nextdx *= 0.5
						atom.nextdx += self.dx/2
						self.nextdx *= -0.5
						self.nextdx += atom.dx/2
						nbounds = getBounds({x: nx, y: ny, width, height, cutTop, cutBottom, cutLeft, cutRight})
					}
				}
			}
			else if (dx < 0) {
				if (bounds.left >= abounds.right && nbounds.left <= abounds.right) {
					if (aligns([bounds.top, bounds.bottom], [nbounds.top, nbounds.bottom], [abounds.top, abounds.bottom])) {
						nx = abounds.right
						atom.nextdx *= 0.5
						atom.nextdx += self.dx/2
						self.nextdx *= -0.5
						self.nextdx += atom.dx/2
						nbounds = getBounds({x: nx, y: ny, width, height, cutTop, cutBottom, cutLeft, cutRight})
					}
				}
				else if (bounds.left >= abounds.left && nbounds.left <= abounds.left) {
					if (aligns([bounds.top, bounds.bottom], [nbounds.top, nbounds.bottom], [abounds.top, abounds.bottom])) {
						nx = abounds.left - cutLeft
						atom.nextdx *= 0.5
						atom.nextdx += self.dx/2
						self.nextdx *= -0.5
						self.nextdx += atom.dx/2
						nbounds = getBounds({x: nx, y: ny, width, height, cutTop, cutBottom, cutLeft, cutRight})
					}
				}
			}



			continue
		}

		//==========================//
		// NON-PORTAL COLLISIONS YO //
		//==========================//
		// vert collision
		if (dy >= 0) {
			if (bounds.bottom <= abounds.top && nbounds.bottom >= abounds.top) {
				if (aligns([bounds.left, bounds.right], [nbounds.left, nbounds.right], [abounds.left, abounds.right])) {
					ny = abounds.top - height + cutBottom
					self.nextdy = atom.dy
					if (atom.bounce !== undefined) {
						self.nextdy = -atom.bounce
						self.nextdx *= 1.5
					}
					//self.nextdx += atom.dx * UPDATE_MOVER_FRICTION
					self.nextdx *= UPDATE_MOVER_FRICTION
					self.grounded = true
					atom.jumpTick = 0
					nbounds = getBounds({x: nx, y: ny, width, height, cutTop, cutBottom, cutLeft, cutRight})
				}
			}
		}
		else if (dy < 0) {
			if (bounds.top >= abounds.bottom && nbounds.top <= abounds.bottom) {
				if (aligns([bounds.left, bounds.right], [nbounds.left, nbounds.right], [abounds.left, abounds.right])) {
					ny = abounds.bottom - cutTop
					self.nextdy = 0
					self.jumpTick = 0
					nbounds = getBounds({x: nx, y: ny, width, height, cutTop, cutBottom, cutLeft, cutRight})
				}
			}
		}

		// horiz collision
		if (dx > 0) {
			if (bounds.right <= abounds.left && nbounds.right >= abounds.left) {
				if (aligns([bounds.top, bounds.bottom], [nbounds.top, nbounds.bottom], [abounds.top, abounds.bottom])) {
					nx = abounds.left - width + cutRight
					atom.nextdx *= 0.5
					atom.nextdx += self.dx/2
					self.nextdx *= -0.5
					self.nextdx += atom.dx/2
					nbounds = getBounds({x: nx, y: ny, width, height, cutTop, cutBottom, cutLeft, cutRight})
				}
			}
		}
		else if (dx < 0) {
			if (bounds.left >= abounds.right && nbounds.left <= abounds.right) {
				if (aligns([bounds.top, bounds.bottom], [nbounds.top, nbounds.bottom], [abounds.top, abounds.bottom])) {
					nx = abounds.right - cutLeft
					atom.nextdx *= 0.5
					atom.nextdx += self.dx/2
					self.nextdx *= -0.5
					self.nextdx += atom.dx/2
					nbounds = getBounds({x: nx, y: ny, width, height, cutTop, cutBottom, cutLeft, cutRight})
				}
			}
		}
		

	}*/
	
	self.nextdy += UPDATE_MOVER_GRAVITY
	self.nextdx *= UPDATE_MOVER_AIR_RESISTANCE

	self.x = axes.dx.new
	self.y = axes.dy.new
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
		turnAtom(atom, 1, true, true, world, [self])
		self.used = true
		//atom.nextdx = 0
		atom.nextdy = -5
		atom.jumpTick = 0
		return false
	}
}

const COLLIDED_POTION_ROTATE = ({self, atom, world}) => {
	if (self.used) return
	if (!atom.isVoid && !atom.isPotion) {
		world.atoms = world.atoms.filter(a => a !== self)
		turnAtom(atom, 1, true, true, world, [self])
		self.used = true
		//atom.nextdx = 0
		atom.nextdy = -5
		atom.jumpTick = 0
		return false
	}
}

const COLLIDE_PORTAL_VOID = ({self, atom, axis, world, bounds, nbounds, abounds}) => {
	const reach = [bounds[axis.small], bounds[axis.big]]
	//const nreach
}

//==========//
// Elements //
//==========//
const ELEMENT_FROG = {
	//filter: "invert(58%) sepia(77%) saturate(5933%) hue-rotate(336deg) brightness(110%) contrast(108%)",
	flipX: false,
	draw: DRAW_IMAGE,
	update: UPDATE_MOVER_BEING,
	grab: GRAB_DRAG,
	source: "images/Blank@0.25x.png",
	width: 354/6/* - 11 - 7*/,
	height: 254/6,
	//drawWidth: 354/6, //59
	//drawHeight: 254/6, //42.3333
	//drawOffsetX: -11,
	//drawOffsetY: 0,
	//cutBottom: (254/6)/2,
	//cutLeft: 5,
	//cutTop: 10,
	//showBounds: true,
}

const ELEMENT_BOX = {
	colour: Colour.Orange,
	draw: DRAW_RECTANGLE,
	update: UPDATE_MOVER,
	grab: GRAB_DRAG,
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
	preCollide: COLLIDE_PORTAL_VOID,
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
