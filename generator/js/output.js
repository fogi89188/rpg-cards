var showCloseButton = true;
var cardArrangement = 'doublesided';
var positionsSent = false;
var pageRows = 3;
var pageColumns = 3;

function receiveMessage(event) {
    const { style, html, options } = event.data;

    if (typeof html === 'string') {
        showCloseButton = false;
        positionsSent = false;
        if (options) {
            if (options.card_arrangement) {
                cardArrangement = options.card_arrangement;
            }
            if (options.page_rows) {
                pageRows = parseInt(options.page_rows, 10) || 3;
            }
            if (options.page_columns) {
                pageColumns = parseInt(options.page_columns, 10) || 3;
            }
        }
        insertCards(style, html, null);
    }
}

window.addEventListener('message', receiveMessage, false);

function insertCards(style, html, callback) {
    (function waitForBody() {
        if (!document.body){
            requestAnimationFrame(waitForBody);
            return;
        }
        
        while (document.body.hasChildNodes()) {
            document.body.removeChild(document.body.lastChild);
        }
    
        var div = document.createElement("div");
        div.setAttribute("class", "output-container");
        div.id = "output-container";
        div.innerHTML = style + DOMPurify.sanitize(html, { ADD_TAGS: [ 'page'] });
    
        document.body.appendChild(div);
        
        // Auto-fit all card titles
        autofitCardTitles();
        
        // Measure positions after short delay to allow layout
        setTimeout(() => {
            // Only send positions once per card generation
            if (positionsSent) {
                if (callback) callback();
                return;
            }

            const cardPositions = measureCardPositions();
            positionsSent = true;

            // Send back to parent window
            if (window.opener) {
                try {
                    window.opener.postMessage({
                        type: 'cardPositions',
                        cardPositions: cardPositions
                    }, '*');
                } catch(e) {
                    console.error('Failed to send positions:', e);
                }
            }

            if (callback) {
                callback();
            }
        }, 1000);
    })();
}

function measureCardPositions() {
    const positions = [];
    const pageElements = document.querySelectorAll('.page');

    const firstPage = pageElements[0];
    if (!firstPage) {
        return positions;
    }

    const pageZoom = firstPage.querySelector('.page-zoom');
    if (!pageZoom) {
        return positions;
    }

    const pageRect = firstPage.getBoundingClientRect();
    // Get the absolutely positioned wrapper divs (direct children of page-zoom)
    const cardWrappers = pageZoom.querySelectorAll(':scope > div[style*="position"]');
    const pixelsToMm = 25.4 / 96;

    // Maximum number of card slots per page
    const maxCards = pageRows * pageColumns;

    cardWrappers.forEach((wrapper, index) => {
        // Only process up to maxCards positions
        if (positions.length >= maxCards) {
            return;
        }

        const wrapperRect = wrapper.getBoundingClientRect();

        // Skip if wrapper has no size (empty/hidden)
        if (wrapperRect.width === 0 || wrapperRect.height === 0) {
            return;
        }

        const offsetX = (wrapperRect.left - pageRect.left) * pixelsToMm;
        const offsetY = (wrapperRect.top - pageRect.top) * pixelsToMm;
        const width = wrapperRect.width * pixelsToMm;
        const height = wrapperRect.height * pixelsToMm;

        positions.push({
            page: 0,
            cardIndex: positions.length,
            x: offsetX,
            y: offsetY,
            width: width,
            height: height
        });
    });

    return positions;
}

function autofitCardTitles() {
    // Auto-fit all card titles to their containers
    document.querySelectorAll('.card-title').forEach(titleElement => {
        const maxFontSize = 16; // Maximum font size in pixels
        const minFontSize = 8;  // Minimum font size in pixels
        
        // Reset to max size
        titleElement.style.fontSize = maxFontSize + 'px';
        
        // Get the container width (accounting for padding)
        const containerWidth = titleElement.offsetWidth;
        const textWidth = titleElement.scrollWidth;
        
        // If text doesn't fit, scale it down
        if (textWidth > containerWidth) {
            const ratio = containerWidth / textWidth;
            const newSize = Math.max(minFontSize, Math.floor(maxFontSize * ratio));
            titleElement.style.fontSize = newSize + 'px';
        }
    });
}

setTimeout(function(){
    if (showCloseButton) {
        const btn = document.getElementById('close-button');
        if (btn) btn.style.display = 'block';
    }
}, 2000);

function mapIndex_rowReverse(i, colCount) {
    const row = Math.floor(i / colCount);
    const col = i % colCount;

    return row * colCount + (colCount - 1 - col);
}

function mapIndex_column(i, rowCount) {
    const row = i % rowCount;
    const col = Math.floor(i / rowCount);

    return row * Math.ceil(totalItems / rowCount) + col;
}
function mapIndex_columnReverse(i, rowCount, totalItems) {
    const row = i % rowCount;
    const col = Math.floor(i / rowCount);
    const reversedRow = (rowCount - 1) - row;

    return reversedRow * Math.ceil(totalItems / rowCount) + col;
}

function sortByFlexVisualOrder(
    _arr,
    direction,
    colOrRowCount,
) {
    const arr = Array.from(_arr);
    const total = arr.length;

    function mapIndex(i) {
        switch (direction) {
            case "row":
                return i;
            case "row-reverse":
                return mapIndex_rowReverse(i, colOrRowCount);
            case "column":
                return mapIndex_column(i, colOrRowCount, total);
            case "column-reverse":
                return mapIndex_columnReverse(i, colOrRowCount, total);
            default:
                return i;
        }
    }

    return [...arr].sort((a, b) => {
        const ai = mapIndex(arr.indexOf(a));
        const bi = mapIndex(arr.indexOf(b));
        return ai - bi;
    });
}


function showCropMark (mark, card, pag) {
    const element = card.querySelector(`.crop-mark-${mark}`);
    if (element) {
        element.classList.remove('hide');
    }
}

function cropMarks(pages, options) {
    if (!options || !options.crop_marks) {
        return;
    }
    
    const pagesLen = pages.length;
    const cols = Number(options.page_columns);
    const rows = Number(options.page_rows);
    const r_first = 0;
    const c_first = 0;
    const r_last = rows - 1;
    const c_last = cols - 1;
    for(p = 0; p < pagesLen; p++) {
        let i = 0;
        let pag = {
            isBack: options.card_arrangement === "doublesided" && p % 2 === 1,
        }
        pag = {
            ...pag,
            isFront: !pag.isBack,
            bleedWidth: options.back_bleed_width,
            bleedHeight: options.back_bleed_height,
        };

        const collapseCropsCols = !parseFloat(pag.bleedWidth);
        const collapseCropsRows = !parseFloat(pag.bleedHeight);

        let cards = pag.isBack
            ? sortByFlexVisualOrder(document.querySelectorAll(`page:nth-of-type(${p + 1}) .card`), 'row-reverse', cols)
            : [...document.querySelectorAll(`page:nth-of-type(${p + 1}) .card`)];

        for(r = 0; r < rows; r++) {
            for(c = 0, nc = cols - 1; c < cols; c++, nc--) {
                const card = cards[i];
                if (!card) {
                    i++;
                    continue;
                }
                // vertical crop marks
                if (r_first === r) {
                    if (!collapseCropsCols || c === c_first) showCropMark('top-left-v', card, pag);
                    showCropMark('top-right-v', card, pag);
                } else if (r_last === r) {
                    if (!collapseCropsCols || c === c_first) showCropMark('bottom-left-v', card, pag);
                    showCropMark('bottom-right-v', card, pag);
                }
                // horizontal crop marks
                if (c_first === c) {
                    if (!collapseCropsRows || r === r_first) showCropMark('top-left-h', card, pag);
                    showCropMark('bottom-left-h', card, pag);
                } else if (c_last === c) {
                    if (!collapseCropsCols || r === r_first) showCropMark('top-right-h', card, pag);
                    showCropMark('bottom-right-h', card, pag);
                }
                i++;
            }
        }
    }
}