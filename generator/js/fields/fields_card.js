UI_FIELDS_CONFIGURATION_PREPARE.set('card', () => [
    {
        id: 'card-title',
        property: [ui_selected_card, 'title'],
        defaultProperty: [default_card_data, 'title'],
        events: [
            ['input', function(event) {
                ui_render_selected_card();
                const card = ui_selected_card();
                const displayTitleField = getField('card-title-display');
                if (card) {
                    $('#deck-cards-list .radio:has(input[type="radio"]:checked) .text').text(ui_deck_option_text(card));
                    displayTitleField.el.placeholder = event.target.value;
                } else {
                    displayTitleField.el.placeholder = displayTitleField.el.getAttribute('data-placeholder');
                }
            }],
            ['change', function (event) {
                ui_render_selected_card();
                const card = ui_selected_card();
                const displayTitleField = getField('card-title-display');
                if (card) {
                    $('#deck-cards-list .radio:has(input[type="radio"]:checked) .text').text(ui_deck_option_text(card));
                    displayTitleField.el.placeholder = event.target.value;
                } else {
                    displayTitleField.el.placeholder = displayTitleField.el.getAttribute('data-placeholder');
                }
            }]
        ]
    },
    {
        id: 'header-show',
        property: [ui_selected_card, 'header_show'],
        events: [
            ['input', ui_render_selected_card],
            ['change', ui_render_selected_card]
        ]
    },
    {
        id: 'card-title-display',
        property: [ui_selected_card, 'title_display'],
        defaultProperty: [default_card_data, 'title'],
        events: [
            ['input', ui_render_selected_card],
            ['change', ui_render_selected_card]
        ]
    },
    {
        id: 'title-color',
        property: [ui_selected_card, 'title_color'],
        defaultProperty: [default_card_data, 'default_title_color'],
        init: ui_fields_colorfield_init,
        events: [
            ['input', ui_render_selected_card],
            ['change', ui_render_selected_card]
        ]
    },
    {
        id: 'card-icon-front-color',
        property: [ui_selected_card, 'icon_front_color'],
        defaultProperty: [default_card_data, 'icon_front_color'],
        init: ui_fields_colorfield_init,
        events: [
            ['input', ui_render_selected_card],
            ['change', ui_render_selected_card]
        ]
    },
    {
        id: 'card-type',
        property: [ui_selected_card, 'card_type'],
        defaultProperty: [default_card_data, 'card_type'],
        events: [
            ['input', ui_render_selected_card],
            ['change', ui_render_selected_card]
        ]
    },
    {
        id: 'card-color-front',
        property: [ui_selected_card, 'color_front'],
        defaultProperty: [default_card_data, 'color_front'],
        init: ui_fields_colorfield_init,
        events: [
            ['input', ui_render_selected_card],
            ['change', ui_render_selected_card]
        ]
    },
    {
        id: 'card-color-back',
        property: [ui_selected_card, 'color_back'],
        defaultProperty: [default_card_data, 'color_back'],
        init: ui_fields_colorfield_init,
        events: [
            ['input', ui_render_selected_card],
            ['change', ui_render_selected_card]
        ]
    },
    {
        id: 'vertical-alignment-reference',
        property: [ui_selected_card, 'vertical_alignment_reference'],
        defaultProperty: [default_card_data, 'vertical_alignment_reference'],
        events: [
            ['change', ui_render_selected_card]
        ]
    },
    {
        id: 'card-front-full-image',
        property: [ui_selected_card, 'front_full_image'],
        defaultProperty: [default_card_data, 'front_full_image'],
        events: [
            ['input', ui_render_selected_card],
            ['change', ui_render_selected_card]
        ]
    },
    {
        id: 'card-front-image-fit',
        property: [ui_selected_card, 'front_image_fit'],
        defaultProperty: [default_card_data, 'front_image_fit'],
        events: [
            ['change', ui_render_selected_card]
        ]
    },
    {
        id: 'card-back-full-image',
        property: [ui_selected_card, 'back_full_image'],
        defaultProperty: [default_card_data, 'back_full_image'],
        events: [
            ['input', ui_render_selected_card],
            ['change', ui_render_selected_card]
        ]
    },
    {
        id: 'card-back-image-fit',
        property: [ui_selected_card, 'back_image_fit'],
        defaultProperty: [default_card_data, 'back_image_fit'],
        events: [
            ['change', ui_render_selected_card]
        ]
    },
    {
        id: 'card-front-border',
        property: [ui_selected_card, 'front_border'],
        defaultProperty: [default_card_data, 'front_border'],
        events: [
            ['change', ui_render_selected_card]
        ]
    },
    {
        id: 'card-back-border',
        property: [ui_selected_card, 'back_border'],
        defaultProperty: [default_card_data, 'back_border'],
        events: [
            ['change', ui_render_selected_card]
        ]
    },
    {
        id: 'card-front-image-rounded',
        property: [ui_selected_card, 'front_image_rounded'],
        defaultProperty: [default_card_data, 'front_image_rounded'],
        events: [
            ['change', ui_render_selected_card]
        ]
    },
    {
        id: 'card-back-image-rounded',
        property: [ui_selected_card, 'back_image_rounded'],
        defaultProperty: [default_card_data, 'back_image_rounded'],
        events: [
            ['change', ui_render_selected_card]
        ]
    },
    {
        id: 'card-front-type',
        property: [ui_selected_card, 'front_card_type'],
        defaultProperty: [default_card_data, 'front_card_type'],
        events: [
            ['change', function() {
                const card = ui_selected_card();
                if (card) {
                    if (card.front_card_type === 'image') {
                        card.header_show = 'none';
                        const headerField = getField('header-show');
                        if (headerField) {
                            headerField.el.value = 'none';
                        }
                    }
                }
                ui_render_selected_card();
            }]
        ]
    },
    {
        id: 'card-back-type',
        property: [ui_selected_card, 'back_card_type'],
        defaultProperty: [default_card_data, 'back_card_type'],
        events: [
            ['change', function() {
                const card = ui_selected_card();
                if (card) {
                    if (card.back_card_type === 'image') {
                        card.header_show_back = 'none';
                        const headerBackField = getField('header-show-back');
                        if (headerBackField) {
                            headerBackField.el.value = 'none';
                        }
                    }
                }
                ui_render_selected_card();
            }]
        ]
    },
    {
        id: 'card-back-contents',
        property: [ui_selected_card, 'back_contents'],
        defaultProperty: [default_card_data, 'back_contents'],
        events: [
            ['input', ui_render_selected_card],
            ['change', ui_render_selected_card]
        ]
    },
    {
        id: 'card-back-font-size',
        property: [ui_selected_card, 'card_back_font_size'],
        defaultProperty: [default_card_data, 'card_back_font_size'],
        events: [
            ['change', ui_render_selected_card]
        ]
    },
    {
        id: 'header-show-back',
        property: [ui_selected_card, 'header_show_back'],
        defaultProperty: [default_card_data, 'header_show_back'],
        events: [
            ['change', ui_render_selected_card]
        ]
    },
    

    // $("#card-color-front").change(function() {
    //     var input = $(this);
    //     var color = input.val();

    //     ui_update_color_selector(color, input, "#card-color-front-selector");
    //     ui_set_card_color_front(color);
    // });
	// $("#card-color-back").change(function() {
    //     var input = $(this);
    //     var color = input.val();

    //     ui_update_color_selector(color, input, "#card-color-back-selector");
    //     ui_set_card_color_back(color);
    // });


// function ui_set_card_color_front(value) {
//     var card = ui_selected_card();
//     if (card) {
//         card.color_front = value;
//         ui_render_selected_card();
//     }
// }
// function ui_set_card_color_back(value) {
//     var card = ui_selected_card();
//     if (card) {
//         card.color_front = value;
//         ui_render_selected_card();
//     }
// }


    //     $('#card-color-front-selector').colorselector({
    //     callback: function (value, color, title) {
    //         $("#card-color-front").val(title);
    //         ui_set_card_color_front(value);
    //     }
    // });
    // $('#card-color-back-selector').colorselector({
    //     callback: function (value, color, title) {
    //         $("#card-color-back").val(title);
    //         ui_set_card_color_back(value);
    //     }
    // });



]);