//=======//
// Setup //
//=======//
let ATOM_ID = 0
const makeAtom = ({
	width = 50,
	height = 50,
	x = WORLD_WIDTH/2 - width/2,
	y = WORLD_HEIGHT/2 - height/2,
	dx = 0,
	dy = 0,
	draw = DRAW_RECTANGLE,
	update = UPDATE_STATIC,
	grab = GRAB_DRAG,
	turns = 0,
	cutTop = 0,
	cutBottom = 0,
	cutRight = 0,
	cutLeft = 0,
	autoLinks = [],
	construct = () => {},
	...args
} = {}, {autoTurn = true} = {}) => {
	const atom = {
		id: ATOM_ID++,
		width,
		height,
		cutTop,
		cutBottom,
		cutRight,
		cutLeft,
		x,
		y,
		dx,
		dy,
		nextdx: dx,
		nextdy: dy,
		turns: 0,
		nextturns: 0,
		draw,
		update,
		grab,
		flipX: false,
		portals: {top: undefined, bottom: undefined, left: undefined, right: undefined},
		children: [],
		links: [],
		...args
	}

	

	for (const autoLink of autoLinks) {
		const latom = makeAtom(autoLink.element)
		linkAtom(atom, latom, autoLink.offset, autoLink.transfer)
	}

	// Band-aid for old silly arguments idea
	if (autoTurn) {
		turnAtom(atom, turns)
	}
	else {
		// I SHOULD do this
		// But at this point, I've hardcoded fixes for it everywhere else in the code
		// so I can't do it now
		// fix it in TimePond 2
		//atom.turns = turns
	}

	construct(atom)
	return atom
}

const cloneAtom = (atom) => {
	const clone = {}
	for (const key in atom) {
		clone[key] = deepishCloneAtomProperty(atom[key], key)
	}
	return makeAtom(clone, {autoTurn: false})
}

const deepishCloneAtomProperty = (value, key) => {
	if (key === "prevBounds") return undefined
	if (key === "id") return ATOM_ID++
	if (key === "portals") return {top: undefined, bottom: undefined, left: undefined, right: undefined}
	if (key === "links") return []
	if (typeof value === "undefined") return value
	if (typeof value === "string") return value
	if (typeof value === "number") return value
	if (typeof value === "boolean") return value
	if (typeof value === "function") return value //not deepcloning but i promise i wont mess around with function properties
	if (typeof value === "object") {
		/*if (value instanceof Array)	{
			const array = []
			for (const key in value) {
				array[key] = value[key] //not a pure deep clone
			}
			return array.d
		}*/
		if (value instanceof Object) {
			const object = {}
			for (const key in value) {
				object[key] = value[key] //not a pure deep clone either cos we want the atom REFERENCES yo
			}
			return object
		}
	}
	console.error("Couldn't deepish-clone value", value)
}

//===========//
// Game Loop //
//===========//
const updateAtom = (atom, world) => {
	if (atom.skipUpdate === true) {
		atom.skipUpdate = false
	}
	else {
		
		//atom.prevBounds = getBounds(atom)
		atom.update(atom, world)
	}
	updateAtomLinks(atom, world)
}

const updateAtomLinks = (atom) => {
	for (const link of atom.links) {
		//link.atom.prevBounds = getBounds(link.atom)
		for (const key of LINKED_PROPERTIES) {

			if (link.offset[key] !== undefined) {
				const them = atom[key]
				const me = link.atom[key]
				link.atom[key] = link.offset[key](them, me)
			}
			else {
				link.atom[key] = atom[key]
			}

			
		}
		
		updateAtomLinks(link.atom)
	}
}

const drawAtom = (atom, context) => {
	const {draw} = atom
	draw(atom, context)
}

//=========//
// Usefuls //
//=========//
const linkAtom = (atom, latom, offset={}, transfer={}) => {
	const trans = {...transfer}
	for (const key of LINKED_PROPERTIES) {
		if (trans[key] === undefined) {
			trans[key] = (parent, child, key, value=child[key]) => parent[key] = value
		}
	}
	atom.links.push({atom: latom, offset: {...offset}, transfer: trans})
	latom.parent = atom
}

const getDescendentsAndMe = (self) => {
	if (self.links.length === 0) return [self]
	const atoms = self.links.map(link => link.atom)
	const descendents = atoms.map(atom => getDescendentsAndMe(atom)).flat(1)
	return [self, ...descendents]
}

const transferToParent = (child, key, value) => {
	const parent = child.parent
	if (parent === undefined) return
	const link = getLink(child)
	link.transfer[key](parent, child, key, value)
	if (parent.parent !== undefined) transferToParent(parent, key, parent[key])
}

const getLink = (child) => {
	const parent = child.parent
	if (parent === undefined) return
	for (const link of parent.links) {
		if (link.atom === child) return link
	}
}

const moveAtom = (atom, x, y) => {
	atom.x = x
	atom.y = y
	updateAtomLinks(atom)
}

const flipAtom = (atom) => {
	atom.flipX = !atom.flipX
	const [cutLeft, cutRight] = [atom.cutRight, atom.cutLeft]
	const cutDiff = cutLeft - cutRight
	atom.cutLeft = cutRight
	atom.cutRight = cutLeft
	//atom.x -= cutDiff
}

const turnAtom = (atom, turns=1, fallSafe=false, rejectIfOverlap=false, world, exceptions=[]) => {
	if (atom.portals.top !== undefined) return false
	if (atom.portals.bottom !== undefined) return false
	if (atom.portals.right !== undefined) return false
	if (atom.portals.left !== undefined) return false
	if (atom.turns === undefined) atom.turns = 0
	if (turns === 0) return true
	if (turns < 0) return turnAtom(atom, 4+turns, fallSafe, rejectIfOverlap, world, exceptions=[])
	if (turns > 1) {
		const result = turnAtom(atom, 1, fallSafe, rejectIfOverlap, world, exceptions=[])
		if (!result) return false
		return turnAtom(atom, turns-1, fallSafe, rejectIfOverlap, world, exceptions=[])
	}
	const old = {}
	const obounds = getBounds(atom)
	const {height, width, cutTop, cutBottom, cutRight, cutLeft} = atom
	old.height = height
	old.width = width
	old.cutTop = cutTop
	old.cutBottom = cutBottom
	old.cutLeft = cutLeft
	old.cutRight = cutRight
	
	old.y = atom.y
	old.x = atom.x
	atom.height = width
	atom.width = height
	atom.cutBottom = cutRight
	atom.cutLeft = cutBottom
	atom.cutTop = cutLeft
	atom.cutRight = cutTop

	const oldLinks = new Map()
	for (const link of atom.links) {
		const oldLink = {}
		oldLinks.set(link, oldLink)
		oldLink.height = link.atom.height
		oldLink.width = link.atom.width
		oldLink.cutTop = link.atom.cutTop
		oldLink.cutBottom = link.atom.cutBottom
		oldLink.cutLeft = link.atom.cutLeft
		oldLink.cutRight = link.atom.cutRight

		oldLink.y = link.atom.y
		oldLink.x = link.atom.x

		oldLink.offset = {}
		oldLink.transfer = {}

		for (const key of LINKED_PROPERTIES) {
			oldLink.offset[key] = link.offset[key]
			oldLink.transfer[key] = link.transfer[key]
		}

		for (const linkType of ["offset", "transfer"]) {
			link[linkType].width = oldLink[linkType].height
			link[linkType].height = oldLink[linkType].width
			link[linkType].cutBottom = oldLink[linkType].cutRight
			link[linkType].cutLeft = oldLink[linkType].cutBottom
			link[linkType].cutTop = oldLink[linkType].cutLeft
			link[linkType].cutRight = oldLink[linkType].cutTop
			link[linkType].cutRight = oldLink[linkType].cutTop
			link[linkType].x = oldLink[linkType].y
			link[linkType].y = oldLink[linkType].x
			link[linkType].dx = oldLink[linkType].dy
			link[linkType].dy = oldLink[linkType].dx
			link[linkType].nextdx = oldLink[linkType].nextdy
			link[linkType].nextdy = oldLink[linkType].nextdx
		}

		turnAtom(link.atom, turns, fallSafe, false, world, exceptions)

	}

	if (rejectIfOverlap) {
		
		const nbounds = getBounds(atom)
		atom.y -= nbounds.bottom-obounds.bottom + 1
		atom.x -= (atom.width-atom.height)/2
		for (const a of world.atoms) {
			if (a === atom) continue
			if (exceptions.includes(a)) continue
			if (atomOverlaps(atom, a)) {
				//const bounds = getBounds(atom)
				//const abounds = getBounds(a)
				//if (abounds.top === bounds.bottom) continue
				for (const key in old) {
					atom[key] = old[key]
				}
				for (const [link, oldLink] of oldLinks) {
					for (const key in oldLink) {
						if (key === "offset" || key === "transfer") continue
						link.atom[key] = oldLink[key]
					}
					for (const key in oldLink.offset) {
						link.offset[key] = oldLink.offset[key]
					}
					for (const key in oldLink.transfer) {
						link.transfer[key] = oldLink.transfer[key]
					}
				}
				return false
			}
		}

	}
	atom.turns++
	if (atom.turns >= 4) atom.turns = 0

	return true
}

const getBounds = ({x, y, width, height, cutTop=0, cutBottom=0, cutLeft=0, cutRight=0}) => {
	const top = y + cutTop
	const bottom = y + height - cutBottom
	const left = x + cutLeft
	const right = x + width - cutRight
	return {top, bottom, left, right}
}

const pointOverlaps = ({x, y}, atom) => {
	const {left, right, top, bottom} = getBounds(atom)
	return x >= left && x <= right && y >= top && y <= bottom
}

const getAtomAncestor = (atom) => {
	if (atom.parent === undefined) return atom
	return getAtomAncestor(atom.parent)
}

const atomIsDescendant = (kid, parent) => {
	if (kid.parent === parent) return true
	if (kid.parent === undefined) return false
	return atomIsDescendant(kid.parent, parent)
}


const atomOverlaps = (self, atom) => {

	if (atomIsDescendant(self, atom)) return false
	if (atomIsDescendant(atom, self)) return false

	for (const link of self.links) {
		const result = atomOverlaps(link.atom, atom)
		if (result) return true
	}

	const bounds = getBounds(self)
	const abounds = getBounds(atom)

	const horizAligns = aligns([bounds.left, bounds.right], [], [abounds.left, abounds.right])
	const vertAligns = aligns([bounds.top, bounds.bottom], [], [abounds.top, abounds.bottom])
	if (horizAligns && vertAligns) return true
	//if (horizAligns && bounds.top <= abounds.top && bounds.bottom >= abounds.bottom) return true
	//if (horizAligns && bounds.left <= abounds.left && bounds.right >= abounds.right) return true

	const ahorizAligns = aligns([abounds.left, abounds.right], [], [bounds.left, bounds.right])
	const avertAligns = aligns([abounds.top, abounds.bottom], [], [bounds.top, bounds.bottom])
	if (ahorizAligns && avertAligns) return true
	//if (ahorizAligns && abounds.top <= bounds.top && abounds.bottom >= bounds.bottom) return true
	//if (avertAligns && abounds.left <= bounds.left && abounds.right >= bounds.right) return true

	return false
}

const getPointSide = (point, [left, right]) => {
	if (point < left) return -1
	if (point > right) return 1
	return 0
}

const aligns = ([left, right], [nleft, nright], [aleft, aright=aleft]) => {
	const leftSide = getPointSide(left, [aleft, aright])
	const rightSide = getPointSide(right, [aleft, aright])
	if (leftSide === 0) return true
	if (rightSide === 0) return true
	if (leftSide*-1 == rightSide) return true

	// For moving things
	if (nleft !== undefined && nright !== undefined) {
		const nleftSide = getPointSide(nleft, [aleft, aright])
		const nrightSide = getPointSide(nright, [aleft, aright])
		if (nleftSide === 0) return true
		if (nrightSide === 0) return true
		if (leftSide*-1 == nleftSide) return true
		if (rightSide*-1 == nrightSide) return true
	}

	return false
}