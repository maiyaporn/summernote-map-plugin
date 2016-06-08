(function(factory) {
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
}(function($) {

    $.extend(true, $.summernote.lang, {
        'en-US': {
            mapButton: {
                tooltip: "Map"
            },
            mapDialog: {
                title: "Add a location"
            }
        },
        'th-TH': {
            mapButton: {
                tooltip: "แผนที่"
            },
            mapDialog: {
                title: "เพิ่มแผนที่"
            }
        }
    });

    var mapOption = {
        apiKey: '', // google maps api browser key
        center: {
             lat: -33.8688,
             lng: 151.2195
        },
        zoom: 13
    };

    // Extends plugins for map insertion
    $.extend($.summernote.plugins, {
        /**
         * @param {Object} context - context object has status of editor.
         */
        'map': function(context) {

            var self = this;
            var ui = $.summernote.ui;
            var $editor = context.layoutInfo.editor;
            var options = context.options;
            var lang = options.langInfo;

            // Set default options for map
           options.map = $.extend(mapOption, options.map);

            const GOOGLE_MAPS_API_URL = ("http://maps.google.com/maps/api/js?key=API_KEY&libraries=places").replace("API_KEY", options.map.apiKey);
            const EMBED_URL = ("https://www.google.com/maps/embed/v1/place?key=API_KEY&q=PLACE").replace("API_KEY", options.map.apiKey);

            context.memo('button.map', function() {
                var button = ui.button({
                    contents: "<i class='fa fa-map-o'/>",
                    tooltip: lang.mapButton.tooltip,
                    click: function(e) {
                        self.show();
                    }
                });

                return button.render();
            });

            /**
             * Create a dialog for adding map and append to container
             */
            this.initialize = function() {
                var addMapDialog = {
                    title: lang.mapDialog.title,
                    body: '<div class="form-group">' +
                                  '<label>' + 'Name or Address' + '</label>' +
                                  '<input id="input-autocomplete" class="form-control" type="text" placeholder="Enter a place" />' +
                               '</div>' +
                               '<div id="map-in-dialog" style="height: 300px;"></div>',
                    footer: '<button href="#" id="btn-add" class="btn btn-primary">' + 'Add' + '</button>' +
                                '<button href="#" id="btn-cancel" class="btn btn-primary">' + 'Cancel' + '</button>',
                    closeOnEscape: true
                };

                var $container = options.dialogsInBody ? $(document.body) : $editor;
                self.$dialog = ui.dialog(addMapDialog).render().appendTo($container);

                $('.modal').css({
                    "z-index": "20",
                    "height": "100%"
                });
            };

            this.destroy = function() {
                ui.hideDialog(this.$dialog);
                self.$dialog.remove();
            };

            // This events will be attached when editor is initialized.
            this.events = {
                // This will be called after modules are initialized.
                'summernote.init': function (we, e) {
                    if( typeof google == 'object' && typeof google.maps == 'object' ) {
                        self.initMapDialog();
                    } else {
                        $.getScript( GOOGLE_MAPS_API_URL, self.initMapDialog);
                    }
                }
            };

            this.initMapDialog = function() {
                console.log('initMapDialog');
                var mapDiv = self.$dialog.find('#map-in-dialog')[0];
                var map = new google.maps.Map(mapDiv, {
                    center: options.map.center,
                    zoom: options.map.zoom
                });

                var autocompleteInput = self.$dialog.find('#input-autocomplete')[0];
                var autocomplete = new google.maps.places.Autocomplete(autocompleteInput);

                autocomplete.bindTo('bounds', map);

                var marker = new google.maps.Marker({
                    map: map,
                    anchorPoint: new google.maps.Point(0, -29)
                });

                google.maps.event.addListener(autocomplete, 'place_changed', function() {
                    marker.setVisible(false);

                    var place = autocomplete.getPlace();
                    if (!place.geometry) {
                        console.log("Autocomplete's returned place contains no geometry");
                        return;
                    }

                    // If the place has a geometry, then present it on a map.
                    if (place.geometry.viewport) {
                        map.fitBounds(place.geometry.viewport);
                    } else {
                        map.setCenter(place.geometry.location);
                        map.setZoom(options.map.zoom);
                    }

                    marker.setIcon( /** @type {google.maps.Icon} */ ({
                        url: place.icon,
                        size: new google.maps.Size(71, 71),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(17, 34),
                        scaledSize: new google.maps.Size(35, 35)
                    }));

                    marker.setPosition(place.geometry.location);
                    marker.setVisible(true);
                });

                // google.maps.event.addListener(map, 'idle', function() {
                //     google.maps.event.trigger(map, 'resize');
                // });
            };

            this.show = function() {
                context.invoke('editor.saveRange');

                this.showAddMapDialog()
                    .then(function() {
                        context.invoke('editor.restoreRange');
                        var input = self.$dialog.find('#input-autocomplete')[0];

                        self.insertEmbedMapToEditor(input.value);
                        ui.hideDialog(self.$dialog);
                        input.value = "";
                    }).fail(function() {
                        context.invoke('editor.restoreRange');
                    });
            };

            this.insertEmbedMapToEditor = function(placeName) {
                var $div = $('<div>');
                $div.css({
                    'position': 'relative',
                    'padding-top': '25px',
                    'padding-bottom': '56.25%',
                    'height': '0',
                    'overflow': 'hidden',
                    'text-align': 'center'
                });

                var $iframe = $('<iframe>', {
                    src: EMBED_URL.replace("PLACE", placeName),
                    height: '250px'
                });

                $iframe.css({
                    'position': 'absolute',
                    'top': '0',
                    'left': '0',
                    'width': '100% !important',
                    'height': '100% !important',
                    'margin': '0 auto'
                });

                console.log($iframe)

                $div.html($iframe)
                // var iframe = document.createElement('iframe');
                // iframe.width = "400";
                // iframe.height = "300";
                // iframe.src = EMBED_URL.replace("PLACE", placeName);

                context.invoke('editor.insertNode',  $div[0]);
            };

            this.showAddMapDialog = function() {
                return $.Deferred(function(deferred) {

                    $addBtn = self.$dialog.find('#btn-add');

                    ui.onDialogShown(self.$dialog, function() {
                        // http://stackoverflow.com/questions/10957781/google-maps-autocomplete-result-in-bootstrap-modal-dialog
                        $('.modal-backdrop').css("z-index", 10);
                        context.triggerEvent('dialog.shown');

                        $addBtn.click(function(event) {
                            event.preventDefault();
                            deferred.resolve();
                        });

                    });

                    ui.onDialogHidden(self.$dialog, function() {
                        $addBtn.off('click');

                        if (deferred.state() === 'pending') {
                            deferred.reject();
                        }
                    });

                    ui.showDialog(self.$dialog);
                });
            };
        }
    });
}));
