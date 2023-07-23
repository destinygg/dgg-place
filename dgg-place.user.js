// ==UserScript==
// @name         DGG r/place
// @version      0.2.4
// @description  Template overlay for DGG.
// @match        https://garlic-bread.reddit.com/embed*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=destiny.gg
// @grant        GM_xmlhttpRequest
// @license MIT
// ==/UserScript==
if (window.top !== window.self) {
    window.addEventListener('load', () => {
        // TODO generate mask instead of baking mask into image.
        //      mask-image css property not well-supported by Chrome unfortunately
        //      mask-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAADCAQAAAD8IX00AAAADklEQVQIW2NggIP/cBYACgsBAIGogeEAAAAASUVORK5CYII=);
        //      mask-size: 1px;
        // const maskPattern = new Image();
        // maskPattern.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAADCAQAAAD8IX00AAAADklEQVQIW2NggIP/cBYACgsBAIGogeEAAAAASUVORK5CYII=';
        // const maskPattern = document.createElement('img');
        // maskPattern.setAttribute('src', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAADCAQAAAD8IX00AAAADklEQVQIW2NggIP/cBYACgsBAIGogeEAAAAASUVORK5CYII=');


        const loader = document.createElement('img');
        const overlay = document.createElement('img');
        overlay.style = 'display: none';
        overlay.onload = () => {
            overlay.style = `display: block;position: absolute; left: 0; top: 0; width: ${overlay.width / 3}px; height: ${overlay.height / 3}px; image-rendering: pixelated; z-index: 1`;
        };

        // Add the image as overlay
        const camera = document.querySelector('garlic-bread-embed').shadowRoot.querySelector('garlic-bread-camera');
        const canvas = camera.querySelector('garlic-bread-canvas');
        canvas.shadowRoot.querySelector('.container').appendChild(overlay);

        // Add a style to put a hole in the pixel preview (to see the current or desired color)
        const waitForPreview = setInterval(() => {
            console.log('waitForPreview');
            const preview = camera.querySelector('garlic-bread-pixel-preview');
            if (preview) {
                clearInterval(waitForPreview);
                const style = document.createElement('style')
                style.innerHTML = '.pixel { clip-path: polygon(-20% -20%, -20% 120%, 37% 120%, 37% 37%, 62% 37%, 62% 62%, 37% 62%, 37% 120%, 120% 120%, 120% -20%); }'
                preview.shadowRoot.appendChild(style);
            }
        }, 100);

        let lastRefresh = 0;
        refresh();

        // use force refresh button instead...
        document.body.addEventListener('click', refresh, true); // refresh on click
        setInterval(refresh, 1000 * 60 * 15); // 15 minute auto refresh

        function refresh(forceRefresh) {
            let _4min = 1000 * 60 * 4;
            if (!(typeof forceRefresh === 'boolean' && forceRefresh) && Date.now() < lastRefresh + _4min) {
                // avoid too many refresh requests
                return;
            }
            console.log('refreshing template');
            lastRefresh = Date.now();
            GM_xmlhttpRequest({
                method: 'GET',
                responseType: 'blob',
                // url: `http://localhost:8000/dgg-place-template-1x.png`,
                url: `https://rplacecdn.destiny.gg/dgg-place-template-1x.png?i=${Date.now()}`,
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
                        loader.src = e.target.result;
                    }
                    fr.readAsDataURL(blob);
                },
            });
        }

        loader.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = loader.width * 3;
            canvas.height = loader.height * 3;
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(loader, 0, 0, loader.width * 3, loader.height * 3);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const height = imageData.height;
            const width = imageData.width;
            for (let row = 0; row < height; row++) {
                let rowPixel = row * (width * 4);
                if ((row + 2) % 3 !== 0) {
                    for (let col = 0; col < width; col++) {
                        data[rowPixel + 4 * col + 3] = 0;
                    }
                }
            }
            for (let row = 0; row < height; row++) {
                let rowPixel = row * (width * 4);
                for (let col = 0; col < width; col++) {
                    if ((col + 2) % 3 !== 0) {
                        data[rowPixel + 4 * col + 3] = 0;
                    }
                }
            }
            ctx.putImageData(imageData, 0, 0);

            // reset image.width and image.height; hide to prevent weird flash of content
            overlay.style = 'display: none;width:100%;height:100%;';
            overlay.src = canvas.toDataURL();
        };

        function toggle() {
            if (overlay.style.display === 'block') {
                overlay.style.display = 'none';
            } else {
                overlay.style.display = 'block';
            }
        }

        function addButton(text, onclick, cssObj) {
            cssObj = cssObj || {position: 'absolute', bottom: '5%', left:'4%', 'z-index': 3};
            let button = document.createElement('button'), btnStyle = button.style;
            document.body.appendChild(button);
            button.innerHTML = text;
            // button.onclick = onclick;
            button.addEventListener('click', onclick);
            btnStyle.position = 'absolute';
            Object.keys(cssObj).forEach(key => {btnStyle[key] = cssObj[key]});
            return button;
        }

        addButton('Refresh Template', () => refresh(true),
            {position: 'absolute', bottom: '10px', left:'4%', 'z-index': 3});
        addButton('Toggle Template', toggle,
            {position: 'absolute', bottom: '50px', left:'4%', 'z-index': 3});

        function saveCanvas() {
            const image = canvas.shadowRoot.querySelector('.container > canvas')
                .toDataUrl('image/png');
            const link = document.createElement('a');
            const filename = 'canvas.png';
            link.setAttribute('href', image);
            link.setAttribute('download', filename);
            link.click();
        }

        window.saveCanvas = saveCanvas;
        // console.log(saveCanvas.toString())

    }, false);
}

