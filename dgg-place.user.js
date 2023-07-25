// ==UserScript==
// @name         DGG r/place
// @version      0.2.6
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

        // const dggTemplateUrl = 'http://localhost:8000/dgg-place-template-1x.png';
        const dggTemplateUrl = 'https://rplacecdn.destiny.gg/dgg-place-template-1x.png';
        let templateUrl = dggTemplateUrl;

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
            let theUrl = dggTemplateUrl;
            if (templateUrl != null && templateUrl !== '') {
                theUrl = templateUrl;
            }
            GM_xmlhttpRequest({
                method: 'GET',
                responseType: 'blob',
                // url: theUrl, // non cache busting
                url: `${theUrl}?i=${Date.now()}`, // cache busting
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

        function toggleElement(element, display = 'block') {
            if (element.style.display === display) {
                element.style.display = 'none';
            } else {
                element.style.display = display;
            }
        }

        function addElement(tag, { parent = document.body, style, innerhtml, onclick }) {
            let element = document.createElement(tag);
            Object.assign(element.style, style);
            if (innerhtml) {
                element.innerHTML = innerhtml;
            }
            if (onclick) {
                element.addEventListener('click', onclick);
            }
            parent.appendChild(element);
            return element;
        }

        let settingsDiv = addElement('div', {
            style: {
                position: 'absolute',
                bottom: '30px',
                left: '86px',
                'z-index': 3,
                padding: '10px',
                borderRadius: '4px',
                background: '#222',
                display: 'none',
                flexDirection: 'column',
                gap: '10px',
            },
        });

        let dggBtn = addElement('button', {
            style: {
                position: 'absolute',
                bottom: '30px',
                left: '30px',
                zIndex: 3,
                width: '48px',
                height: '50px',
                padding: '0px',
                borderRadius: '4px',
                background: '#000',
                boxSizing: 'border-box',
            },
            // innerhtml: '<img width="48" height="48" src="https://cdn.destiny.gg/img/favicon/favicon-48x48.png" />',
            innerhtml: favicon,
            onclick: () => toggleElement(settingsDiv, 'flex'),
        });

        const buttonStyles = {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '6px',
        }

        addElement('button', {
            parent: settingsDiv,
            style: buttonStyles,
            innerhtml: exportIcon + 'Export Canvas',
            onclick: exportCanvas,
        });

        addElement('button', {
            parent: settingsDiv,
            style: buttonStyles,
            innerhtml: refreshIcon + 'Refresh Template',
            onclick: () => refresh(true),
        });

        let overlayActive = true;
        let toggleBtn = addElement('button', {
            parent: settingsDiv,
            style: buttonStyles,
            innerhtml: toggleIcon + 'Toggle Template',
            onclick: () => {
                toggleElement(overlay);
                overlayActive = !overlayActive;
                toggleBtn.innerHTML = (overlayActive ? toggleIcon : toggleIconOff) + 'Toggle Template';
            },
        });

        let extTempContainer = addElement('div', {
            parent: settingsDiv,
        });
        let extTempInput = addElement('input', {
            parent: extTempContainer,
            style: {
                padding: '6px',
                'font-size': '12px',
                border: '1px solid #000',
                marginRight: '5px',
            },
        });
        extTempInput.placeholder = 'Use external template';
        addElement('button', {
            parent: extTempContainer,
            innerhtml: 'Use',
            onclick: () => {
                templateUrl = extTempInput.value;
                refresh(true);
            },
        });


        function exportCanvas() {
            // zoom all the way out to load the whole canvas first
            console.log('Export Canvas')
            canvas.shadowRoot.querySelector('.container > canvas').toBlob(function(blob) {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'canvas.png';
                link.click();
            },'image/png');
        }

    }, false);
}

const favicon = `
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 265 265">
<path fill="#59aeea" d="M163.97 243.977h80.581V193.3h-32.506zM244.551 74.875V24.199h-80.58l48.074 50.676z"/>
<path fill="#1A1A1A" d="M0 0v264.652h264.648V.22L0 0zm244.551 243.977h-80.58l48.077-50.68h32.507v50.68h-.004zm0-169.102h-32.506l-48.078-50.68h80.58v50.68h.004z"/>
<path fill="#FFF" d="M22.098 28.189V240.16h116.228l49.358-51.89V78.776l-49.33-50.587H22.097zm68.78 29.63h17.363V206.67H90.877V57.82z"/>
</svg>`;
const exportIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m12 16l-5-5l1.4-1.45l2.6 2.6V4h2v8.15l2.6-2.6L17 11l-5 5Zm-6 4q-.825 0-1.413-.588T4 18v-3h2v3h12v-3h2v3q0 .825-.588 1.413T18 20H6Z"/></svg>';
const refreshIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 20q-3.35 0-5.675-2.325T4 12q0-3.35 2.325-5.675T12 4q1.725 0 3.3.712T18 6.75V4h2v7h-7V9h4.2q-.8-1.4-2.188-2.2T12 6Q9.5 6 7.75 7.75T6 12q0 2.5 1.75 4.25T12 18q1.925 0 3.475-1.1T17.65 14h2.1q-.7 2.65-2.85 4.325T12 20Z"/></svg>';
const toggleIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M17 7H7a5 5 0 0 0-5 5a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5a5 5 0 0 0-5-5m0 8a3 3 0 0 1-3-3a3 3 0 0 1 3-3a3 3 0 0 1 3 3a3 3 0 0 1-3 3Z"/></svg>';
const toggleIconOff = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M17 6H7c-3.31 0-6 2.69-6 6s2.69 6 6 6h10c3.31 0 6-2.69 6-6s-2.69-6-6-6zm0 10H7c-2.21 0-4-1.79-4-4s1.79-4 4-4h10c2.21 0 4 1.79 4 4s-1.79 4-4 4zM7 9c-1.66 0-3 1.34-3 3s1.34 3 3 3s3-1.34 3-3s-1.34-3-3-3z"/></svg>';

