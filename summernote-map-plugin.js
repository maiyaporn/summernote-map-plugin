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

    // Extends plugins for adding hello.
    //  - plugin is external module for customizing.

    // map options - map size
    //                        - autocomplete filter
    //                        - static map/iframe
    $.extend($.summernote.plugins, {
        /**
         * @param {Object} context - context object has status of editor.
         */
        'map': function(context) {
            var self = this;

            var ui = $.summernote.ui;
            var $note = context.layoutInfo.note;
            var $editor = context.layoutInfo.editor;
            var $editable = context.layoutInfo.editable;

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
                  console.log('summernote initialized', we, e);
                  console.log(self.$dialog);
                },
                // This will be called when user releases a key on editable.
                'summernote.keyup': function (we, e) {
                  console.log('summernote keyup', we, e);
                }
              };

            this.initialize = function() {
                console.log('initialize');
                var $container = options.dialogsInBody ? $(document.body) : $editor;

                var body = '<div id="placeField" class="form-group">' +
                    '<label>' + 'Name or Address' + '</label>' +
                    '<input id="autocomplete" class="form-control" type="text" placeholder="Enter a place" />' +
                    '</div>' +
                    '<div id="map"></div>';

                var footer = '<button href="#" class="btn btn-primary btn-add-map">' + 'Add' + '</button>';

                self.$dialog = ui.dialog({
                    title: 'Add a location',
                    body: body,
                    footer: footer,
                    closeOnEscape: true
                }).render().appendTo($container);


                var mapDiv = self.$dialog.find('#map')[0];
                var mapOptions = {

                };

                var map = new google.maps.Map(mapDiv, {
                    center: {
                        lat: -33.8688,
                        lng: 151.2195
                    },
                    zoom: 13
                });

                var input = self.$dialog.find('#autocomplete')[0];

                var autocomplete = new google.maps.places.Autocomplete(input);
                autocomplete.bindTo('bounds', map);

                var marker = new google.maps.Marker({
                    map: map,
                    anchorPoint: new google.maps.Point(0, -29)
                });

                google.maps.event.addListener(autocomplete, 'place_changed', function() {
                    marker.setVisible(false);
                    var place = autocomplete.getPlace();
                    console.log(place);
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
                console.log('show');
                var $img = $($editable.data('target'));
                var imgInfo = {
                };

                this.showMapDialog(imgInfo).then(function(imgInfo) {
                    console.log('show -- showMapDialog');
                    console.log(self.$dialog.find('#autocomplete'));

                    ui.hideDialog(self.$dialog);

                    var iframe = document.createElement('iframe');
                    iframe.width = "400";
                    iframe.height = "300";
                    iframe.src = "https://www.google.com/maps/embed/v1/place?key=API_KEY&q=Eiffel+Tower,Paris+France"
                    context.invoke('editor.insertNode', iframe);
                });
            };

            this.showMapDialog = function(imgInfo) {
                console.log('showMapDialog');
                return $.Deferred(function(deferred) {
                    $addBtn = self.$dialog.find('.btn-add-map');

                    ui.onDialogShown(self.$dialog, function() {
                        context.triggerEvent('dialog.shown');

                        $addBtn.click(function(event) {
                            event.preventDefault();
                            deferred.resolve({
                            });
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
