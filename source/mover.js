
const moverUpdate = (self, world) => {
	moverMove(self, world, self.dx, self.dy)
}

const moverMove = (self, world, dx, dy) => {

	// Reset some game state info
	self.grounded = false
	self.slip = undefined

	// Make generalised axes info
	// This help me write axis-independent and direction-independent code
	const axes = makeAxesInfo(self.x, self.y, dx, dy)

	// Make a list of atoms in this molecule that could POTENTIALLY hit something (ie: not a pure visual)
	// With each atom, store info about their potential movement
	const candidates = makeCandidates(self, axes)

	// Make each collision candidate emerge from portals if needed
	candidates.forEach(candidate => emergeCandidate(candidate, axes))

	// Find the FIRST atom I would hit if I travel forever in each axis //
	const candidateBlockers = candidates.map(candidate => getBlockers(candidate, axes))
	const blockersX = candidateBlockers.map(blocker => blocker.dx).flat(1)
	const blockersY = candidateBlockers.map(blocker => blocker.dy).flat(1)
	const blockers = {dx: blockersX, dy: blockersY}

	// Order the things I would hit from nearest to furthest away
	// If there are any draws, put portals last
	orderBlockers(blockers, axes)

	//===================================================//
	// COLLIDE with the closest atoms to me in each axis //
	//===================================================//
	for (const axis of axes) {

		let iveHitSomething = false
		const oldNew = axis.new //haha 'oldNew'
		
		for (const blocker of blockers[axis.dname]) {
			const {atom} = blocker
			if (atom === undefined) continue

			const bbounds = blocker.bounds
			const baxis = blocker.candidate.axes[axis.dname]
			const bself = blocker.candidate.atom
			
			// Update blocker bounds based on the decided Hit
			if (iveHitSomething) {
				const correction = oldNew - axis.new
				baxis.new -= correction
				blocker.candidate.nbounds[axis.front] -= correction
				blocker.candidate.nbounds[axis.back] -= correction
			}

			// Allow MODs by elements/atoms
			// TODO: Here is the problem
			// because one of these mod functions could ADD a child to me...
			// which I don't check for collisions properly
			// Can I check for children after all others? If there any unaccounted for children, also test them maybe?
			// Maybe not I dunno
			// WHO KNOWS
			// But what I do know, is that itll be easier if I create more generalized functions of all the stuff Ive got here TBH
			let modResult = true
			if (bself.preCollide !== undefined) {
				const result = bself.preCollide({self, bself, atom, axis, baxis, world, bounds: blocker.cbounds, nbounds: blocker.cnbounds, abounds: blocker.bounds, iveHitSomething, blockers: blockers[axis.dname]})
				if (result === false) modResult = false
			}
			if (atom.preCollided !== undefined) {
				const result = atom.preCollided({self, bself, atom, axis, baxis, world, bounds: blocker.cbounds, nbounds: blocker.cnbounds, abounds: blocker.bounds, iveHitSomething, blockers: blockers[axis.dname]})
				if (result === false) modResult = false
			}
			
			// SNAP to the surface!
			const newOffset = axis.front === axis.small? -bself[baxis.cutSmallName] : -baxis.size + bself[baxis.cutBigName]
			baxis.new = bbounds[axis.back] + newOffset
			const snapMovement = baxis.new - baxis.old
			axis.new = self[axis.name] + snapMovement
			
			if (iveHitSomething === true || modResult === false) continue

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
			
			// Update other blocker infos maybe? nah they can do it!
			iveHitSomething = true
		}

	}
	
	// Apply natural forces
	self.nextdy += UPDATE_MOVER_GRAVITY
	self.nextdx *= UPDATE_MOVER_AIR_RESISTANCE

	// Now that I've checked all potential collisions, and corrected myself...
	// MOVE to the new position!
	self.x = axes.dx.new
	self.y = axes.dy.new

	// Update all children?
	updateAtomLinks(self)

	// DODGY FIX! Make sure everything is cut correctly by portals
	// Comment out these to uncover lots of bugs
	candidates.forEach(candidate => emergeCandidate(candidate, axes, getBounds(candidate.atom)))
	candidates.forEach(candidate => remergeCandidate(candidate))

	// Now that I've moved, I can safely rotate without messing anything else up!
	// ROTATE! (if there is enough room)
	if (self.nextturns !== 0) {
		turnAtom(self, self.nextturns, true, true, world)
		self.nextturns = 0
	}
}

const remergeCandidate = (candidate) => {
	const catom = candidate.atom
	for (const key in catom.portals) {
		const portal = catom.portals[key]
		if (portal === undefined) continue
		const cutName = "cut" + key.as(Capitalised)
		const back = key
		const front = getOppositeSideName(back)
		const cbounds = getBounds(catom)
		const pbounds = getBounds(portal)
		if (cbounds[back] === pbounds[front]) continue
		catom[cutName] -= cbounds[back] - pbounds[front]
	}
}

const makeAxesInfo = (x, y, dx, dy) => {

	const axes = {
		dx: {},
		dy: {},
	}
	
	// Variable Stuff
	axes.dx.new = x + dx
	axes.dx.value = dx
	
	axes.dy.new = y + dy
	axes.dy.value = dy

	// Static Stuff
	axes.dx.name = "x"
	axes.dx.dname = "dx"
	axes.dx.small = "left"
	axes.dx.big = "right"
	axes.dx.sizeName = "width"
	axes.dx.direction = dx >= 0? 1 : -1
	axes.dx.front = axes.dx.direction === 1? axes.dx.big : axes.dx.small
	axes.dx.back = axes.dx.front === axes.dx.big? axes.dx.small : axes.dx.big
	axes.dx.other = axes.dy
	axes.dx.cutFrontName = "cut" + axes.dx.front.as(Capitalised)
	axes.dx.cutBackName = "cut" + axes.dx.back.as(Capitalised)

	axes.dy.name = "y"
	axes.dy.dname = "dy"
	axes.dy.small = "top"
	axes.dy.big = "bottom"
	axes.dy.sizeName = "height"
	axes.dy.direction = dy >= 0? 1 : -1
	axes.dy.front = axes.dy.direction === 1? axes.dy.big : axes.dy.small
	axes.dy.back = axes.dy.front === axes.dy.small? axes.dy.big : axes.dy.small
	axes.dy.other = axes.dx
	axes.dy.cutFrontName = "cut" + axes.dy.front.as(Capitalised)
	axes.dy.cutBackName = "cut" + axes.dy.back.as(Capitalised)

	return axes
}


const makeCandidates = (self, axes) => {
	const atoms = getDescendentsAndMe(self)
	const candidates = atoms.map(atom => makeCandidate(atom, axes))
	return candidates
}

// TODO: should this support changes in cuts over time?
// it can still be manually edited though! woo
const makeCandidate = (atom, axes) => {
	
	// This is what the new atom WOULD be after moving (if it doesn't hit anything)
	const natom = {
		...atom,
		x: atom.x + axes.dx.value,
		y: atom.y + axes.dy.value,
	}

	// Current bounds and new bounds
	const bounds = getBounds(atom)
	const nbounds = getBounds(natom)

	// Some axis-independent info to help me write code that works for all directions/axes
	const caxes = {
		dx: {},
		dy: {},
	}

	caxes.dx.old = atom.x
	caxes.dx.new = natom.x
	caxes.dx.size = atom.width
	caxes.dx.cutSmall = atom.cutLeft
	caxes.dx.cutBig = atom.cutRight
	caxes.dx.cutSmallName = "cutLeft"
	caxes.dx.cutBigName = "cutRight"

	caxes.dy.old = atom.y
	caxes.dy.new = natom.y
	caxes.dy.size = atom.height
	caxes.dy.cutSmall = atom.cutTop
	caxes.dy.cutBig = atom.cutBottom
	caxes.dy.cutSmallName = "cutTop"
	caxes.dy.cutBigName = "cutBottom"

	// Put it all together...
	const candidate = {
		atom,
		bounds,
		nbounds,
		axes: caxes,
	}

	return candidate

}

const emergeCandidate = (candidate, axes, nbounds = candidate.bounds) => {

	const atom = candidate.atom

	// Go through each of my portals...
	for (const key in atom.portals) {
		const portal = atom.portals[key]
		if (portal === undefined) continue
		const pbounds = getBounds(portal)

		// I'm only interested in my BACK because I'm EMERGING!
		for (const axis of axes) {
			if (axis.back !== key) continue
			
			// What's the distance between me and the portal?
			const distanceToPortal = nbounds[axis.back] - pbounds[axis.front]

			// Reduce my cut so that there isn't a gap anymore!
			atom[axis.cutBackName] -= distanceToPortal * axis.direction

			// Fire moddable events :)
			if (portal.portal.move !== undefined) portal.portal.move()
			if (portal.portal.moveIn !== undefined) portal.portal.moveIn()

			// If I'm fully emerged, then I'm finished with this portal!
			if (atom[axis.cutBackName] <= 0) {
				atom.portals[axis.back] = undefined
				atom[axis.cutBackName] = 0
				if (portal.portal.exit !== undefined) portal.portal.exit()
			}

		}
	}
	
	// (manually) Update the candidate info (with the new cut)!!!
	const natom = {
		...atom,
		x: candidate.axes.dx.new,
		y: candidate.axes.dy.new,
	}
	candidate.nbounds = getBounds(natom)

}

const getBlockers = (candidate, axes) => {

	const blockers =  {dx: [], dy: []}

	for (const axis of axes) {
		
		if (candidate.atom.world === undefined) continue
		if (candidate.atom.world.atoms === undefined) continue

		const cself = candidate.atom
		for (const atom of cself.world.atoms) {
			
			if (atomIsDescendant(cself, atom)) continue
			if (atomIsDescendant(atom, cself)) continue
			if (atom.isVisual) continue
			if (atom === cself) continue

			// Check here for collisions with the inside edge of portals (the wrong way)
			if (cself.portals[axis.front] !== undefined) {
				const portal = cself.portals[axis.front]
				if (atomIsDescendant(atom, portal)) {
					continue
				}
			}

			const abounds = getBounds(atom)
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
			blockers[axis.dname].push({atom, bounds: abounds, distance, cbounds: bounds, cnbounds: nbounds, candidate})
		}
	}

	return blockers
}

// Orders blockers in-place
const orderBlockers = (blockers, axes) => {

	// Order the blockers so that portals gets processed LAST
	// (because they don't really block, do they)
	for (const axis of axes) {

		const winningBlockers = new Map()

		for (const blocker of blockers[axis.dname]) {
			if (!winningBlockers.has(blocker.candidate)) {
				winningBlockers.set(blocker.candidate, [blocker])
				continue
			}
			const winners = winningBlockers.get(blocker.candidate)
			if (winners[0].distance > blocker.distance) {
				winningBlockers.set(blocker.candidate, [blocker])
			}
			else if (winners[0].distance === blocker.distance) {
				winners.push(blocker)
			}
		}

		blockers[axis.dname] = [...winningBlockers.values()].flat()
		
		blockers[axis.dname].sort((a, b) => {
			//if (a.distance < b.distance) return -1
			//if (a.distance > b.distance) return 1
			if (a.atom.isPortal && !b.atom.isPortal) return 1
			if (!a.atom.isPortal && b.atom.isPortal) return -1
			return 0
		})

	}

	return blockers
}