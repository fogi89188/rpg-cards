UI_FIELDS_CONFIGURATION_PREPARE.set('page', () => [
    {
        id: 'page-size',
        property: 'card_options.page_size',
        events: [
            ['change', function () {
                const { page_size, page_width, page_height } = card_options;
                const [w, h] = page_size ? page_size.split(',') : ['', ''];
                if (isLandscape(page_width, page_height)) {
                    getField('page-width').update(h);
                    getField('page-height').update(w);
                } else {
                    getField('page-width').update(w);
                    getField('page-height').update(h);
                }
                ui_set_orientation_info('page-orientation', page_width, page_height);
            }]
        ],
        init: () => {
            const { page_width, page_height } = card_options;
            ui_set_orientation_info('page-orientation', page_width, page_height);
        }
    },
    {
        id: 'page-width',
        property: 'card_options.page_width',
        events: [
            ['change', function() {
                const { page_width, page_height } = card_options;
                ui_set_value_to_format('page-size', page_width, page_height);
                ui_set_orientation_info('page-orientation', page_width, page_height);
            }]
        ]
    },
    {
        id: 'page-height',
        property: 'card_options.page_height',
        events: [
            ['change', function() {
                const { page_width, page_height } = card_options;
                ui_set_value_to_format('page-size', page_width, page_height);
                ui_set_orientation_info('page-orientation', page_width, page_height);
            }]
        ]
    },
    {
        id: 'foreground-color',
        property: 'card_options.foreground_color',
        init: ui_fields_colorfield_init
    },
    {
        id: 'background-color',
        property: 'card_options.background_color',
        init: ui_fields_colorfield_init
    },
    {
        id: 'crop-marks',
        property: 'card_options.crop_marks'
    },
    {
        id: 'registration-marks',
        property: 'card_options.registration_marks'
    }
]);
