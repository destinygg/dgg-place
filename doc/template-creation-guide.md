# Template creation guide

(orig by `dgg_chatter_here`)

The coordinates are confusing; (0,0) is in the center of the place canvas, but computer graphics usually have (0,0) at the top left corner of the image.

## Creating the 1x scale template

 - To simplify placing templates, I create a canvas reference image:
   - Take a screenshot of /r/place, manually editing the `&px=<number>` part of the URL to be `&px=1000`, to get 1x scale (1 screen pixel = 1 place pixel)
   - The screenshot should be 1500x1000 pixels (currently - may be larger with future expansions)
 - Place 1x scale pixel art on a layer above the reference at the desired location
 - Make sure that all the dgg art is on a layer above the canvas reference with 100% opacity to prevent accidentally baking bad pixels into the template reference
 - Hide the canvas reference so that only the template reference is visible
 - Export the 1x scale reference as a PNG file
  
## Creating the final 3x scale template

 - Open the 1x scale reference as a new image
 - Scale the image up 3x
   - GIMP instructions: Image -> Scale Image -> in the Width box, type *3 and press enter to multiply the number by 3, and the height value should adjust along with the width. Set Interpolation to None and click Scale
 - Create a pixel pattern, 3x3, with a 1px white border and a 1px hole in the center.
   - Alternatively, copy the pixel pattern image. Paste `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAADCAQAAAD8IX00AAAAEUlEQVQIW2P4DwYMQATCEB4Ap20P8bYxs8QAAAAASUVORK5CYII=` into a new browser tab, right click the image, and copy the image
 - Create a new empty layer on top as an erase mask
 - Bucket fill the image with the pattern fill option on the erase mask layer. In GIMP, the image copied to the clipboard is the first pattern in the list of patterns.
 - Change the erase mask layer's blending mode from "Normal" to "Erase"
 - The 3x scale template is now done. Export the image as PNG

## Testing the template locally with the dgg-place-user.js script
  - Make sure Python3 is installed, then run `python -m http.server` in the repo base directory
  - Visit http://localhost:8000/dgg-place-template-1.png in the browser to ensure new template is visible, make sure the browser isn't caching the image
  - Edit your DGG r/place script in Violentmonkey/Tampermonkey, replacing the dgg-place-template-1.png with the localhost location
  - Save and Reload... Inspect template in r/place and look for errors
  - After testing, remember undo your script change (or re-install) so that it points back to the live production url