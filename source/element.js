//=========//
// Drawers //
//=========//
const DRAW_RECTANGLE = (self, context) => {
	const {x, y, width, height, colour = Colour.Red, cutTop=0, cutBottom=0, cutLeft=0, cutRight=0} = self
	context.fillStyle = colour
	context.fillRect(x+cutLeft, y+cutTop, width-(cutRight+cutLeft), height-(cutBottom+cutTop))
}

const images = {}
const DRAW_IMAGE = (self, context) => {
	context.save()
	context.filter = self.filter !== undefined? self.filter : ""
	if (self.flipX) {
		context.translate(self.x + self.width/2, self.y + self.height/2)
		context.scale(-1, 1)
		context.translate(-(self.x + self.width/2), -(self.y + self.height/2))
	}
	const {x, y, width, height, drawWidth=width, drawHeight=height, drawOffsetX=0, drawOffsetY=0, source, cutTop=0, cutBottom=0, cutLeft=0, cutRight=0} = self
	if (images[source] === undefined) {
		const image = new Image()
		image.src = source
		images[source] = image
	}
	const image = images[source]
	const imageHeightRatio = image.height/drawHeight
	const imageWidthRatio = image.width/drawWidth
	context.drawImage(image, cutLeft*imageWidthRatio, cutTop*imageHeightRatio, image.width-(cutRight+cutLeft)*imageWidthRatio, image.height-(cutBottom+cutTop)*imageHeightRatio, x+drawOffsetX, y+drawOffsetY, drawWidth-(cutLeft+cutRight), drawHeight-(cutBottom+cutTop))
	if (self.showBounds) {
		context.strokeStyle = Colour.White
		const bounds = getBounds(self)

		context.strokeRect(bounds.left, bounds.top, bounds.right-bounds.left, bounds.bottom-bounds.top)
	}
	context.restore()
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
			self.nextdx = 3 * (self.flipX? 1 : -1)
			self.nextdy = -10
			self.jumpTick = 0
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
	let [nx, ny] = [x+dx, y+dy]
	if (self.portals === undefined) self.portals = new Map()
	self.grounded = false

	let nbounds = getBounds({x: nx, y: ny, width, height, cutTop, cutBottom, cutLeft, cutRight})
	const bounds = getBounds(self)
	for (const atom of world.atoms) {
		if (atom === self) continue
		const abounds = getBounds(atom)

		//=====================================//
		// PROCESS CURRENT PORTAL THAT I AM IN //
		//=====================================//
		/*for (const [portal, blink] of self.portals) {
			
			// Update cut
			self.cutBottom = 

		}*/

		//========================//
		// DETECT ENTERING PORTAL //
		//========================//
		if (atom.isPortal && atom.isPortalActive) {
			if (atom.subjects === undefined) atom.subjects = new Map()

			// Hit edges!
			if (dy >= 0) {
				if (bounds.bottom <= abounds.top && nbounds.bottom >= abounds.top) {
					if ((self.cutBottom === undefined || self.cutBottom === 0) && aligns([bounds.left, bounds.right], [nbounds.left, nbounds.right], [abounds.right]) || aligns([bounds.left, bounds.right], [nbounds.left, nbounds.right], [abounds.left])) {
						ny = abounds.top - height + cutBottom
						self.nextdy = atom.dy
						self.nextdx *= 0.975
						self.grounded = true
						atom.jumpTick = 0
						nbounds = getBounds({x: nx, y: ny, width, height, cutTop, cutBottom, cutLeft, cutRight})
					}
					// ENTERTING a new portal
					else if (aligns([bounds.left, bounds.right], [nbounds.left, nbounds.right], [abounds.left, abounds.right])) {
						
						let blink = self.portals.get(atom)
						if (blink === undefined) {
							blink = makeBlink()
							atom.portal.enter(self, world)
						}
						self.portals.set(atom, blink)
						atom.subjects.set(self, blink)

						// Update my cut
						if (self.cutBottom === undefined) self.cutBottom = 0
						self.cutBottom += nbounds.bottom - abounds.top
						if (self.cutBottom > height) {
							self.portals.delete(atom)
							atom.subjects.delete(self)
							atom.portal.end(self, world)
						}

					}
				}
			}
			else if (dy < 0) {
				if (bounds.top >= abounds.bottom && nbounds.top <= abounds.bottom) {
					if (aligns([bounds.left, bounds.right], [nbounds.left, nbounds.right], [abounds.left]) || aligns([bounds.left, bounds.right], [nbounds.left, nbounds.right], [abounds.right])) {
						ny = abounds.bottom
						self.nextdy = 0
						nbounds = getBounds({x: nx, y: ny, width, height, cutTop, cutBottom, cutLeft, cutRight})
					}
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
						nx = abounds.left
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
					ny = abounds.bottom
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
					nx = abounds.left - width
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
		}
		

	}
	
	self.nextdy += UPDATE_MOVER_GRAVITY
	self.nextdx *= UPDATE_MOVER_AIR_RESISTANCE

	self.x = nx
	self.y = ny
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
		print("Enter void!")
	},
	end: (atom, world) => {
		world.atoms = world.atoms.filter(a => a !== atom)
		print("End void!")
	},
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
	//showBounds: true,
	//cutBottom: (254/6)/2,
	cutLeft: 0,
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
}

const ELEMENT_PORTAL_VOID = {
	...ELEMENT_PORTAL,
	portal: PORTAL_VOID,
	isPortalActive: true,
}