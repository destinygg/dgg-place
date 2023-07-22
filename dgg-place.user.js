// ==UserScript==
// @name         DGG r/place
// @version      0.2.3
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

        const image = document.createElement("img");
        image.style = 'display: none';
        image.onload = () => {
            image.style = `display: block;position: absolute; left: 0; top: 0; width: ${image.width / 3}px; height: ${image.height / 3}px; image-rendering: pixelated; z-index: 1`;
        };

        // Add the image as overlay
        const camera = document.querySelector('garlic-bread-embed').shadowRoot.querySelector('garlic-bread-camera');
        const canvas = camera.querySelector('garlic-bread-canvas');
        canvas.shadowRoot.querySelector('.container').appendChild(image);

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
        // document.body.addEventListener('click', refresh, true); // refresh on click
        // setInterval(refresh, 1000 * 60 * 15); // 15 minute auto refresh

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
                url: `https://rplacecdn.destiny.gg/dgg-place-template-1.png?i=${Date.now()}`,
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
                        // reset image.width and image.height; hide to prevent weird flash of content
                        image.style = 'display: none;width:100%;height:100%;';
                        image.src = e.target.result;
                    }
                    fr.readAsDataURL(blob);
                },
            });
        }


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
            innerhtml: '<img width="48" height="48" src="https://cdn.destiny.gg/img/favicon/favicon-48x48.png" />',
            onclick: () => toggleElement(settingsDiv, 'flex'),
        });

        addElement('button', {
            parent: settingsDiv,
            innerhtml: 'Refresh Template',
            onclick: () => refresh(true),
        });

        addElement('button', {
            parent: settingsDiv,
            innerhtml: 'Toggle Template',
            onclick: () => toggleElement(image),
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
                image.style = 'display: none;width:100%;height:100%;';
                image.src = extTempInput.value;
            },
        });

    }, false);
}

