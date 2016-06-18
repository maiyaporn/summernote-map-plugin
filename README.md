# summernote-map-plugin

This is a plugin for adding map to [Summernote WYSIWYG] editor. It allows users to search for places with autocomplete (Google Places API) and add an embed map of the selected place to editor.

## Demo

<a href="http://maiyaporn.github.io/summernote-map-plugin/" target="_blank">Summernote-map-plugin</a>


## Installation

Include a plugin script along with Summernote

    <!-- include jquery -->
    <script src="http://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.js"></script>

    <!-- include Bootstrap and fontawesome-->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.6/css/bootstrap.min.css" />
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.6/js/bootstrap.min.js"></script>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css" />

    <!-- include summernote css/js-->
    <link rel="stylesheet" href="http://cdnjs.cloudflare.com/ajax/libs/summernote/0.8.1/summernote.css">
    <script type="text/javascript" src="http://cdnjs.cloudflare.com/ajax/libs/summernote/0.8.1/summernote.js"></script>

    <!-- include summernote plugin-->
    <script type="text/javascript" src="summernote-map-plugin.js"></script>


Note:
  If google maps api is not already in your application, the plugin will load the script automatically with your apiKey.

## Configuration

To enable map button in toolbar, you need to add 'map' in toolbar options when initialize summernote. Also, you can provide your apiKey along with other config for the map.

    <script type="text/javascript">
      $('#summernote').summernote({
        map: {
            apiKey: 'GOOGLE_MAP_API_BROWSER_KEY',
            // This will be used when map is initialized in the dialog.
            center: {
              lat: -33.8688,
              lng: 151.2195
            },
            zoom: 13
        },
        toolbar: [
            ['insert',  'map']]
        ]
      });
    </script>

