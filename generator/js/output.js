var showCloseButton = true;

function receiveMessage(event) {
    const { style, html, pages, options } = event.data;
    if (typeof html === 'string') {
        showCloseButton = false;
        insertCards(style, html, () => {
            cropMarks(pages, options);
        });
    }
}

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
        
        if (callback) {
            requestAnimationFrame(() => {
                requestAnimationFrame(callback);
            });
        }
    })();
}

window.addEventListener("message", receiveMessage, false);

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