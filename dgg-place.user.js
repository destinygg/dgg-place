// ==UserScript==
// @name         DGG r/place
// @version      0.2.1
// @description  Template overlay for DGG.
// @match        https://garlic-bread.reddit.com/embed*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=destiny.gg
// @grant        GM_xmlhttpRequest
// @license MIT
// ==/UserScript==
if (window.top !== window.self) {
    window.addEventListener('load', () => {
        const image = document.createElement("img");
        image.onload = () => {
            image.style = `position: absolute; left: 0; top: 0; width: ${image.width / 3}px; height: ${image.height / 3}px; image-rendering: pixelated; z-index: 1`;
        };
        GM_xmlhttpRequest({
            method: 'GET',
            responseType: 'blob',
            url: 'https://raw.githubusercontent.com/chatter-here/dgg-place/master/dgg-place-template-1.png',
            onload: function (response) {
                let blob;
                if (response.response instanceof Blob) {
                    blob = response.response;
                } else if(response.responseXML instanceof Blob) {
                    blob = response.responseXML;
                } else {
                    console.error('unable to fetch template');
                }
                const fr = new FileReader();
                fr.onload = (e) => {
                    image.src = e.target.result;

                    // Add the image as overlay
                    const camera = document.querySelector("garlic-bread-embed").shadowRoot.querySelector("garlic-bread-camera");
                    const canvas = camera.querySelector("garlic-bread-canvas");
                    canvas.shadowRoot.querySelector('.container').appendChild(image);

                    // Add a style to put a hole in the pixel preview (to see the current or desired color)
                    const waitForPreview = setInterval(() => {
                        const preview = camera.querySelector("garlic-bread-pixel-preview");
                        if (preview) {
                            clearInterval(waitForPreview);
                            const style = document.createElement('style')
                            style.innerHTML = '.pixel { clip-path: polygon(-20% -20%, -20% 120%, 37% 120%, 37% 37%, 62% 37%, 62% 62%, 37% 62%, 37% 120%, 120% 120%, 120% -20%); }'
                            preview.shadowRoot.appendChild(style);
                        }
                    }, 100);
                }
                fr.readAsDataURL(blob);
            },
        });
    }, false);
}

