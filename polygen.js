/*

// Usage
Polygen('#polygen', {
	hue: 0,
	split: 5
})

*/

function Polygen (selector, opt, data) {

	/**
	 * Generate HSL CSS value
	 */
	var hsl = function (h, s, l) {
		return 'hsl(' + h + ', ' + (s ? s : 50) + '%, ' + (l ? l : 50) + '%)' 
	}

	/**
	 * Check and set default value for option attribute
	 */
	var getDefault = function (attr, value) {
		if (opt[attr] === undefined) {
			opt[attr] = value
		}
	}

	// set option defaults
	if (opt === undefined) {
		opt = {}
	}

	// Base hue for all polys
	getDefault('hue', Math.random() * 256)

	// Amount of polys per axis
	getDefault('splitx', 10)
	getDefault('splity', 10)

	if (opt.split) {
		opt.splitx = opt.split
		opt.splity = opt.split
	}

	// Randomness in lightness value
	getDefault('variance', 20)

	// Amount of extra tris added to the bottom
	// and right sides of the poly
	getDefault('padding', 0)

	// Max allowed vertex displacement	
	getDefault('overbound', 1)

	// Transition time
	getDefault('transition', 3)

	// Function to generate the colour value from the hue
	getDefault('colorgen', function (hue, verts) {
		var lightness = 50 + 20 * Math.cos(verts[0].x - verts[1].x + verts[2].x - verts[0].y + verts[1].y - verts[2].y)
		// var lightness = 50 - ((111 * (verts[0].x + verts[1].x + verts[2].x + verts[0].y + verts[1].y + verts[2].y)) % 25)
		//var lightness = 50 - opt.variance / 2 + Math.floor(Math.random() * opt.variance)
		return hsl(hue, 50, lightness)
	})

	// jQuery
	getDefault('$', jQuery)
	if (opt.$ === undefined) {
		console.err('Polygen requires jQuery')
		return
	}

	var el = opt.$(selector)
	var width = el.innerWidth()
	var height = el.innerHeight()
	var canvas = el[0].getContext('2d')

	if (opt.clear) {
		canvas.clearRect(0, 0, width, height)
	}

	/**
	 * Draw a triangle from 3 vertices
	 */
	var tri = function (v1, v2, v3) {
		canvas.beginPath()
		{
			canvas.moveTo(v1.x * width, v1.y * height)
			canvas.lineTo(v2.x * width, v2.y * height)
			canvas.lineTo(v3.x * width, v3.y * height)
			canvas.lineTo(v1.x * width, v1.y * height)
			canvas.fillStyle = opt.colorgen(opt.hue, [v1, v2, v3])
			canvas.strokeStyle = canvas.fillStyle
			canvas.fill()
			canvas.stroke()
		}
		canvas.closePath()
	}

	var generateVerts = function () {
		// Generate positions of all vertices
		var verts = []
		var splitx = opt.splitx + opt.padding
		var splity = opt.splity + opt.padding
		for (var i = 0; i < splity; i++) {
			var row = []
			for (var j = 0; j < splitx; j++) {
				// choose direction to move vertex
				var angle = Math.random() * Math.PI * 2
				// determine offsets of vertex
				var xmag = Math.random() / (2 * opt.splitx) * opt.overbound
				var ymag = Math.random() / (2 * opt.splity) * opt.overbound
				// add vertex to row
				row.push({
					x: j / opt.splitx + xmag * Math.cos(angle) + 1 / (2 * opt.splitx),
					y: i / opt.splity + ymag * Math.cos(angle) + 1 / (2 * opt.splity)
				})
			}
			verts.push(row)
		}
		return verts
	}

	var lerp = function (v1, v2, progress) {
		return {
			x: v1.x + (v2.x - v1.x) * progress,
			y: v1.y + (v2.y - v1.y) * progress
		}
	}

	if (data.verts === undefined || data.verts.length === 0) {
		var verts = generateVerts()
		// Draw tris to canvas
		for (var i = 0; i < verts.length - 1; i++) {
			for (var j = 0; j < verts[0].length - 1; j++) {
				tri(verts[i][j], verts[i][j + 1], verts[i + 1][j])
				tri(verts[i][j + 1], verts[i + 1][j], verts[i + 1][j + 1])
			}
		}

		data.opt = opt
		data.verts = verts
	} else {
		var newVerts = generateVerts()
		var oldVerts = data.verts
		var progress = 0
		console.log(data)
		var step = function () {
			canvas.clearRect(0, 0, width, height)
			// Lerp all verts
			var verts = []
			for (var i = 0; i < newVerts.length; i++) {
				var row = []
				for (var j = 0; j < newVerts[0].length; j++) {
					row.push(lerp(oldVerts[i][j], newVerts[i][j], progress))
				}
				verts.push(row)
			}
			// Draw tris to canvas
			for (var i = 0; i < verts.length - 1; i++) {
				for (var j = 0; j < verts[0].length - 1; j++) {
					tri(verts[i][j], verts[i][j + 1], verts[i + 1][j])
					tri(verts[i][j + 1], verts[i + 1][j], verts[i + 1][j + 1])
				}
			}
			progress += 1 / (60 * opt.transition)
			if (isNaN(progress) || progress >= 1) {
				clearInterval(anim)
			} 
		}
		var anim = setInterval(step, 16)

		data.opt = opt
		data.verts = newVerts
	}
}