/**
 * Advanced Color Picker with spectrum selection, saved colors, and localStorage persistence
 * Copyright (C) 2026
 * Licensed under the MIT license
 */

(function($) {
    "use strict";

    // Storage keys
    const STORAGE_KEY_SAVED = 'rpgcards-saved-colors';
    const STORAGE_KEY_RECENT = 'rpgcards-recent-colors';
    const MAX_SAVED_COLORS = 24;
    const MAX_RECENT_COLORS = 12;

    // Predefined colors that cannot be removed (from Zavian's default_color_palette)
    const PREDEFINED_COLORS = [
        { name: 'Uncommon', color: '#008000' },
        { name: 'Rare', color: '#000080' },
        { name: 'Very Rare', color: '#8a2be2' },
        { name: 'Legendary', color: '#c46709' }
    ];

    // Color utilities
    const ColorUtils = {
        // Convert RGB to HSV
        rgbToHsv: function(r, g, b) {
            r /= 255;
            g /= 255;
            b /= 255;
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const d = max - min;
            let h, s = (max === 0 ? 0 : d / max);
            const v = max;

            if (max === min) {
                h = 0;
            } else {
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }
            return { h: h * 360, s: s * 100, v: v * 100 };
        },

        // Convert HSV to RGB
        hsvToRgb: function(h, s, v) {
            h = h / 360;
            s = s / 100;
            v = v / 100;
            let r, g, b;
            const i = Math.floor(h * 6);
            const f = h * 6 - i;
            const p = v * (1 - s);
            const q = v * (1 - f * s);
            const t = v * (1 - (1 - f) * s);

            switch (i % 6) {
                case 0: r = v; g = t; b = p; break;
                case 1: r = q; g = v; b = p; break;
                case 2: r = p; g = v; b = t; break;
                case 3: r = p; g = q; b = v; break;
                case 4: r = t; g = p; b = v; break;
                case 5: r = v; g = p; b = q; break;
            }
            return {
                r: Math.round(r * 255),
                g: Math.round(g * 255),
                b: Math.round(b * 255)
            };
        },

        // Convert RGB to HEX
        rgbToHex: function(r, g, b) {
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
        },

        // Convert HEX to RGB
        hexToRgb: function(hex) {
            hex = hex.replace(/^#/, '');
            if (hex.length === 3) {
                hex = hex.split('').map(c => c + c).join('');
            }
            const num = parseInt(hex, 16);
            return {
                r: (num >> 16) & 255,
                g: (num >> 8) & 255,
                b: num & 255
            };
        },

        // Parse any color format (hex, rgb, named)
        parseColor: function(color) {
            if (!color) return null;
            
            // Try hex
            if (color.match(/^#?[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/)) {
                return this.hexToRgb(color);
            }
            
            // Try rgb/rgba
            const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (rgbMatch) {
                return {
                    r: parseInt(rgbMatch[1]),
                    g: parseInt(rgbMatch[2]),
                    b: parseInt(rgbMatch[3])
                };
            }
            
            // Try named color via temp element
            const temp = document.createElement('div');
            temp.style.color = color;
            document.body.appendChild(temp);
            const computed = window.getComputedStyle(temp).color;
            document.body.removeChild(temp);
            
            const match = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (match) {
                return {
                    r: parseInt(match[1]),
                    g: parseInt(match[2]),
                    b: parseInt(match[3])
                };
            }
            
            return null;
        }
    };

    // Storage manager
    const StorageManager = {
        getSavedColors: function() {
            try {
                const saved = localStorage.getItem(STORAGE_KEY_SAVED);
                return saved ? JSON.parse(saved) : [];
            } catch (e) {
                return [];
            }
        },

        setSavedColors: function(colors) {
            try {
                localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(colors));
            } catch (e) {
                console.error('Failed to save colors:', e);
            }
        },

        addSavedColor: function(color, name) {
            let colors = this.getSavedColors();
            // Create color object
            const colorObj = { color: color, name: name || color };
            // Remove if color already exists
            colors = colors.filter(c => {
                const existingColor = typeof c === 'string' ? c : c.color;
                return existingColor !== color;
            });
            // Add to beginning
            colors.unshift(colorObj);
            // Limit size
            colors = colors.slice(0, MAX_SAVED_COLORS);
            this.setSavedColors(colors);
        },

        removeSavedColor: function(color) {
            let colors = this.getSavedColors();
            colors = colors.filter(c => {
                const existingColor = typeof c === 'string' ? c : c.color;
                return existingColor !== color;
            });
            this.setSavedColors(colors);
        },

        getRecentColors: function() {
            try {
                const recent = localStorage.getItem(STORAGE_KEY_RECENT);
                return recent ? JSON.parse(recent) : [];
            } catch (e) {
                return [];
            }
        },

        addRecentColor: function(color) {
            let colors = this.getRecentColors();
            // Remove if already exists
            colors = colors.filter(c => c !== color);
            // Add to beginning
            colors.unshift(color);
            // Limit size
            colors = colors.slice(0, MAX_RECENT_COLORS);
            try {
                localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(colors));
            } catch (e) {
                console.error('Failed to save recent color:', e);
            }
        }
    };

    // Advanced Color Picker class
    const AdvancedColorPicker = function(element, options) {
        this.options = $.extend({}, AdvancedColorPicker.defaults, options);
        this.$element = $(element);
        this.$input = null;
        this.$dropdown = null;
        this.currentColor = '#FF0000';
        this.currentHsv = { h: 0, s: 100, v: 100 };
        this._init();
    };

    AdvancedColorPicker.prototype = {
        constructor: AdvancedColorPicker,

        _init: function() {
            // Find the associated input field
            this.$input = this.$element.next('input[type="text"]');
            if (this.$input.length === 0) {
                this.$input = this.$element.parent().find('input[type="text"]').first();
            }

            // Build UI first (creates canvases)
            this._buildUI();

            // Set initial color after UI is built
            const initialColor = this.$input.val() || this.options.defaultColor;
            this._setColorFromString(initialColor);

            // Bind events
            this._bindEvents();

            // Initial render
            this._updateUI();
        },

        _buildUI: function() {
            const html = `
                <div class="advanced-color-picker-wrapper">
                    <div class="advanced-color-picker-toggle" title="Pick a color">
                        <div class="color-preview" style="background-color: ${this.currentColor}"></div>
                    </div>
                    <div class="advanced-color-picker-dropdown" style="display: none;">
                        <div class="color-picker-main">
                            <div class="spectrum-wrapper">
                                <div class="spectrum-gradient">
                                    <canvas class="spectrum-canvas" width="250" height="200"></canvas>
                                    <div class="spectrum-cursor"></div>
                                </div>
                                <div class="hue-slider-wrapper">
                                    <canvas class="hue-canvas" width="20" height="200"></canvas>
                                    <div class="hue-cursor"></div>
                                </div>
                            </div>
                            <div class="color-inputs">
                                <div class="input-row">
                                    <label>HEX</label>
                                    <input type="text" class="hex-input" maxlength="7" />
                                </div>
                                <div class="input-row">
                                    <label>R</label>
                                    <input type="number" class="rgb-input r-input" min="0" max="255" />
                                </div>
                                <div class="input-row">
                                    <label>G</label>
                                    <input type="number" class="rgb-input g-input" min="0" max="255" />
                                </div>
                                <div class="input-row">
                                    <label>B</label>
                                    <input type="number" class="rgb-input b-input" min="0" max="255" />
                                </div>
                            </div>
                            <div class="color-name-input">
                                <input type="text" class="color-name-field" placeholder="Color name (optional)" maxlength="20" />
                            </div>
                            <div class="color-actions">
                                <button type="button" class="btn btn-sm btn-success save-color-btn">
                                    <span class="glyphicon glyphicon-star"></span> Save
                                </button>
                                <button type="button" class="btn btn-sm btn-primary select-color-btn">Select</button>
                            </div>
                        </div>
                        <div class="saved-colors-section">
                            <div class="saved-colors-header">
                                <span>Saved Colors</span>
                            </div>
                            <div class="saved-colors-grid"></div>
                        </div>
                        <div class="recent-colors-section">
                            <div class="recent-colors-header">
                                <span>Recent</span>
                            </div>
                            <div class="recent-colors-grid"></div>
                        </div>
                    </div>
                </div>
            `;

            this.$element.hide();
            this.$wrapper = $(html).insertAfter(this.$element);
            this.$toggle = this.$wrapper.find('.advanced-color-picker-toggle');
            this.$dropdown = this.$wrapper.find('.advanced-color-picker-dropdown');
            this.$preview = this.$wrapper.find('.color-preview');
            
            // Canvas elements
            this.$spectrumCanvas = this.$wrapper.find('.spectrum-canvas');
            this.spectrumCtx = this.$spectrumCanvas[0].getContext('2d');
            this.$hueCanvas = this.$wrapper.find('.hue-canvas');
            this.hueCtx = this.$hueCanvas[0].getContext('2d');
            
            // Cursors
            this.$spectrumCursor = this.$wrapper.find('.spectrum-cursor');
            this.$hueCursor = this.$wrapper.find('.hue-cursor');
            
            // Inputs
            this.$hexInput = this.$wrapper.find('.hex-input');
            this.$rInput = this.$wrapper.find('.r-input');
            this.$gInput = this.$wrapper.find('.g-input');
            this.$bInput = this.$wrapper.find('.b-input');
            this.$nameInput = this.$wrapper.find('.color-name-field');
            
            // Grids
            this.$savedGrid = this.$wrapper.find('.saved-colors-grid');
            this.$recentGrid = this.$wrapper.find('.recent-colors-grid');
            
            // Buttons
            this.$saveBtn = this.$wrapper.find('.save-color-btn');
            this.$selectBtn = this.$wrapper.find('.select-color-btn');

            // Draw canvases
            this._drawHueSlider();
            this._drawSpectrum();
        },

        _bindEvents: function() {
            const self = this;

            // Toggle dropdown
            this.$toggle.on('click', function(e) {
                e.stopPropagation();
                self._toggleDropdown();
            });

            // Close on outside click
            $(document).on('click.advancedcolorpicker', function(e) {
                if (!$(e.target).closest('.advanced-color-picker-wrapper').length) {
                    self._closeDropdown();
                }
            });

            // Spectrum interaction
            this.$spectrumCanvas.on('mousedown', function(e) {
                self.isDraggingSpectrum = true;
                self._handleSpectrumClick(e);
                e.preventDefault();
            });

            $(document).on('mousemove.spectrum', function(e) {
                if (self.isDraggingSpectrum) {
                    self._handleSpectrumClick(e);
                }
            });

            $(document).on('mouseup.spectrum', function() {
                self.isDraggingSpectrum = false;
            });

            // Hue slider interaction
            this.$hueCanvas.on('mousedown', function(e) {
                self.isDraggingHue = true;
                self._handleHueClick(e);
                e.preventDefault();
            });

            $(document).on('mousemove.hue', function(e) {
                if (self.isDraggingHue) {
                    self._handleHueClick(e);
                }
            });

            $(document).on('mouseup.hue', function() {
                self.isDraggingHue = false;
            });

            // Input changes
            this.$hexInput.on('change', function() {
                self._setColorFromHex($(this).val());
            });

            this.$rInput.on('change', function() {
                self._setColorFromRgb();
            });

            this.$gInput.on('change', function() {
                self._setColorFromRgb();
            });

            this.$bInput.on('change', function() {
                self._setColorFromRgb();
            });

            // Buttons
            this.$saveBtn.on('click', function() {
                self._saveCurrentColor();
            });

            this.$selectBtn.on('click', function() {
                self._selectCurrentColor();
            });

            // Saved/recent color clicks
            this.$savedGrid.on('click', '.color-swatch', function() {
                self._setColorFromString($(this).data('color'));
                self._selectCurrentColor();
            });

            this.$savedGrid.on('click', '.remove-color', function(e) {
                e.stopPropagation();
                const color = $(this).closest('.color-swatch').data('color');
                StorageManager.removeSavedColor(color);
                self._updateSavedColors();
            });

            this.$recentGrid.on('click', '.color-swatch', function() {
                self._setColorFromString($(this).data('color'));
                self._selectCurrentColor();
            });
        },

        _drawHueSlider: function() {
            const width = 20;
            const height = 200;
            const gradient = this.hueCtx.createLinearGradient(0, 0, 0, height);
            
            for (let i = 0; i <= 6; i++) {
                gradient.addColorStop(i / 6, `hsl(${i * 60}, 100%, 50%)`);
            }
            
            this.hueCtx.fillStyle = gradient;
            this.hueCtx.fillRect(0, 0, width, height);
        },

        _drawSpectrum: function() {
            const width = 250;
            const height = 200;
            const hue = this.currentHsv.h;
            
            // Create gradient
            const ctx = this.spectrumCtx;
            
            // Fill with hue color
            ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
            ctx.fillRect(0, 0, width, height);
            
            // Add white gradient (left to right)
            const whiteGradient = ctx.createLinearGradient(0, 0, width, 0);
            whiteGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            whiteGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = whiteGradient;
            ctx.fillRect(0, 0, width, height);
            
            // Add black gradient (top to bottom)
            const blackGradient = ctx.createLinearGradient(0, 0, 0, height);
            blackGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            blackGradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
            ctx.fillStyle = blackGradient;
            ctx.fillRect(0, 0, width, height);
        },

        _handleSpectrumClick: function(e) {
            const rect = this.$spectrumCanvas[0].getBoundingClientRect();
            let x = e.clientX - rect.left;
            let y = e.clientY - rect.top;
            
            x = Math.max(0, Math.min(250, x));
            y = Math.max(0, Math.min(200, y));
            
            this.currentHsv.s = (x / 250) * 100;
            this.currentHsv.v = 100 - (y / 200) * 100;
            
            this._updateFromHsv();
        },

        _handleHueClick: function(e) {
            const rect = this.$hueCanvas[0].getBoundingClientRect();
            let y = e.clientY - rect.top;
            y = Math.max(0, Math.min(200, y));
            
            this.currentHsv.h = (y / 200) * 360;
            
            this._drawSpectrum();
            this._updateFromHsv();
        },

        _updateFromHsv: function() {
            const rgb = ColorUtils.hsvToRgb(this.currentHsv.h, this.currentHsv.s, this.currentHsv.v);
            this.currentColor = ColorUtils.rgbToHex(rgb.r, rgb.g, rgb.b);
            this._updateUI();
        },

        _setColorFromString: function(color) {
            const rgb = ColorUtils.parseColor(color);
            if (rgb) {
                this.currentHsv = ColorUtils.rgbToHsv(rgb.r, rgb.g, rgb.b);
                this.currentColor = ColorUtils.rgbToHex(rgb.r, rgb.g, rgb.b);
                this._drawSpectrum();
                this._updateUI();
            }
        },

        _setColorFromHex: function(hex) {
            if (hex.match(/^#?[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/)) {
                this._setColorFromString(hex);
            }
        },

        _setColorFromRgb: function() {
            const r = parseInt(this.$rInput.val()) || 0;
            const g = parseInt(this.$gInput.val()) || 0;
            const b = parseInt(this.$bInput.val()) || 0;
            
            this.currentHsv = ColorUtils.rgbToHsv(r, g, b);
            this.currentColor = ColorUtils.rgbToHex(r, g, b);
            this._drawSpectrum();
            this._updateUI();
        },

        _updateUI: function() {
            // Update preview
            this.$preview.css('background-color', this.currentColor);
            
            // Update cursors
            this.$spectrumCursor.css({
                left: (this.currentHsv.s / 100 * 250) + 'px',
                top: ((100 - this.currentHsv.v) / 100 * 200) + 'px'
            });
            
            this.$hueCursor.css({
                top: (this.currentHsv.h / 360 * 200) + 'px'
            });
            
            // Update inputs
            const rgb = ColorUtils.hsvToRgb(this.currentHsv.h, this.currentHsv.s, this.currentHsv.v);
            this.$hexInput.val(this.currentColor);
            this.$rInput.val(rgb.r);
            this.$gInput.val(rgb.g);
            this.$bInput.val(rgb.b);
        },

        _updateSavedColors: function() {
            const savedColors = StorageManager.getSavedColors();
            this.$savedGrid.empty();
            
            // Add predefined colors first (cannot be removed)
            PREDEFINED_COLORS.forEach(item => {
                const swatch = $(`
                    <div class="color-swatch predefined" data-color="${item.color}" title="${item.name}">
                        <div class="color-swatch-inner" style="background-color: ${item.color}"></div>
                    </div>
                `);
                this.$savedGrid.append(swatch);
            });
            
            // Add user-saved colors (can be removed)
            savedColors.forEach(item => {
                // Handle both old format (string) and new format (object)
                const color = typeof item === 'string' ? item : item.color;
                const name = typeof item === 'string' ? item : (item.name || item.color);
                const swatch = $(`
                    <div class="color-swatch" data-color="${color}" data-name="${name}" title="${name}">
                        <div class="color-swatch-inner" style="background-color: ${color}"></div>
                        <button type="button" class="remove-color" title="Remove">×</button>
                    </div>
                `);
                this.$savedGrid.append(swatch);
            });
            
            if (savedColors.length === 0 && PREDEFINED_COLORS.length === 0) {
                this.$savedGrid.append('<div class="no-colors">No saved colors yet</div>');
            }
        },

        _updateRecentColors: function() {
            const recentColors = StorageManager.getRecentColors();
            this.$recentGrid.empty();
            
            recentColors.forEach(color => {
                const swatch = $(`
                    <div class="color-swatch" data-color="${color}" title="${color}">
                        <div class="color-swatch-inner" style="background-color: ${color}"></div>
                    </div>
                `);
                this.$recentGrid.append(swatch);
            });
            
            if (recentColors.length === 0) {
                this.$recentGrid.append('<div class="no-colors">No recent colors</div>');
            }
        },

        _saveCurrentColor: function() {
            const colorName = this.$nameInput.val().trim();
            StorageManager.addSavedColor(this.currentColor, colorName);
            this.$nameInput.val(''); // Clear name field after saving
            this._updateSavedColors();
        },

        _selectCurrentColor: function() {
            StorageManager.addRecentColor(this.currentColor);
            this.$input.val(this.currentColor).trigger('change');
            this._closeDropdown();
            
            if (this.options.onSelect) {
                this.options.onSelect(this.currentColor);
            }
        },

        _toggleDropdown: function() {
            if (this.$dropdown.is(':visible')) {
                this._closeDropdown();
            } else {
                this._openDropdown();
            }
        },

        _openDropdown: function() {
            this.$dropdown.show();
            this._updateSavedColors();
            this._updateRecentColors();
        },

        _closeDropdown: function() {
            this.$dropdown.hide();
        },

        // Public API
        setColor: function(color) {
            this._setColorFromString(color);
        },

        getColor: function() {
            return this.currentColor;
        },

        destroy: function() {
            this.$wrapper.remove();
            this.$element.show();
            $(document).off('.advancedcolorpicker');
            $(document).off('.spectrum');
            $(document).off('.hue');
        }
    };

    // Default options
    AdvancedColorPicker.defaults = {
        defaultColor: '#FFFFFF',
        onSelect: null
    };

    // jQuery plugin
    $.fn.advancedColorPicker = function(option) {
        return this.each(function() {
            const $this = $(this);
            let data = $this.data('advancedColorPicker');
            const options = typeof option === 'object' && option;

            if (!data) {
                data = new AdvancedColorPicker(this, options);
                $this.data('advancedColorPicker', data);
            }

            if (typeof option === 'string') {
                data[option]();
            }
        });
    };

    $.fn.advancedColorPicker.Constructor = AdvancedColorPicker;

})(jQuery);
