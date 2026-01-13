function ui_fields_colorfield_color(value) {
    if (!value) return '';
    let foundValue = card_colors[value];
    if (foundValue) return foundValue;
    const valueLowerCase = value.toLowerCase();
    for (const colorKey in card_colors) {
        const colorKeyLowerCase = colorKey.toLocaleLowerCase()
        if (colorKeyLowerCase === valueLowerCase) {
            return colorKey;
        }
    }
    return '';
}

function ui_fields_colorfield_change_handler(field, picker) {
    const newValue = field.getValue();
    if (newValue) {
        // Update the picker to show the current color
        if (picker) {
            picker.setColor(newValue);
        }
    }
}

function ui_fields_colorfield_init(field) {
    const $selector = $(`#${field.id}-selector`);
    
    // Initialize the advanced color picker
    $selector.advancedColorPicker({
        defaultColor: field.getValue() || '#FFFFFF',
        onSelect: function(color) {
            field.update(color);
            ui_render_selected_card();
        }
    });
    
    const picker = $selector.data('advancedColorPicker');
    
    // Handle manual input changes
    field.el.addEventListener('change', () => {
        const newValue = field.getValue();
        if (newValue && picker) {
            picker.setColor(newValue);
        }
        ui_render_selected_card();
    });
    
    field.el.addEventListener('input', () => {
        const newValue = field.getValue();
        if (newValue && picker) {
            picker.setColor(newValue);
        }
    });
    
    // Set initial color
    if (field.getValue() && picker) {
        picker.setColor(field.getValue());
    }
}
