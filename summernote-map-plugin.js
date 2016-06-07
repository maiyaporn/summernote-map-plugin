(function (factory) {
    /* global define */
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node/CommonJS
        module.exports = factory(require('jquery'));
    } else {
        // Browser globals
        factory(window.jQuery);
    }
}(function ($) {
    $.extend(true, $.summernote.lang, {
        'en-US': {
            mapButton: {
                tooltip: "Map"
            }
        },
        'th-TH': {
            mapButton: {
                tooltip: "แผนที่"
            }
        }
    });

    $.extend($.summernote.plugins, {
        /**
          * @param {Object} context - context object has status of editor.
          */
        'map': function (context) {
            var self = this;

            var ui = $.summernote.ui;
            var $note = context.layoutInfo.note;
            var $editor = context.layoutInfo.editor;
            var $editable = context.layoutInfo.editable;

            // if (typeof context.options.imageTitle === 'undefined') {
            //     context.options.imageTitle = {};
            // }

            // if (typeof context.options.imageTitle.specificAltField === 'undefined') {
            //     context.options.imageTitle.specificAltField = false;
            // }

            var options = context.options;
            var lang = options.langInfo;
            console.log(options);

            context.memo('button.map', function () {
                var button = ui.button({
                    contents: "<i class='fa fa-map-o'/>",
                    tooltip: lang.mapButton.tooltip,
                    click: function (e) {
                        console.log('map button clicked');
                    }
                });

                return button.render();
            });

        }
    });
}));