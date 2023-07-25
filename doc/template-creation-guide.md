# Template creation guide

The coordinates are confusing; (0,0) is in the center of the place canvas, but computer graphics usually have (0,0) at the top left corner of the image.

## Creating the 1x scale template

 - To simplify placing templates, I create a canvas reference image by clicking the "Export Canvas" button in the dgg menu
 - Place 1x scale pixel art on a layer above the reference at the desired location
 - Make sure that all the dgg art is on a layer above the canvas reference with 100% opacity to prevent accidentally baking bad pixels into the template reference
 - Hide the canvas reference so that only the template reference is visible
 - Export the 1x scale reference as a PNG file

## Testing the template locally with the dgg-place-user.js script
  - Make sure Python3 is installed, then run `python -m http.server` in the repo base directory
  - Visit http://localhost:8000/dgg-place-template-1x.png in the browser to ensure new template is visible, make sure the browser isn't caching the image
  - Set the external template URL to http://localhost:8000/dgg-place-template-1x.png in the dgg menu and click the Use button
  - Inspect the template in r/place and look for errors
