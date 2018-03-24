;(function ($) {
    var polydata = {}

    var COLOR_GENS = {
        basic_light: function (hue, verts) {
            return hsl(hue, 50, 30 + 30 * Math.cos(
                verts[0].x - verts[1].x
                + verts[2].x - verts[0].y
                + verts[1].y - verts[2].y))
        },
        basic_dark: function (hue, verts) {
            return hsl(hue, 50, 50 - ((111 * (verts[0].x + verts[1].x
                + verts[2].x + verts[0].y + verts[1].y + verts[2].y)) % 25))
        },
        fade_streak: function (hue, verts) {
            return hsl(hue, 50, 25 *
                Math.sin((verts[0].x + verts[0].y) / 2 * Math.PI) + 50)
        },
        fade_down: function (hue, verts) {
            var base = 25
            var v1 = 16 * Math.sin(verts[2].x * Math.PI)
                + 16 * Math.cos(verts[2].y * Math.PI)
            var v2 = 4 * Math.sin(verts[1].x * Math.PI)
                + 4 * Math.cos(verts[1].y * Math.PI)
            return hsl(hue, 50, Math.max(base + v1 + v2, base))
        },
        fade_center: function (hue, verts) {
            var sq = function (n) { return n * n }
            var dist = Math.sqrt(sq(verts[0].x - 0.5) + sq(verts[0].y - 0.5))
            var lightness = Math.max(50, 20 + 50 * (1 - dist))
            return hsl(hue, 50, lightness)
        }
    }

    var hsl = function (h, s, l) {
        return 'hsl(' + h + ', ' + (s ? s : 50) + '%, ' + (l ? l : 50) + '%)'
    }

    var lerpVert = function (v1, v2, progress) {
        return {
            x: v1.x + (v2.x - v1.x) * progress,
            y: v1.y + (v2.y - v1.y) * progress
        }
    }

    var genVerts = function (opts) {
        var verts = []
        var splitx = opts.splitx + opts.padding * 2
        var splity = opts.splity + opts.padding * 2
        for (var j = -opts.padding; j < splity; j++) {
            var row = []
            for (var i = -opts.padding; i < splitx; i++) {
                var angle = Math.random() * Math.PI * 2
                var xmag = Math.random() / (2 * opts.splitx) * opts.overbound
                var ymag = Math.random() / (2 * opts.splity) * opts.overbound
                row.push({
                    x: i / opts.splitx + xmag * Math.cos(angle) + 1 / (2 * opts.splitx),
                    y: j / opts.splity + ymag * Math.cos(angle) + 1 / (2 * opts.splity)
                })
            }
            verts.push(row)
        }
        return verts
    }

    $.fn.polygen = function (opts) {
        var data = polydata[this.attr('id')]
        if (data && data.anim) clearInterval(data.anim)
        if (opts && opts.colorgen && typeof opts.colorgen === 'string') {
            if (Object.keys(COLOR_GENS).indexOf(opts.colorgen) > -1) {
                opts.colorgen = COLOR_GENS[opts.colorgen]
            } else {
                delete opts.colorgen
            }
        }
        opts = Object.assign({
            hue: Math.random() * 256,
            splitx: 10,
            splity: 10,
            padding: 0,
            overbound: 1,
            transition: 1,
            colorgen: COLOR_GENS['basic_dark']
        }, data ? data.opts : null, opts)
        if (opts.split) {
            opts.splitx = opts.split
            opts.splity = opts.split
        }
        var currentHue = opts.hue
        var width = this.innerWidth()
        var height = this.innerHeight()
        var canvas = this[0].getContext('2d')
        var tri = function (v1, v2, v3) {
            canvas.beginPath()
            {
                canvas.lineTo(v1.x * width, v1.y * height)
                canvas.lineTo(v2.x * width, v2.y * height)
                canvas.lineTo(v3.x * width, v3.y * height)
                canvas.lineTo(v1.x * width, v1.y * height)
                canvas.fillStyle = opts.colorgen(currentHue, [v1, v2, v3])
                canvas.strokeStyle = canvas.fillStyle
                canvas.fill()
                canvas.stroke()
            }
            canvas.closePath()
        }
        var draw = function (verts) {
            for (var j = 0; j < verts.length - 1; j++) {
                for (var i = 0; i < verts[0].length - 1; i++) {
                    tri(verts[j][i], verts[j][i + 1], verts[j + 1][i])
                    tri(verts[j][i + 1], verts[j + 1][i], verts[j + 1][i + 1])
                }
            }
        }
        if (!data) {
            data = polydata[this.attr('id')] = {}
        }
        if (data.verts === undefined || data.verts.length === 0) {
            // initial draw
            var verts = genVerts(opts)
            draw(verts)
            data.verts = verts
        } else {
            // lerp to new verts
            var newVerts = genVerts(opts)
            var oldVerts = data.verts
            var oldHue = data.opts.hue
            var hueDiff = currentHue - oldHue
            var progress = 0.01
            data.anim = setInterval(function () {
                canvas.clearRect(0, 0, width, height)
                currentHue = oldHue + hueDiff * progress
                var verts = []
                for (var j = 0; j < newVerts.length; j++) {
                    var row = []
                    for (var i = 0; i < newVerts[0].length; i++) {
                        row.push(lerpVert(oldVerts[j][i], newVerts[j][i], progress))
                    }
                    verts.push(row)
                }
                draw(verts)
                progress += Math.sin(progress * Math.PI) / 30 / opts.transition
                if (isNaN(progress) || progress >= 0.99) {
                    clearInterval(data.anim)
                }
            }, 12)
            data.verts = newVerts
        }
        data.opts = opts
        return this
    }
})(jQuery)