
// https://martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically/
// h, s, v = [0..1]
const hsv_to_rgb = (h: number, s: number, v: number) => {
  let h_i = Math.floor(h*6);
  let f = h*6 - h_i;
  let p = v * (1 - s);
  let q = v * (1 - f*s);
  let t = v * (1 - (1 - f) * s);
  let r = 0, g = 0, b = 0;
  switch (h_i) {
    case 0:
        r = v;
        g = t;
        b = p;
        break;
    case 1:
        r = q;
        g = v;
        b = p;
        break;
    case 2:
        r = p;
        g = v;
        b = t;
        break;
    case 3:
        r = p;
        g = q;
        b = v;
        break;
    case 4:
        r = t;
        g = p;
        b = v;
        break;
    case 5:
        r = v;
        g = p;
        b = q;
        break;
    default:
        break;
  }
  return [Math.floor(r*256), Math.floor(g*256), Math.floor(b*256)];
}

function componentToHex(c: number) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }
  
function rgbToHex(r: number, g: number, b: number) {
return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

const golden_ratio_conjugate = 0.618033988749895;

export function * randomColor() {
    let rand = Math.random();
    while (true) {
        rand += golden_ratio_conjugate;
        rand %= 1;
        const [r, g, b] = hsv_to_rgb(rand, 0.5, 0.95);
        yield rgbToHex(r, g, b);
    }
};
