UI_FIELDS_CONFIGURATION_PREPARE.set('default', () => [
    {
        id: 'default-color-front',
        property: 'card_options.default_color_front',
        init: ui_fields_colorfield_init,
        events: [
            ['change', ui_render_selected_card]
        ]
    },
    {
        id: 'default-color-back',
        property: 'card_options.default_color_back',
        init: ui_fields_colorfield_init,
        events: [
            ['change', ui_render_selected_card]
        ]
    },
    {
        id: 'default-title-color',
        property: 'card_options.default_title_color',
        init: ui_fields_colorfield_init,
        events: [
            ['change', ui_render_selected_card]
        ]
    },

    // $('#default-color-front-selector').colorselector({
    //     callback: function (value, color, title) {
    //         $("#default-color-front").val(title);
    //         ui_set_default_color_front(value);
    //     }
    // });
    // $('#default-color-back-selector').colorselector({
    //     callback: function (value, color, title) {
    //         $("#default-color-back").val(title);
    //         ui_set_default_color_back(value);
    //     }
    // });

    // function ui_set_default_color_front(color) {
    //     card_options.default_color_front = color;
    //     ui_render_selected_card();
    // }

    // function ui_set_default_color_back(color) {
    //     card_options.default_color_back = color;
    //     ui_render_selected_card();
    // }

    // function ui_change_default_color_front() {
    //     var input = $(this);
    //     var color = input.val();

    //     ui_update_color_selector(color, input, "#default-color-front-selector");
    //     ui_set_default_color_front(color);
    // }


    // function ui_change_default_color_back() {
    //     var input = $(this);
    //     var color = input.val();

    //     ui_update_color_selector(color, input, "#default-color-back-selector");
    //     ui_set_default_color_back(color);
    // }



]);