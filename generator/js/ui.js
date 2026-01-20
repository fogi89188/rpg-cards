// Ugly global variable holding the current card deck
var card_data = [];
var card_options = default_card_options();
var app_settings = default_app_settings();
var last_generated_positions = null; // Store card positions from last generation
var output_window = null; // Store reference to output window
var positions_ready = false; // Track whether positions have been received

window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'cardPositions') {
        last_generated_positions = event.data.cardPositions || [];
        positions_ready = last_generated_positions.length > 0;
        ui_toggle_generate_design_button();
    }
}, false);

function default_app_settings() {
    return {
        file_name: 'rpg_cards',
        browser_asks_where_save: false,
        open_save_dialog: false,
        show_download_settings: true,
        page_zoom_keep_ratio: true
    }
}


function swapInputValues(id1, id2) {
    const field1 = getField(id1);
    const field2 = getField(id2);
    if (field1 && field2) {
        const v1 = field1.getData();
        const v2 = field2.getData();
        field1.changeValue(v2);
        field2.changeValue(v1);
    } else {
        const e1 = document.getElementById(id1);
        const e2 = document.getElementById(id2);
        if (e1 && e2) {
            const v1 = e1.value;
            const v2 = e2.value;
            e1.value = v2;
            e1.dispatchEvent(new Event('input'));
            e2.value = v1;
            e2.dispatchEvent(new Event('input'));
        }
    }
}

function ui_generate() {
    if (card_data.length === 0) {
        alert("Your deck is empty. Please define some cards first, or load the sample deck.");
        return;
    }

    positions_ready = false;
    last_generated_positions = null;
    ui_toggle_generate_design_button();

    var { style, html, pages, cardPositions } = card_pages_generate_html(card_data, card_options);
    last_generated_positions = cardPositions;

    output_window = window.open("output.html", 'rpg-cards-output');

    if (!output_window || output_window.closed || typeof output_window.closed === 'undefined') {
        alert(`It looks like your browser blocked the popup window. Please allow popups for this site to continue.`)
        return;
    }

    setTimeout(function () {
        output_window.postMessage({ style, html, pages, options: card_options }, '*');
    }, 500);
}

function ui_generate_design() {
    if (card_data.length === 0) {
        alert("Your deck is empty. Please define some cards first, or load the sample deck.");
        return;
    }
    
    if (!card_options.registration_marks) {
        alert("Silhouette registration marks must be enabled to generate a design file.");
        return;
    }

    if (!positions_ready || !last_generated_positions || last_generated_positions.length === 0) {
        alert("Waiting for card positions to be measured from the output window...\n\nPlease click 'Generate' first to create the card layout. The output window measures actual card positions. Once ready, you can generate the design file.");
        return;
    }

    try {
        var dxfContent = card_generate_silhouette_dxf_from_positions(last_generated_positions, card_options);
        
        // Create and download the DXF file
        var blob = new Blob([dxfContent], { type: 'application/dxf' });
        var url = URL.createObjectURL(blob);
        
        var downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'cards-cutting-template.dxf';
        downloadLink.style.display = 'none';
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        URL.revokeObjectURL(url);
        
        showToast('DXF cutting template downloaded successfully! Import this file into Silhouette Studio for cutting.', 'success');
        
    } catch (error) {
        console.error('Error generating design:', error);
        alert('Error generating design file: ' + error.message);
    }
}

function ui_toggle_generate_design_button() {
    const shouldShow = card_options.registration_marks;
    const buttonGroup = document.getElementById('generate-design-group');
    const button = document.getElementById('button-generate-design');
    
    if (buttonGroup) {
        buttonGroup.style.display = shouldShow ? 'block' : 'none';
    }
    
    // Disable button if positions aren't ready yet
    if (button) {
        button.disabled = !positions_ready;
        if (!positions_ready && shouldShow) {
            button.title = 'Waiting for card positions to be measured. Click Generate first, then wait a moment.';
        } else {
            button.title = '';
        }
    }
}

function ui_load_sample() {
    const firstAddedCardIndex = card_data.length;
    ui_add_cards(card_data_example);
    ui_select_card_by_index(firstAddedCardIndex);
}

function ui_clear_all(enableAsking) {
    if (!card_data.length) {
        return true;
    }
    const proceed = enableAsking && document.getElementById('ask-before-delete').checked ? confirm('Delete all cards?') : true;
    if (proceed) {
        card_data = [];
        ui_update_card_list();
        getField('file-name').reset();
    }
    return proceed;
}

function ui_load_files(evt) {
    const target = evt.target;
    const files = target.files;
    const isOpening = Boolean(evt.target.getAttribute('data-opening'));
    const clearAll = Boolean(evt.target.getAttribute('data-clear-all'));
    const firstAddedCardIndex = card_data.length;

    for (let i = 0; i < files.length; i++) {
        let f = files[i];
        const reader = new FileReader();

        reader.onload = function () {
            const result = (this.result || '').trim();
            if (!result) {
                showToast(`The file ${f.name} is empty.`);
                return;
            }
            try {
                const data = JSON.parse(result);
                
                // Check if new format (object with card_data and card_options) or old format (array)
                let cardsData;
                if (Array.isArray(data)) {
                    // Old format: just card data array
                    cardsData = data;
                } else if (data.card_data) {
                    // New format: object with card_data and card_options
                    cardsData = data.card_data;
                    if (data.card_options) {
                        try {
                            // Restore card_options (page settings)
                            card_options = { ...card_options, ...data.card_options };
                            // Set page values directly since ui_set_page_tab_values may not be defined yet
                            setTimeout(() => {
                                $("#card-size").val(card_options.card_size).change();
                                $("#card-arrangement").val(card_options.card_arrangement).change();
                                $("#page-rows").val(card_options.page_rows).change();
                                $("#page-columns").val(card_options.page_columns).change();
                                $("#back-bleed-width").val(card_options.back_bleed_width).change();
                                $("#back-bleed-height").val(card_options.back_bleed_height).change();
                                $("#page-zoom-width").val(card_options.page_zoom_width);
                                $("#page-zoom-height").val(card_options.page_zoom_height);
                                $("#card-zoom-width").val(card_options.card_zoom_width);
                                $("#card-zoom-height").val(card_options.card_zoom_height);
                                $("#rounded-corners").prop('checked', card_options.rounded_corners);
                            }, 150);
                        } catch (optErr) {
                            console.warn('Could not restore page settings:', optErr);
                        }
                    }
                } else {
                    cardsData = data;
                }
                
                const newData = legacy_card_data(cardsData);
                if (isOpening && clearAll) {
                    ui_clear_all(false);
                }
                ui_add_cards(newData);
                if (isOpening) {
                    getField('file-name').changeValue(f.name.replace(/\.[^/.]+$/, ''));
                } else {
                    ui_select_card_by_index(firstAddedCardIndex);
                }
            } catch (err) {
                console.error(`Error parsing ${f.name}:`, err);
                showToast(`Error parsing ${f.name}:`, 'danger');
            }
        };

        reader.readAsText(f);
    }

    // Reset file input
    $("#file-load-form")[0].reset();
}

function ui_init_cards(data) {
    return legacy_card_data(data);
}

function ui_add_cards(data) {
    const newData = ui_init_cards(data);
    card_data = card_data.concat(newData);
    ui_update_card_list();
    ui_select_card_by_index(0);
    $("#collapseDeck").collapse('toggle');
}

function ui_add_new_card() {
    card_data.push(legacy_card_data([{
        ...default_card_data(),
        title: 'New card',
        icon_back_container: card_options.default_icon_back_container 
    }])[0]);
    ui_update_card_list();
    ui_select_card_by_index(card_data.length - 1);
}

function ui_duplicate_card() {
    var old_card = ui_selected_card();
    if (old_card && card_data.length > 0) {
        var new_card = $.extend({}, old_card);
        card_data.push(new_card);
        new_card.title = new_card.title + " (Copy)";
        new_card.uuid = crypto.randomUUID();
    } else {
        card_data.push({
        ...default_card_data(),
        uuid: crypto.randomUUID(),
        icon_back_container: card_options.default_icon_back_container 
    });
    }
    ui_update_card_list();
    ui_select_card_by_index(card_data.length - 1);
}

function ui_copy_card() {
    const card = ui_selected_card();
    if (card && card_data.length > 0) {
        navigator.clipboard.writeText(JSON.stringify(card, null, 2)).then(function() {
            showToast('Card "' + card.title + '" was copied to the clipboard');
        }, function() {
            showToast('Failure to copy: Check permissions for clipboard or try with another browser');
        });
    }
}

function ui_copy_all_cards() {
    navigator.clipboard.writeText(JSON.stringify(card_data, null, 2)).then(function() {
        showToast('All cards were copied to the clipboard');
    }, function() {
        showToast('Failure to copy: Check permissions for clipboard or try with another browser');
    });
}

function ui_paste_card() {
    navigator.clipboard.readText().then(function(s) {
        try {
            const prev_data_length = card_data.length;
            const pasted_content = JSON.parse(s);
            const content = Array.isArray(pasted_content) ? pasted_content : [pasted_content];
            content.forEach(c => {
                c.uuid = crypto.randomUUID();
                c.title += " (Pasted)";
                card_data.push(c);
            });
            ui_update_card_list();
            ui_select_card_by_index(prev_data_length);
        } catch (e) {
            alert('Could not paste clipboard as card or list of cards.\n' + e);
        }
    }, function() {
        alert('Failure to paste: Check permissions for clipboard or try with another browser')
    })
}

function ui_select_card_by_index(index) {
    $(`#deck-cards-list .radio:nth-child(${index + 1}) input[type="radio"]`).prop('checked', true);
    ui_update_selected_card();
}

function ui_selected_card_index() {
    const $checkedInput = $('#deck-cards-list input[type="radio"]:checked');
    if (!$checkedInput) return -1;
    return $checkedInput.closest('.radio').index();
}

function ui_selected_card() {
    return card_data[ui_selected_card_index()];
}

function ui_delete_card() {
    var index = ui_selected_card_index();
    if (index === -1) return;
    const shouldDelete = document.getElementById('ask-before-delete').checked ? confirm('Delete ' + card_data[index].title + '?') : true;
    if (!shouldDelete) return;
    card_data.splice(index, 1);
    ui_update_card_list();
    ui_select_card_by_index(Math.min(index, card_data.length - 1));
}

function ui_deck_option_text(card) {
    return `${card.count}x ${card.title}`;
}

function ui_update_card_list() {
    $("#total-card-count").text(`Contains ${card_data.length} unique cards, ${card_data.reduce((result, card) => {
        return result + (card?.count || 1) * 1;
    }, 0)} in total.`);

    const $deck = $('#deck-cards-list');
    $deck.children().each(function() {
        const option = this;
        if (!card_data.find(card => card.uuid === option.getAttribute('data-uuid'))) option.remove();
    });

    let i = card_data.length;
    while (i--) {
        var card = card_data[i];
        const $option = $deck.find(`[data-uuid="${card.uuid}"]`);
        if (!$option.length) {
            $deck.prepend(`<div class="radio" data-uuid="${card.uuid}"><label><input type="radio" name="deck-option" value="${i}"> <span class="text">${ui_deck_option_text(card)}</span></label></div>`);
        } else if ($option.index() === i) {
            $option.find('.text').text(ui_deck_option_text(card));
        } else {
            $option.find('.text').text(ui_deck_option_text(card));
            $deck.prepend($option.detach());
        }
    }

    ui_update_selected_card();
}

async function ui_save_file() {
    const data = card_data.map(item => {
        const card = { ...item };
        delete card.uuid;
        return card;
    });
    const saveData = {
        card_data: data,
        card_options: card_options
    };
    const jsonString = JSON.stringify(saveData, null, "  ");
    let filename = app_settings.file_name;
    
    if (window.showSaveFilePicker) {
        if (app_settings.open_save_dialog) {
            if (!app_settings.browser_asks_where_save) {
                try {
                    const options = {
                        suggestedName: filename + '.json',
                        types: [{
                        description: 'File JSON',
                        accept: { 'application/json': ['.json'] }
                        }]
                    };

                    const handle = await showSaveFilePicker(options);
                    const writable = await handle.createWritable();
                    await writable.write(jsonString);
                    await writable.close();
                    const newFilename = handle.name.split('.').slice(0, -1).join('.');
                    if (newFilename !== filename) getField('file-name').changeValue(newFilename);
                    return;
                } catch (err) {
                    if (err.name === 'AbortError') {
                        return;
                    }
                    console.error(err);
                }
            }
        }
    }

    const parts = [jsonString];
    const blob = new Blob(parts, { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = $("#file-save-link")[0];
    a.href = url;
    if (filename) {
        a.download = filename 
        ui_save_file_filename = filename;
        a.click();
    }
    setTimeout(function () { URL.revokeObjectURL(url); }, 500);
}

function ui_update_selected_card() {
    var card = ui_selected_card();
    if (card) {
        $("#card-font-size").val(card.card_font_size);
        $("#card-count").val(card.count);
        $("#card-icon-front").val(card.icon_front);
        $("#card-icon-back").val(card.icon_back);
        $("#card-icon-back-container").val(card.icon_back_container);
        $("#card-icon-back-rotation").val(card.icon_back_rotation);
		$("#card-background").val(card.background_image);
        $("#card-contents").val(card.contents?.join("\n"));
        $("#card-back-double-sided").prop('checked', card.back_double_sided || false);
        $("#card-back-contents").val(card.back_contents || "");
        $("#card-back-font-size").val(card.card_back_font_size);
        $("#header-show-back").val(card.header_show_back || "");
        const showBackFields = card.back_double_sided || false;
        $("#card-back-options-group").toggle(showBackFields);
        $("#card-back-contents-group").toggle(showBackFields);
        $("#card-back-font-size-group").toggle(showBackFields);
        // Hide/show back design options (opposite of text options)
        $(".card-back-design-option").toggle(!showBackFields);
        $("#card-tags").val(card.tags.join(", "));
        getFieldGroup('card').forEach(field => {
            // Use default value if property is undefined/null/empty
            const value = field.getData() ?? field.defaultValue;
            field.changeValue(value, { updateData: false });
        });
    } else {
        $("#card-font-size").val("");
        $("#card-count").val(1);
        $("#card-icon-front").val("");
        $("#card-icon-back").val("");
        $("#card-icon-back-container").val(card_options.default_icon_back_container);
        $("#card-icon-back-rotation").val("");
		$("#card-background").val("");
        $("#card-contents").val("");
        $("#card-back-double-sided").prop('checked', false);
        $("#card-back-contents").val("");
        $("#card-back-font-size").val("");
        $("#header-show-back").val("");
        $("#card-back-options-group").hide();
        $("#card-back-contents-group").hide();
        $("#card-back-font-size-group").hide();
        $("#card-tags").val("");
        getFieldGroup('card').forEach(field => field.reset());
    }

    // Update field visibility based on dropdown selections
    if (typeof toggleFieldVisibility === 'function') {
        toggleFieldVisibility();
    }

    ui_render_selected_card();
    ui_update_card_actions();
}

function ui_filter_selected_card_title() {
    const filterInput = document.querySelector('#deck-cards-list-title-filter');
    const filterValue = filterInput.value;
    const re = new RegExp(filterValue, 'i');
    document.querySelectorAll('#deck-cards-list .radio').forEach(option => {
        option.style.display = re.test(option.textContent) ? '' : 'none';
    });
}

function search_clear_button_init(button) {
    button.disabled = true;
    button.style.cursor = 'default';

    const buttonLabel = document.createElement('span');
    buttonLabel.style.visibility = 'hidden';
    buttonLabel.innerHTML = '&times;';
    button.appendChild(buttonLabel);

    const input = button.closest('.input-group').querySelector('input[type="search"]');
    input.addEventListener('input', event => {
        button.disabled = !input.value;
        buttonLabel.style.visibility = input.value ? '' : 'hidden';
    })

    button.addEventListener('click', event => {
        input.focus();
        input.value = '';
        input.dispatchEvent(new Event('input'));
        input.dispatchEvent(new Event('change'));
    });
}

function ui_update_card_actions() {
    var action_groups = {};
    for (var function_name in card_action_info) {
        var info = card_action_info[function_name];
        if (!action_groups[info.category]) {
            action_groups[info.category] = [];
        }
        action_groups[info.category].push(function_name);
    }

    var parent = $('#card-actions');
    parent.empty();

    for (var group_name in action_groups) {
        var group_div = $('<div class="action-group"></div>');
        group_div.append($('<h4>' + group_name + '</h4>'));
        var actions = action_groups[group_name];
        for (var i = 0; i < actions.length; ++i) {
            var function_name = actions[i];
            var info = card_action_info[function_name];
            var action_name = info.example.split(" ")[0];

            var button = $('<button type="button" class="btn btn-default btn-sm action-button">' + action_name + '</button>');
            button.attr('title', info.summary);
            button.attr('data-function-name', function_name);
            button.click(function () {
                var contents = $('#card-contents');
                var contentsTextarea = contents[0];
                var function_name = $(this).attr('data-function-name');
                var info = card_action_info[function_name] || {
                    summary: 'Missing summary',
                    example: action_name
                };
                insertTextAtCursor(contentsTextarea, info.example);
                contents.trigger("change");
            });
            group_div.append(button);
        }
        parent.append(group_div);
    }
}

function ui_render_selected_card() {
    var card = ui_selected_card();
    $('#preview-container').empty();
    if (card) {
        var front = card_generate_front(card, card_options, { isPreview: true });
        var back = card_generate_back(card, card_options, { isPreview: true });
        $('#preview-container').html(DOMPurify.sanitize(front + "\n" + back));
        
        // Auto-fit title text after rendering
        setTimeout(() => {
            ui_autofit_titles();
        }, 0);
    }
    local_store_save();
}

function ui_autofit_titles() {
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

function ui_open_help() {
    $("#help-modal").modal('show');
}

function ui_select_icon() {
    window.open("http://game-icons.net/", "_blank");
}

function ui_page_rotate($event) {
    $event.preventDefault();
    swapInputValues('page-width', 'page-height');
}

function ui_card_rotate($event) {
    $event.preventDefault();
    swapInputValues('card-width', 'card-height');
}

function ui_grid_rotate($event) {
    $event.preventDefault();
    swapInputValues('page-rows', 'page-columns');
}

function ui_zoom_rotate($event) {
    $event.preventDefault();
    swapInputValues('page-zoom-width', 'page-zoom-height');
    swapInputValues('card-zoom-width', 'card-zoom-height');
}

function ui_zoom_100($event) {
    const keepRatio = app_settings.page_zoom_keep_ratio;
    if (keepRatio) app_settings.page_zoom_keep_ratio = false;
    $("#page-zoom-width").val(100).trigger('input');
    $("#page-zoom-height").val(100).trigger('input');
    if (keepRatio) app_settings.page_zoom_keep_ratio = true;
}

function ui_back_bleed_rotate($event) {
    $event.preventDefault();
    swapInputValues('back-bleed-width', 'back-bleed-height');
}

function ui_change_option() {
    var property = $(this).attr("data-option");
    var value;
    if ($(this).attr('type') === 'checkbox') {
        value = $(this).is(':checked');
    } else {
        value = $(this).val();
    }
    switch (property) {
        case 'card_size': {
            card_options[property] = value;
            // Only update width/height if a preset is selected
            // If value is empty (custom size), preserve existing width/height
            if (value) {
                let w, h;
                [w, h] = value.split(',');
                var width = '', height = '';
                var landscape = isLandscape(w, h);
                if (landscape) {
                    width = h;  height = w;
                } else {
                    width = w;  height = h;
                }
                card_options['card_width'] = width;
                card_options['card_height'] = height;
                $('#card-width').val(width).trigger("input");
                $('#card-height').val(height).trigger("input");
                if (card_options['page_zoom_width'] === '100' && card_options['page_zoom_height'] === '100') {
                    $('#card-zoom-width').val(width);
                    $('#card-zoom-height').val(height);
                } else {
                    $('#card-zoom-width').trigger('input');
                }
            }
            break;
        }
        case 'card_width':
        case 'card_height': {
            card_options[property] = value;
            var width = card_options['card_width'];
            var height = card_options['card_height'];
            ui_set_value_to_format(document.getElementById('card-size'), width, height);
            ui_set_card_custom_size(width, height);
            ui_set_orientation_info('card-orientation', width, height);
            if (card_options['page_zoom_width'] === '100' && card_options['page_zoom_height'] === '100') {
                $('#card-zoom-width').val(width);
                $('#card-zoom-height').val(height);
            } else {
                $('#card-zoom-width').trigger('input');
            }
            break;
        }
        case 'page_zoom_width':
        case 'page_zoom_height':
        case 'card_zoom_width':
        case 'card_zoom_height': {
            const setVal = (k, v, property) => {
                if (k === property) {
                    card_options[k] = value;
                } else {
                    const val = math_format(v);
                    card_options[k] = val;
                    $(`#${k.replace(/_/g, '-')}`).val(val);
                }
            }
            const cardWidth = card_options['card_width'];
            const cardHeight = card_options['card_height'];
            const r = math_eval(`${cardWidth} / ${cardHeight}`);
            if (r) {
                let percWidth;
                let percHeight;
                let sizeWidth;
                let sizeHeight;
                const keepRatio = app_settings.page_zoom_keep_ratio;
                if (property === 'page_zoom_width') {
                    percWidth = value;
                    percHeight = keepRatio ? percWidth : card_options['page_zoom_height'];
                } else if (property === 'page_zoom_height') {
                    percHeight = value;
                    percWidth = keepRatio ? percHeight : card_options['page_zoom_width'];
                } else if (property === 'card_zoom_width') {
                    sizeWidth = value;
                    sizeHeight = keepRatio ? math_eval(`${sizeWidth} / ${r}`) : card_options['card_zoom_height'];
                } else if (property === 'card_zoom_height') {
                    sizeHeight = value;
                    sizeWidth = keepRatio ? math_eval(`${sizeHeight} * ${r}`) : card_options['card_zoom_width'];
                }
                if (isNil(percWidth)) {
                    percWidth = math_eval(`${sizeWidth} / ${cardWidth} * 100`);
                    percHeight = math_eval(`${sizeHeight} / ${cardHeight} * 100`);
                } else {
                    sizeWidth = math_eval(`${cardWidth} * ${percWidth} / 100`);
                    sizeHeight = math_eval(`${cardHeight} * ${percHeight} / 100`);
                }
                setVal('page_zoom_width', percWidth, property);
                setVal('page_zoom_height', percHeight, property);
                setVal('card_zoom_width', sizeWidth, property);
                setVal('card_zoom_height', sizeHeight, property);
            }
            break;
        }
        default: {
            card_options[property] = value;
            break;
        }
    }
    ui_render_selected_card();
}

function ui_set_value_to_format(selectorId, width, height) {
    var selector = typeof selectorId === 'string' ? document.getElementById(selectorId) : selectorId;
    var len = selector.options.length;
    var portrait = "", landscape = "", format = "", o = null;
    for(var i = 0; i < len; i++) {
        o = selector.options[i];
        portrait = [width, height].join(',');
        if (o.value === portrait) { format = portrait; break; }
        landscape = [height, width].join(',');
        if (o.value === landscape) { format = landscape; break; }
    }
    selector.value = format;
}

function ui_set_orientation_info(elementId, cssWidth, cssHeight) {
    var orientation = getOrientation(cssWidth, cssHeight);
    document.getElementById(elementId).textContent = orientation;
    return orientation;
}

function ui_move_top() {
    var idx = ui_selected_card_index();
    if (idx === -1) return;
    card_data.unshift(card_data.splice(idx, 1)[0]);
    ui_update_card_list();
    ui_select_card_by_index(0);
}

function ui_move_bottom() {
    var idx = ui_selected_card_index();
    if (idx === -1) return;
    card_data.push(card_data.splice(idx, 1)[0]);
    ui_update_card_list();
    ui_select_card_by_index(card_data.length - 1);
}

function ui_move_up() {
    var idx = ui_selected_card_index();
    if (idx === -1) return;
    if (idx > 0) {
        [card_data[idx], card_data[idx - 1]] = [card_data[idx - 1], card_data[idx]];
        ui_update_card_list();
        ui_select_card_by_index(idx - 1);
    }
}

function ui_move_down() {
    var idx = ui_selected_card_index();
    if (idx === -1) return;
    if (idx < card_data.length - 1) {
        [card_data[idx], card_data[idx + 1]] = [card_data[idx + 1], card_data[idx]];
        ui_update_card_list();
        ui_select_card_by_index(idx + 1);
    }
}

function ui_change_card_count() {
    var count = $("#card-count").val();
    var card = ui_selected_card();
    if (card) {
        card.count = count;
        $('#deck-cards-list .radio:has(input[type="radio"]:checked) .text').text(ui_deck_option_text(card));
        ui_update_card_list();
    }
}

function ui_change_card_property() {
    var property = $(this).attr("data-property");
    var value = $(this).val();
    var card = ui_selected_card();
    if (card) {
        card[property] = value;
        ui_render_selected_card();
    }
}

function ui_set_card_custom_size(width, height) {
    var card = ui_selected_card();
    if (card) {
        card.card_width = width;
        card.card_height = height;
        ui_render_selected_card();
    }
}

function ui_change_default_icon_front() {
    var value = $(this).val();
    card_options.default_icon_front = value;
    ui_render_selected_card();
}

function ui_change_default_icon_back() {
    var value = $(this).val();
    card_options.default_icon_back = value;
    ui_render_selected_card();
}

function ui_change_default_icon_back_rotation() {
    var value = $(this).val();
    card_options.default_icon_back_rotation = value;
    ui_render_selected_card();
}

function ui_change_default_icon_back_container() {
    var value = $(this).val();
    card_options.default_icon_back_container = value;
    ui_render_selected_card();
}

function ui_change_card_contents() {
    var html = $(this).val();
    var card = ui_selected_card();
    if (card) {
        card.contents = html.split("\n");
        ui_render_selected_card();
    }
}

function ui_change_card_contents_keyup () {
    clearTimeout(ui_change_card_contents_keyup.timeout);
    ui_change_card_contents_keyup.timeout = setTimeout(function () {
        $('#card-contents').trigger('change');
    }, 200);
}
ui_change_card_contents_keyup.timeout = null;

function ui_change_card_tags() {
    var value = $(this).val();

    var card = ui_selected_card();
    if (card) {
        if (value.trim().length === 0) {
            card.tags = [];
        } else {
            card.tags = value.split(",").map(function (val) {
                return val.trim().toLowerCase();
            });
        }
        ui_render_selected_card();
    }
}

function ui_change_default_icon_size() {
    card_options.icon_inline = $(this).is(':checked');
    ui_render_selected_card();
}

function ui_change_default_card_font_size() {
    card_options.default_card_font_size = $(this).val();
    ui_render_selected_card();
}

function ui_change_default_card_background() {
    card_options.default_background_image = $(this).val();
    ui_render_selected_card();
}

function ui_sort() {
    $("#sort-modal").modal('show');
}

function ui_sort_execute() {
    $("#sort-modal").modal('hide');

    var fn_code = $("#sort-function").val();
    var fn = new Function("card_a", "card_b", fn_code);

    card_data = card_data.sort(function (card_a, card_b) {
        var result = fn(card_a, card_b);
        return result;
    });

    ui_update_card_list();
}

function ui_filter() {
    $("#filter-modal").modal('show');
}

function ui_filter_execute() {
    $("#filter-modal").modal('hide');

    var fn_code = $("#filter-function").val();
    var fn = new Function("card", fn_code);

    card_data = card_data.filter(function (card) {
        var result = fn(card);
        if (result === undefined) return true;
        else return result;
    });

    ui_update_card_list();
}

function ui_download_card(face = 'front') {
    const selectedCard = ui_selected_card();
    if (!selectedCard) {
        alert('Please select a card to download');
        return;
    }

    const previewContainer = document.getElementById('preview-container');
    if (!previewContainer) {
        alert('No preview container found');
        return;
    }

    const cardElement = face === 'back'
        ? previewContainer.children[previewContainer.children.length - 1]
        : previewContainer.children[0];

    if (!cardElement) {
        alert(`No card ${face} preview available`);
        return;
    }

    const buttonId = face === 'back' ? 'button-download-card-back' : 'button-download-card-front';
    const button = document.getElementById(buttonId);
    const originalText = button.innerHTML;
    button.innerHTML = '<span class="glyphicon glyphicon-hourglass"></span> Generating...';
    button.disabled = true;

    // Wait for fonts to be fully loaded
    document.fonts.ready.then(() => {
        // Use modern-screenshot with proper configuration
        modernScreenshot.domToPng(cardElement, {
            scale: 2.5,
            debug: false,
            onCloneNode: (clonedNode) => {
                // Ensure fonts are applied to cloned node
                if (clonedNode.style) {
                    const computedStyle = window.getComputedStyle(cardElement);
                    clonedNode.style.fontFamily = computedStyle.fontFamily;
                }
            }
        }).then((dataUrl) => {
            const link = document.createElement('a');
            const cardName = selectedCard.title || 'card';
            const sanitizedName = cardName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            link.download = `${sanitizedName}_${face}.png`;
            link.href = dataUrl;
            link.click();

            button.innerHTML = originalText;
            button.disabled = false;
        }).catch(error => {
            console.error('Error generating card image:', error);
            alert('Failed to generate card image. Please try again.');
            button.innerHTML = originalText;
            button.disabled = false;
        });
    });
}

function ui_apply_default_property(cardProperty, defaultProperty) {
    card_data.forEach(card => {
        card[cardProperty] = card_options[defaultProperty];
    });
    ui_update_selected_card();
}

function ui_apply_default_color_front() {
    ui_apply_default_property('color_front', 'default_color_front');
}

function ui_apply_default_color_back() {
    ui_apply_default_property('color_back', 'default_color_back');
}

function ui_apply_default_title_color() {
    ui_apply_default_property('title_color', 'default_title_color');
}

function ui_apply_default_font_card() {
    ui_apply_default_property('card_font_size', 'default_card_font_size');
}

function ui_apply_default_icon_front() {
    ui_apply_default_property('icon_front', 'default_icon_front');
}

function ui_apply_default_icon_back() {
    ui_apply_default_property('icon_back', 'default_icon_back');
}

function ui_apply_default_icon_back_container() {
    ui_apply_default_property('icon_back_container', 'default_icon_back_container');
}

function ui_apply_default_icon_back_rotation() {
    ui_apply_default_property('icon_back_rotation', 'default_icon_back_rotation');
}

function ui_apply_default_card_background() {
    ui_apply_default_property('background_image', 'default_background_image');
}

function local_store_save () {
    function save() {
       if(window.localStorage){
            const card_data_to_save = card_data.map(c => {
                const card = { ...c };
                delete card.uuid;
                return card;
            });
            try {
                localStorage.setItem('card_data', JSON.stringify(card_data_to_save));
                localStorage.setItem('card_options', JSON.stringify(card_options));
                localStorage.setItem('app_settings', JSON.stringify(app_settings));
            } catch (e){
                if (e.name === 'QuotaExceededError' || e.code === 22) {
                    const dataSize = JSON.stringify(card_data_to_save).length;
                    const quotaMB = (dataSize / 1024 / 1024).toFixed(2);

                    showToast(
                        `Storage limit exceeded (${quotaMB} MB). Your cards are too large to auto-save. ` +
                        `Please use the "Save" button to download your cards as a file instead.`,
                        'danger',
                        10000
                    );

                    try {
                        localStorage.removeItem('card_data');
                        localStorage.setItem('card_options', JSON.stringify(card_options));
                        localStorage.setItem('app_settings', JSON.stringify(app_settings));
                    } catch (cleanupError) {
                        console.error('Failed to save even minimal data:', cleanupError);
                    }
                } else {
                    console.error('Failed to save to localStorage:', e);
                }
            }
        }
    }
    local_store_save = debounce(save, 500);
    return local_store_save.apply(this, arguments);
}

function legacy_card_data(oldData = []) {
    const newData = oldData?.map(oldCard => {
        const card = card_init({ ...oldCard });
        if (!isNil(card.icon)) {
            card.icon_front = card.icon;
            delete card.icon;
        }
        if (!isNil(card.color)) {
            card.color_front = card.color;
            card.color_back = '';
            delete card.color;
        }
        if (isNil(card.icon_back_container)) {
            card.icon_back_container = 'rounded-square';
        }
        if (isNil(card.uuid)) {
            card.uuid = crypto.randomUUID();
        }
        return card;
    });
    return newData;
}

function legacy_card_options(data = {}) {
    const newData = {
        ...default_card_options(),
        ...data
    };
    if (!isNil(newData.page_zoom)) {
        newData.page_zoom_width = newData.page_zoom;
        newData.page_zoom_height = newData.page_zoom;
        delete newData.page_zoom;
    }
    return newData;
}

function legacy_app_settings(data = {}) {
    return {
        ...default_app_settings(),
        ...data
    };
}

function local_store_load() {
    if(window.localStorage){
        try {
            const storedCards = JSON.parse(localStorage.getItem("card_data"));
            if (storedCards) {
                card_data = legacy_card_data(storedCards)
            }
            const storedOptions = JSON.parse(localStorage.getItem("card_options"));
            if (storedOptions) {
                card_options = legacy_card_options(storedOptions);
            }
            const storedSettings = JSON.parse(localStorage.getItem("app_settings"));
            if (storedSettings) {
                app_settings = legacy_app_settings(storedSettings);
            }
        } catch (e){
            showToast('Error loading from localStorage', 'danger');
            console.error('Failed to load from localStorage:', e);
        }
    }
}

function showToast(message, type = 'info', duration = 5000) {
  // Create toast element with animation class
  var toastDiv = $('<div class="alert alert-' + type + ' alert-dismissible toast-animate" role="alert" style="min-width: 250px; margin-top: 10px;">' +
                     '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
                       '<span aria-hidden="true">&times;</span>' +
                     '</button>' +
                     message +
                   '</div>');

    $('#toast-container').append(toastDiv);

  // Auto-dismiss after duration
  setTimeout(function () {
    toastDiv.alert('close');
  }, duration);
}

function ui_download_settings_toggle(event) {
    $('#download-settings-opened,#download-settings-closed').toggleClass('hidden');
    app_settings.show_download_settings = event.target.id === ('download-settings-show');
    local_store_save();
}

function ui_zoom_keep_ratio(event) {
    app_settings.page_zoom_keep_ratio = event.target.checked;
    local_store_save();
}

$(document).ready(function () {
    parse_card_actions().then(function () {
        local_store_load();

    // accordion panel collapse fix
    $('#accordion .panel-collapse').on('show.bs.collapse', function(event){
        $('#accordion .panel-collapse').not(event.target).collapse('hide');
    });

    if (!window.showSaveFilePicker) {
        $('#download-settings-available,#download-settings-unavailable').toggleClass('hidden');
    }

    if (app_settings.show_download_settings) {
        $('#download-settings-opened').removeClass('hidden');
    } else {
        $('#download-settings-closed').removeClass('hidden');
    }

    $('#download-settings-show,#download-settings-hide').click(ui_download_settings_toggle);

    $('#danger-zone-show,#danger-zone-hide').click(() => {
        $('#danger-zone-opened,#danger-zone-closed').toggleClass('hidden');
    });

    $('#clear-all').on('click', () => {
        if (confirm('Delete all saved data?\n\nThis will reset the entire app to its original state and erase all saved cards and settings.\n\nMake sure you’ve downloaded your cards before continuing.')) {
            localStorage.clear();
            window.location.reload();
        }
    });

    function ui_set_default_tab_values(options) {
        $("#default-icon-front").val(options.default_icon_front_container);
        $("#default-icon-back").val(options.default_icon_back);
        $("#default-icon-back-container").val(options.default_icon_back_container).trigger("change");
        $("#default-card-font-size").val(options.default_card_font_size);
    	$("#default-card-background").val(options.default_background_image);
    }

    function ui_set_page_tab_values(options) {
       $("#card-size").val(options.card_size);
       $("#card-size").change();
       // Restore custom card dimensions after the dropdown change event
       // This ensures custom values are preserved when loading from localStorage
       $("#card-width").val(options.card_width).trigger("input");
       $("#card-height").val(options.card_height).trigger("input");
       $("#card-arrangement").val(options.card_arrangement).change();
       $("#page-rows").val(options.page_rows).change();
       $("#page-columns").val(options.page_columns).change();
       $("#back-bleed-width").val(options.back_bleed_width).change();
       $("#back-bleed-height").val(options.back_bleed_height).change();
       $("#page-zoom-keep-ratio").prop('checked', app_settings.page_zoom_keep_ratio);
       $("#page-zoom-width").val(options.page_zoom_width);
       $("#page-zoom-height").val(options.page_zoom_height);
       $("#card-zoom-width").val(options.card_zoom_width);
       $("#card-zoom-height").val(options.card_zoom_height);
       $("#rounded-corners").prop('checked', options.rounded_corners);
    }

    function ui_reset_group_tab_values(group) {
        if (!confirm('Reset the current tab\'s value?')) return;
        getFieldGroup(group).forEach(field => field.reset());
        if(group === 'page') {
            ui_set_page_tab_values(default_card_options());
        } else if (group === 'default') {
            ui_set_default_tab_values(default_card_options());
        }
    }
    
    UI_FIELDS_CONFIGURATION_PREPARE.forEach((prepareGroupConfig, key) => {
        UI_FIELDS_CONFIGURATION.set(key, prepareGroupConfig());
    });
    UI_FIELDS_CONFIGURATION.forEach(groupConfig => groupConfig.forEach(initField));

    ui_set_page_tab_values(card_options);
    ui_set_default_tab_values(card_options);

    $('#default-icon-front').val(card_options.default_icon_front);
    $('#default-icon-back').val(card_options.default_icon_back);
    $('#default-card-font-size').val(card_options.default_card_font_size);

    $('.icon-list').typeahead({
        source: icon_names,
        items: 'all',
        render: function (items) {
          var that = this;

          items = $(items).map(function (i, item) {
            i = $(that.options.item).data('value', item);
            i.find('a').html(that.highlighter(item));
            var classname = 'icon-' + item.split(' ').join('-').toLowerCase();
            i.find('a').append('<span class="' + classname + '"></span>');
            return i[0];
          });

          if (this.autoSelect) {
            items.first().addClass('active');
          }
          this.$menu.html(items);
          return this;
        }
    });

    $("#button-generate").click(ui_generate);
    $("#button-generate-design").click(ui_generate_design);
    $("#button-load").click(function () {
        $("#file-load").attr({
            'data-opening': '',
            'data-clear-all': '',
        }).click();
    });
    $("#button-open").click(function () {
        if (card_data.length && document.getElementById('ask-before-delete').checked) {
            if (!confirm('This will delete all cards.\nAre you sure?')) return;
        }
        $("#file-load").attr({
            'data-opening': '1',
            'data-clear-all': '1',
        }).click();
    });
    $("#file-load").change(ui_load_files);
    $("#button-clear").click(function () { ui_clear_all(true); });
    $("#button-load-sample").click(ui_load_sample);
    $("#button-save").click(ui_save_file);
    $("#button-sort").click(ui_sort);
    $("#button-filter").click(ui_filter);
    $("#button-download-card-front").click(() => ui_download_card('front'));
    $("#button-download-card-back").click(() => ui_download_card('back'));
    $("#button-add-card").click(ui_add_new_card);
    $("#button-duplicate-card").click(ui_duplicate_card);
    $("#button-delete-card").click(ui_delete_card);
    $("#button-copy-card").click(ui_copy_card);
    $("#button-copy-all").click(ui_copy_all_cards);
    $("#button-paste-card").click(ui_paste_card);
    $("#button-help").click(ui_open_help);
    $("#button-apply-default-color-front").click(ui_apply_default_color_front);
    $("#button-apply-default-color-back").click(ui_apply_default_color_back);
    $("#button-apply-default-title-color").click(ui_apply_default_title_color);
    $("#button-apply-default-font-card").click(ui_apply_default_font_card);
    $("#button-apply-default-icon-front").click(ui_apply_default_icon_front);
    $("#button-apply-default-icon-back").click(ui_apply_default_icon_back);
    $("#button-apply-default-icon-back-container").click(ui_apply_default_icon_back_container);
    $("#button-apply-default-icon-back-rotation").click(ui_apply_default_icon_back_rotation);
    $("#button-apply-default-card-background").click(ui_apply_default_card_background);

    $("#deck-cards-list").change(ui_update_selected_card);
    $("#deck-cards-list-title-filter").on('input', ui_filter_selected_card_title);
    $('.search-clear-btn').each(function(){search_clear_button_init(this)});
    // $("#deck-cards-list-title-filter-clear").click(ui_filter_selected_card_title_clear);

    $("#card-font-size").change(ui_change_card_property);
    $("#card-back-font-size").change(ui_change_card_property);
    $("#card-icon-front").change(ui_change_card_property);
    $("#card-count").change(ui_change_card_count);
    $("#card-icon-back").change(ui_change_card_property);
    $("#card-icon-back-container").change(ui_change_card_property);
    $("#card-icon-back-rotation").change(ui_change_card_property);
	$("#card-background").change(ui_change_card_property);
    $("#card-contents").change(ui_change_card_contents);
    $("#card-back-contents").change(function() {
        const card = ui_selected_card();
        if (card) {
            card.back_contents = $(this).val();
            ui_render_selected_card();
        }
    });
    $("#card-back-contents").keyup(function() {
        clearTimeout($(this).data('timeout'));
        const timeout = setTimeout(() => {
            const card = ui_selected_card();
            if (card) {
                card.back_contents = $(this).val();
                ui_render_selected_card();
            }
        }, 200);
        $(this).data('timeout', timeout);
    });
    $("#card-tags").change(ui_change_card_tags);

    $("#card-contents").keyup(ui_change_card_contents_keyup);

    $("#page-size").change(function() {
        const page_size = $(this).val();
        if (page_size) {
            const [w, h] = page_size.split(',');
            const { page_width, page_height } = card_options;
            if (isLandscape(page_width, page_height)) {
                card_options.page_width = h;
                card_options.page_height = w;
                $("#page-width").val(h);
                $("#page-height").val(w);
            } else {
                card_options.page_width = w;
                card_options.page_height = h;
                $("#page-width").val(w);
                $("#page-height").val(h);
            }
            ui_set_orientation_info('page-orientation', card_options.page_width, card_options.page_height);
        }
        card_options.page_size = page_size;
    });
    $("#page-width").on("input", function() {
        const page_width = $(this).val();
        card_options.page_width = page_width;
        const { page_height } = card_options;
        ui_set_value_to_format('page-size', page_width, page_height);
        ui_set_orientation_info('page-orientation', page_width, page_height);
    });
    $("#page-height").on("input", function() {
        const page_height = $(this).val();
        card_options.page_height = page_height;
        const { page_width } = card_options;
        ui_set_value_to_format('page-size', page_width, page_height);
        ui_set_orientation_info('page-orientation', page_width, page_height);
    });
    $("#page-rotate").click(ui_page_rotate);
    $("#page-rows").change(ui_change_option);
    $("#page-columns").change(ui_change_option);
    $("#page-zoom-width").on("input", ui_change_option);
    $("#page-zoom-height").on("input", ui_change_option);
    $("#page-zoom-rotate").click(ui_zoom_rotate);
    $("#page-zoom-keep-ratio").change(ui_zoom_keep_ratio);
    $('#page-zoom-100').click(ui_zoom_100);
    $("#card-zoom-width").on("input", ui_change_option);
    $("#card-zoom-height").on("input", ui_change_option);
    $("#card-zoom-rotate").click(ui_zoom_rotate);
    $("#grid-rotate").click(ui_grid_rotate);
    $("#card-arrangement").change(ui_change_option);
    $("#card-width").on("input", ui_change_option);
    $("#card-height").on("input", ui_change_option);
    $("#card-size").change(ui_change_option).trigger("change");
    $("#card-rotate").click(ui_card_rotate);
    $("#background-color").change(ui_change_option);
    $("#rounded-corners").change(ui_change_option);
    $("#crop-marks").change(ui_change_option);
    $("#registration-marks").change(function() {
        ui_change_option.call(this);
        ui_toggle_generate_design_button();
    });
    $("#back-bleed-width").on("input", ui_change_option);
    $("#back-bleed-height").on("input", ui_change_option);
    $("#back-bleed-rotate").click(ui_back_bleed_rotate);

    $("#default-icon-front").change(ui_change_default_icon_front);
    $("#default-icon-back").change(ui_change_default_icon_back)
    $("#default-icon-back-rotation").change(ui_change_default_icon_back_rotation);
    $("#default-icon-back-container").change(ui_change_default_icon_back_container);
    $("#default-card-font-size").change(ui_change_default_card_font_size);
    $("#default-card-background").change(ui_change_default_card_background);

    $("#small-icons").change(ui_change_default_icon_size);
    $("#reset-default-tab-values").click(()=>ui_reset_group_tab_values('default'));
    $("#reset-page-tab-values").click(()=>ui_reset_group_tab_values('page'));

    $(".icon-select-button").click(ui_select_icon);

    $("#sort-execute").click(ui_sort_execute);
    $("#filter-execute").click(ui_filter_execute);

    $("#button-move-top").click(ui_move_top);
    $("#button-move-bottom").click(ui_move_bottom);
    $("#button-move-up").click(ui_move_up);
    $("#button-move-down").click(ui_move_down);
    
    // Auto Bold button handlers
    $("#auto-bold-btn").click(() => applyAutoBoldGeneric('card-contents'));
    $("#auto-bold-back-btn").click(() => applyAutoBoldGeneric('card-back-contents'));
    
    // Auto Size Text button handlers
    $("#auto-size-text-btn").click(() => applyAutoSizeTextGeneric('card-contents', 'card_font_size', 'card-font-size', 'front'));
    $("#auto-size-text-back-btn").click(() => applyAutoSizeTextGeneric('card-back-contents', 'card_back_font_size', 'card-back-font-size', 'back'));
    
    // Double sided back checkbox handler
    $("#card-back-double-sided").change(function() {
        const isChecked = $(this).is(':checked');
        const card = ui_selected_card();
        if (card) {
            card.back_double_sided = isChecked;
        }
        // Show/hide text content options
        $("#card-back-options-group").toggle(isChecked);
        $("#card-back-contents-group").toggle(isChecked);
        $("#card-back-font-size-group").toggle(isChecked);
        // Hide/show back design options (opposite of text options)
        $(".card-back-design-option").toggle(!isChecked);
        ui_render_selected_card();
    });
    
    // Back header show/hide handler
    $("#header-show-back").change(ui_change_card_property);

    ui_update_card_list();
    ui_toggle_generate_design_button(); // Initialize Generate Design button visibility
    });
});

function applyAutoBoldGeneric(textareaId) {
    const contentsTextarea = document.getElementById(textareaId);
    if (!contentsTextarea) {
        console.log('Contents textarea not found');
        return;
    }
    
    let text = contentsTextarea.value;
    const originalText = text;
    
    if (typeof autoBoldRules === 'undefined') {
        console.error('autoBoldRules is not defined');
        alert('Auto Bold rules not loaded. Please refresh the page.');
        return;
    }
    
    const lines = text.split('\n');
    let changed = false;

    const processedLines = lines.map(function(line) {
        const originalLine = line;

        line = line.replace(/<\/?b>/gi, '');

        // Skip processing for lines starting with "subtitle |"
        if (/^subtitle\s*\|/i.test(line)) {
            return line;
        }

        autoBoldRules.forEach(function(rule) {
            line = line.replace(rule.pattern, rule.replacement);
        });

        line = line.replace(/<\/b><b>/gi, '');
        line = line.replace(/<\/b>\s+<b>/gi, ' ');
        line = line.replace(/^<\/b>\s*/i, '');
        line = line.replace(/\s*<b>$/i, '');
        line = line.replace(/<b>\s*<\/b>/gi, '');
        
        do {
            var before = line;
            line = line.replace(/<b[^>]*>((?:[^<]|\n|<(?!b\b)[^>]*>)*?)<b[^>]*>((?:[^<]|\n|<(?!b\b)[^>]*>)*?)<\/b>((?:[^<]|\n|<(?!b\b)[^>]*>)*?)<\/b>/gi, '$1$2$3');
        } while (line !== before);

        if (line !== originalLine) changed = true;

        return line;
    });
    
    text = processedLines.join('\n');
    if (text !== originalText) {
        contentsTextarea.value = text;
        $(contentsTextarea).trigger('change');
        showToast('Auto-bold applied successfully!', 'success');
    } else {
        showToast('No formatting changes needed.', 'info');
    }
}

// Auto Bold functionality - kept for backwards compatibility
function applyAutoBold() {
    applyAutoBoldGeneric('card-contents');
}

function applyAutoSizeTextGeneric(textareaId, cardPropertyName, inputId, side = 'front') {
    const card = ui_selected_card();
    const contentsTextarea = document.getElementById(textareaId);
    const fontSizeInput = document.getElementById(inputId);
    const previewContainer = document.getElementById('preview-container');
    
    if (!card) {
        showToast('No card selected.', 'warning');
        return;
    }
    
    if (!contentsTextarea || !contentsTextarea.value.trim()) {
        showToast('No content to size.', 'warning');
        return;
    }
    
    if (!fontSizeInput || !previewContainer) {
        showToast('Required elements not found.', 'error');
        return;
    }
    
    const originalFontSize = card[cardPropertyName] || card_options.default_card_font_size || '';
    const MIN_SIZE = 6;
    const MAX_SIZE = 16;
    const STEP = 0.1;
    const TOLERANCE = 2;
    const MAX_ITERATIONS = 20;
    
    function isContentOverflowing(fontSize) {
        card[cardPropertyName] = fontSize.toString();
        
        let cardHtml;
        if (side === 'back') {
            cardHtml = card_generate_back(card, card_options, { isPreview: true });
        } else {
            cardHtml = card_generate_front(card, card_options, { isPreview: true });
        }
        
        previewContainer.innerHTML = cardHtml;
        previewContainer.offsetHeight;
        
        const container = previewContainer.querySelector('.card-content-container');
        if (!container) {
            console.error('Card content container not found');
            return null;
        }
        
        const heightDiff = container.scrollHeight - container.clientHeight;
        const overflowing = heightDiff > TOLERANCE;
        
        console.log(`Size ${fontSize}px: ${overflowing ? '❌ OVERFLOW' : '✓ OK'} (diff: ${heightDiff}px)`);
        
        return overflowing;
    }
    
    function findOptimalFontSize() {
        let low = MIN_SIZE;
        let high = MAX_SIZE;
        let lastGoodSize = MIN_SIZE;
        let iterations = 0;
        
        while (high - low > STEP && iterations < MAX_ITERATIONS) {
            iterations++;
            const testSize = Math.round((low + high) / 2 * 10) / 10;
            const overflowing = isContentOverflowing(testSize);
            
            if (overflowing === null) break;
            
            if (overflowing) {
                high = testSize - STEP;
            } else {
                lastGoodSize = testSize;
                low = testSize + STEP;
            }
        }
        
        if (isContentOverflowing(lastGoodSize)) {
            lastGoodSize = Math.max(MIN_SIZE, lastGoodSize - 1);
        }
        
        return lastGoodSize;
    }
    
    try {
        showToast('Calculating optimal font size...', 'info', 1000);
        
        const optimalSize = findOptimalFontSize();
        
        if (optimalSize >= MIN_SIZE) {
            card[cardPropertyName] = optimalSize.toString();
            fontSizeInput.value = optimalSize;
            $(fontSizeInput).trigger('change');
            showToast(`Optimal font size set to ${optimalSize}px`, 'success');
        } else {
            card[cardPropertyName] = originalFontSize;
            showToast('Could not find a suitable font size.', 'warning');
        }
    } catch (error) {
        console.error('Error in auto-size calculation:', error);
        card[cardPropertyName] = originalFontSize;
        showToast('Error calculating font size: ' + error.message, 'error');
    } finally {
        ui_render_selected_card();
    }
}

function applyAutoSizeText() {
    applyAutoSizeTextGeneric('card-contents', 'card_font_size', 'card-font-size', 'front');
}

// Theme toggle: consistent dark mode using CSS variables and persistent user preference
(function() {
    const THEME_KEY = 'rpgcards-theme';
    const root = document.documentElement;
    const toggleId = 'theme-toggle';

    function applyTheme(theme) {
        if (theme === 'dark') {
            root.setAttribute('data-theme', 'dark');
            const btn = document.getElementById(toggleId);
            if (btn) { btn.setAttribute('aria-pressed', 'true'); btn.textContent = '☀️'; }
        } else {
            root.removeAttribute('data-theme');
            const btn = document.getElementById(toggleId);
            if (btn) { btn.setAttribute('aria-pressed', 'false'); btn.textContent = '🌙'; }
        }
    }

    function initTheme() {
        const stored = localStorage.getItem(THEME_KEY);
        if (stored) {
            applyTheme(stored);
            return;
        }
        // follow system preference by default
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(prefersDark ? 'dark' : 'light');
    }

    document.addEventListener('DOMContentLoaded', function() {
        const btn = document.getElementById(toggleId);
        if (!btn) { initTheme(); return; }
        initTheme();
        btn.addEventListener('click', function() {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const next = isDark ? 'light' : 'dark';
            applyTheme(next);
            localStorage.setItem(THEME_KEY, next);
        });
    });
})();