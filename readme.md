Polygen
=======

Generate a random set of coloured polygons in HTML canvas.

## Usage

### jQuery plugin

Include the file `polygen-jquery.min.js` and use it on a canvas element.

For example:

```html
<body>
    <canvas id="polygen"></canvas>
    <script src="polygen-jquery.min.js"></script>
</body>
```

```javascript
$(() => {
    $('#polygen').attr('width', window.innerWidth)
    $('#polygen').attr('height', window.innerHeight)
    $('#polygen').polygen({
        split: 8,
        hue: 255,
        colorgen: 'fade_down'
    })
    // regenerate with the same options
    $('#polygen').click(function () {
        $(this).polygen()
    })
})
```

### Vanilla JS

Include the file `polgen.min.js` and pass in the canvas element.

For example:

```html
<body>
    <canvas id="polygen"></canvas>
    <script src="polygen.min.js"></script>
</body>
```

```javascript
window.onload = () => {
    let el = document.getElementById('polygen')
    el.setAttribute('width', window.innerWidth)
    el.setAttribute('height', window.innerHeight)
    polygen(el, {
        split: 8,
        hue: 255
    })
    // regenerate with the same options
    el.onclick = () => polygen(el)
}
```

### Options

The following options can be specified when generating the polygons

```javascript
{
    hue: random(), // base hue, from 0 - 255
    splitx: 10,    // amount of polygons horizontally
    splity: 10,    // amount of polygons vertically
    split: null,   // shortcut for both splitx and splity
    padding: 0,    // amount of extra polygons around the edges
                   // this is useful to make the polygons fill
                   // the canvas
    overbound: 1,  // the max distance (in squares) that each vertex
                   // can vary by. 0 means no variation
    colorgen: func // the function to generate colors per poly
                   // see below
}
```

`colorgen` can be either a function or a string that correlates to a default color generating function. The in-built functions are `'basic_light'`, `'basic_dark'`, `'fade_streak'`, `'fade_down'` and `'fade_center'`. `basic_dark` is used by default.

If you want to use your own `colorgen` function, it will receive the generator's current `hue` as well as a list of three `verts` that belong to the current triangle. It must return some kind of CSS color as a string, `#FFF`, `hsl(0,0,0)`, or `rgb(0,0,0)`. Here is an example of a simple color generator function:

```javascript
let colorgen = (hue, verts) => {
    // each vert is an object containing an x and y
    // attribute, which are between 0 and 1
    return 'hsl(' + hue + ', 50, ' + verts[0].x * 256 + ')'
}
```

### Regenerating

When polygen is applied to an element, the state of the colors and vertices are stored internally and will be re-used when polygen is used again on the same element. It will also automatically transition into the newly generated (random) vertices and to a new hue if specified. It will use the same options as the first generation by default, and they will be overridden with new options.

The interal data stored is keyed using the element's `id` attribute, so it is important to have a unique `id` on each polygen element.

#### Continuous new color example

```javascript
$('#polygen').polygen({
    hue: 128,
    split: 8,
    transition: 2,
    colorgen: 'fade_down'
})
setInterval(() => {
    $('#polygen').polygen({
        hue: Math.random() * 256
    })
}, 2000)
```