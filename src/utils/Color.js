module.exports = {
	
	//Adapted from: http://bgrins.github.io/TinyColor/docs/tinycolor.html		
	rgbToHsv : function( color ){

		var r = color[0];
		var g = color[1];
		var b = color[2];
		
		var max = Math.max(Math.max(r, g), b);
		var min = Math.min( Math.min(r, g), b);
		
		var h, s, v = max;

		var d = max - min;
		s = max === 0 ? 0 : d / max;

		if(max == min) {
			h = 0; // achromatic
		} else {
			switch(max) {
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}
		return [ h, s, v ];
	},
	
	hsvToRgb : function(h, s, v) {

		h = Math.min(h, 360) * 6;
		s = Math.min(s, 100);
		v = Math.min(v, 100);

		var i = math.floor(h),
			f = h - i,
			p = v * (1 - s),
			q = v * (1 - f * s),
			t = v * (1 - (1 - f) * s),
			mod = i % 6,
			r = [v, q, p, p, t, v][mod],
			g = [t, v, v, q, p, p][mod],
			b = [p, p, t, v, v, q][mod];

		return [ r * 255, g * 255, b * 255 ];
	},
}