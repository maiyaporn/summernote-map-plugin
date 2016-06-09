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

    // Define default option for map
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

            // Extends default map option to options from user
            options.map = $.extend(mapOption, options.map);

            // Define Google Maps API URLs with user's apikey
            const GOOGLE_MAPS_API_URL = ("http://maps.google.com/maps/api/js?key=API_KEY&libraries=places").replace("API_KEY", options.map.apiKey);
            const EMBED_URL = ("https://www.google.com/maps/embed/v1/place?key=API_KEY&q=PLACE").replace("API_KEY", options.map.apiKey);

            // Create a map button to be used in the toolbar
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
                var $container = options.dialogsInBody ? $(document.body) : $editor;
                self.mapDialog.create($container);

                $('.modal').css({ "z-index": "20", "height": "100%" });
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
                        // self.initMapDialog();
                        self.mapDialog.initMap();
                    } else {
                        // $.getScript( GOOGLE_MAPS_API_URL, self.initMapDialog);
                        $.getScript( GOOGLE_MAPS_API_URL, function() {self.mapDialog.initMap();});
                    }
                }
            };

            this.mapDialog = {
                dialogOption: {
                    title: lang.mapDialog.title,
                    body: '<div class="form-group">' +
                                  '<label>' + 'Name or Address' + '</label>' +
                                  '<input id="input-autocomplete" class="form-control" type="text" placeholder="Enter a place" />' +
                               '</div>' +
                               '<div id="map-in-dialog" style="height: 300px;"></div>',
                    footer: '<button href="#" id="btn-add" class="btn btn-primary">' + 'Add' + '</button>',
                    closeOnEscape: true
                },
                create: function($container) {
                    this.$dialog = ui.dialog(this.dialogOption).render().appendTo($container);
                    this.$addBtn = this.$dialog.find('#btn-add');
                    this.$mapInput = this.$dialog.find('#input-autocomplete')[0];
                    this.$mapContainer = this.$dialog.find('#map-in-dialog')[0];
                },
                getAutoCompleteInput: function() {
                    return this.$mapInput;
                },
                getMapContainer: function() {
                    return this.$mapContainer
                },
                getAddButton: function() {
                    return this.$addBtn[0];
                },
                enableAddButton: function() {
                    if( this.$mapInput.value && this.$mapInput.value.length > 0 ) {
                        this.$addBtn.attr("disabled", false);
                    }
                },
                disableAddButton: function() {
                    this.$addBtn.attr("disabled", true);
                },
                show: function() {
                    this.disableAddButton();
                    this.$mapInput.value = "";

                    return $.Deferred(function(deferred) {
                        ui.onDialogShown(self.mapDialog.$dialog, function() {
                            context.triggerEvent('dialog.shown');
                            self.mapDialog.$mapInput.focus();
                            google.maps.event.trigger(self.mapDialog.map, 'resize');
                             $('.modal-backdrop').css("z-index", 10);

                            self.mapDialog.$addBtn.click(function(event) {
                                event.preventDefault();
                                deferred.resolve({place: self.mapDialog.$mapInput.value});
                            });
                        });

                        ui.onDialogHidden(self.mapDialog.$dialog, function() {
                            self.mapDialog.marker.setVisible(false);
                            self.mapDialog.$addBtn.off('click');
                            if (deferred.state() === 'pending') {
                                deferred.reject();
                            }
                        });

                        ui.showDialog(self.mapDialog.$dialog);
                    });
                },
                showDialog: function() {
                    ui.showDialog(this.$dialog);
                },
                hideDialog: function() {
                    ui.hideDialog(this.$dialog);
                },
                initMap: function() {
                    this.map = new google.maps.Map(this.$mapContainer, {
                        center: options.map.center,
                        zoom: options.map.zoom
                    });

                    this.autocomplete = new google.maps.places.Autocomplete(this.$mapInput);
                    this.autocomplete.bindTo('bounds', this.map);

                    this.marker = new google.maps.Marker({
                        map: this.map,
                        anchorPoint: new google.maps.Point(0, -29)
                    });

                    // Update map to show selected place and place marker
                    google.maps.event.addListener(this.autocomplete, 'place_changed', function() {
                        self.mapDialog.marker.setVisible(false);
                        var place = self.mapDialog.autocomplete.getPlace();
                        if (!place.geometry) {
                            self.mapDialog.disableAddButton();
                            console.log("Autocomplete's returned place contains no geometry");
                            return;
                        }

                        // If the place has a geometry, then present it on a map.
                        if (place.geometry.viewport) {
                            self.mapDialog.map.fitBounds(place.geometry.viewport);
                        } else {
                            self.mapDialog.map.setCenter(place.geometry.location);
                            self.mapDialog.map.setZoom(options.map.zoom);
                        }

                        self.mapDialog.marker.setIcon( /** @type {google.maps.Icon} */ ({
                            url: place.icon,
                            size: new google.maps.Size(71, 71),
                            origin: new google.maps.Point(0, 0),
                            anchor: new google.maps.Point(17, 34),
                            scaledSize: new google.maps.Size(35, 35)
                        }));

                        self.mapDialog.marker.setPosition(place.geometry.location);
                        self.mapDialog.marker.setVisible(true);
                        self.mapDialog.enableAddButton();
                    });
                }
            };

            this.show = function() {
                context.invoke('editor.saveRange');

                self.mapDialog.show()
                    .then(function(data) {
                        context.invoke('editor.restoreRange');
                        self.insertEmbedMapToEditor(data.place);
                        self.mapDialog.hideDialog();
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
                    'height': '0'
                });

                var $iframe = $('<iframe>', {
                    src: EMBED_URL.replace("PLACE", placeName),
                    height: '250px'
                });

                $iframe.css({
                    'position': 'absolute',
                    'top': '0',
                    'left': '0',
                    'width': '60%',
                    'height': '60%'
                });

                $div.html($iframe)
                context.invoke('editor.insertNode',  $div[0]);
            };
        }
    });
}));
