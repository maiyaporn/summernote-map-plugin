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
            }
        },
        'th-TH': {
            mapButton: {
                tooltip: "แผนที่"
            }
        }
    });

    $.extend($.summernote.options, {
        gmapConfig: {
          apiKey: ''
        }
    });

    // Extends plugins for adding map insertion functionality
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

            context.memo('button.map', function() {
                var button = ui.button({
                    contents: "<i class='fa fa-map-o'/>",
                    tooltip: lang.mapButton.tooltip,
                    click: function(e) {
                        context.invoke('map.show');
                    }
                });

                return button.render();
            });

            // This events will be attached when editor is initialized.
            this.events = {
                // This will be called after modules are initialized.
                'summernote.init': function (we, e) {
                  self.initMapDialog();
                }
            };

            this.insertMapDialog = {
                title: 'Add a location',
                body: '<div id="placeField" class="form-group">' + 
                       '<label>' + 'Name or Address' + '</label>' +
                       '<input id="input-autocomplete" class="form-control" type="text" placeholder="Enter a place" />' +
                      '</div>' +
                      '<div id="map-in-dialog" style="height: 300px;"></div>',
                footer: '<button href="#" id="btn-insert-map" class="btn btn-primary">' + 'Add' + '</button>',
                closeOnEscape: true
            };

            this.initMapDialog = function() {
                console.log('initMapDialog');
                var mapContainer = self.$dialog.find('#map-in-dialog')[0];
                var map = new google.maps.Map(mapContainer, {
                    center: {
                        lat: -33.8688,
                        lng: 151.2195
                    },
                    zoom: 13
                });

                var input = self.$dialog.find('#input-autocomplete')[0];
                var autocomplete = new google.maps.places.Autocomplete(input);
                autocomplete.bindTo('bounds', map);

                var marker = new google.maps.Marker({
                    map: map,
                    anchorPoint: new google.maps.Point(0, -29)
                });

                google.maps.event.addListener(autocomplete, 'place_changed', function() {
                    marker.setVisible(false);

                    var place = autocomplete.getPlace();
                    if (!place.geometry) {
                        window.alert("Autocomplete's returned place contains no geometry");
                        return;
                    }

                    // If the place has a geometry, then present it on a map.
                    if (place.geometry.viewport) {
                        map.fitBounds(place.geometry.viewport);
                    } else {
                        map.setCenter(place.geometry.location);
                        map.setZoom(13); // Why 17? Because it looks good.
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
            };

            this.initialize = function() {
                var $container = options.dialogsInBody ? $(document.body) : $editor;
                self.$dialog = ui.dialog(this.insertMapDialog).render().appendTo($container);
            };

            this.destroy = function() {
                ui.hideDialog(this.$dialog);
                self.$dialog.remove();
            };

            this.bindEnterKey = function($input, $btn) {
                $input.on('keypress', function(event) {
                    if (event.keyCode === 13) {
                        $btn.trigger('click');
                    }
                });
            };

            this.show = function() {
                this.showInsertMapDialog().then(function(imgInfo) {
                    var input = self.$dialog.find('#input-autocomplete')[0];
                    var place = input.value;
                    ui.hideDialog(self.$dialog);
                    input.value = "";

                    var iframe = document.createElement('iframe');
                    iframe.width = "400";
                    iframe.height = "300";
                    iframe.src = "https://www.google.com/maps/embed/v1/place?key=" + options.gmapConfig.apiKey + "&q=" + place;
                    context.invoke('editor.insertNode', iframe);
                });
            };

            this.showInsertMapDialog = function() {
                return $.Deferred(function(deferred) {

                    $addBtn = self.$dialog.find('#btn-insert-map');

                    ui.onDialogShown(self.$dialog, function() {
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
