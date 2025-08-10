# colors:

## generic functions

mix(colorA, colorB)
lerp(colorA, colorB, x)

## Color class:
### static methods -> make instance of color 
constructor(r, g, b)
rgb(r, g, b)
hsl(h, s, l)
hex(s)
random(saturation, lightness)
different_from(c: Color)

red()
orange()
amber()
yellow()
lime()
green()
emerald()
teal()
cyan()
sky()
blue()
indigo()
violet()
purple()
fuchsia()
pink()
rose()
white()
black()

### instance methods

to_tuple()
to_hex()
to_hsl()

brightness()
hue()
saturation()


on() // set to white
off() // set to black
fade()

lerp(target: (r, g, b), frames, fn)
lerp_set(target: (r, g, b), frames, fn)
lerp_cont()

set(c: Color)

set_<same name as static methods>()
set_rgb(r, g, b)
set_red()
set_yellow()
...

### instance attributes

r // (readonly)
b // (readonly)
g // (readonly)




# class Pixel (Extends Color) // adds the physical position

### instance attributes (readonly)
id
x
y
z
xyz -> (int, int, int)
a // polar angle from x+
d // polar distance from center

### instance methods

distance_to(p: Pixel)
nearest(n: int) // n nearest pixels
within(d: float) // pixels within d distance



# Timing

## generic functions

millis() - millis since start of pattern
seconds() - seconds since start of pattern
frames() - frames since start of pattern





# Math

## constants

PI
HALF_PI
TWO_PI
TAU

## generic functions

dist(point1, point2)





# Geometry

sphere(pos, radius, color)
box(pos, width, depth, height, color)
line(posA, posB, color, width)
