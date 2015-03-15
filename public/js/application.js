$(document).ready(function() {
    // This is called after the document has loaded in its entirety
    // This guarantees that any elements we bind to will exist on the page
    // when we try to bind to them
    function onEachFeature(feature, layer) {
        if (feature.properties) {
            var popupString = '<div class="popup">';
            for (var k in feature.properties) {
                var v = feature.properties[k];
                popupString += k + ': ' + v + '<br />';
            }
            popupString += '</div>';
            layer.bindPopup(popupString);
        }
        if (!(layer instanceof L.Point)) {
            layer.on('mouseover', function() {
                layer.setStyle(hoverStyle);
            });
            layer.on('mouseout', function() {
                layer.setStyle(style);
            });
        }
    }

    function getColor(d) {
            return d > 25000000 ? '#800026' :
                d > 1000000 ? '#FED976' :
                '#FFEDA0';
        } //CA 29760021      NV 1201833

    // $('#map').css('height', $(window).height() - 250).css('border-radius', '5px')
    $('#map').css('height', '400px').css('border-radius', '5px')
    var mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
    var map = L.map('map').setView([37.7749295, -122.4194155], 7);
    // console.log(map.getBounds().toBBoxString());
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; ' + mapLink + ' Contributors',
        maxZoom: 18,
    }).addTo(map);
    L.control.scale({
        metric: false
    }).addTo(map); // show scale on the map (lower left)

    var redIcon = L.icon({
        iconUrl: '/js/images/r-icon.png',
        shadowUrl: '/js/images/r-shadow.png',
        iconSize: [25, 41], // size of the icon
        shadowSize: [41, 41], // size of the shadow
        iconAnchor: [12, 41], // point of the icon which will correspond to marker's location
        shadowAnchor: [10, 41], // the same for the shadow
        popupAnchor: [1, -46] // point from which the popup should open relative to the iconAnchor
    });

    var marker = L.marker([37.7749295, -122.4194155], {
        icon: redIcon,
        bounceOnAdd: true,
        bounceOnAddOptions: {
            duration: 3000
        },
    }).addTo(map);

    marker.bindPopup("SFC").openPopup();

    var style = {
        "clickable": true,
        "color": "#00D",
        // "fillColor": "#00D",  #decided later
        "weight": 1.0,
        "opacity": 0.3,
        "fillOpacity": 0.2
    };
    var hoverStyle = {
        "fillOpacity": 0.5
    };

    // http://gis.stackexchange.com/questions/48522/geoserver-callback-function-undefinded

    var geojsonURL = "http://localhost:8080/geoserver/topp/ows?service=wfs&version=1.0.0&request=GetFeature&typeName=topp:states&outputFormat=text/javascript&format_options=callback:getJson&bbox=" + map.getBounds().toBBoxString();

    var geojsonLayer = new L.GeoJSON(null, {
        style: style,
        onEachFeature: onEachFeature
    });

    $.ajax({
            url: geojsonURL,
            dataType: 'jsonp',
            jsonpCallback: 'getJson'
        })
        .done(function handleJson(data) {
            geojsonLayer.addData(data);
            geojsonLayer.eachLayer(function(layer) {
                layer.setStyle({
                        fillColor: getColor(layer.feature.properties.PERSONS)
                    }) //set fill color according to population, change "PERSONS" later
                layer.bindLabel('HOUSHOLD: ' + layer.feature.properties.HOUSHOLD, {
                    noHide: true,
                    direction: 'auto'
                }); //this moves with mouse curser
//http://stackoverflow.com/questions/13316925/simple-label-on-a-leaflet-geojson-polygon
                label = new L.Label();  //preparing static labels for each polygon
                label.setContent(layer.feature.properties.STATE_ABBR);
                label.setLatLng(layer.getBounds().getCenter());
                map.showLabel(label);  // required to show static labels
            });

        })
        .fail(function() {
            console.log("error");
        })
        .always(function() {
            console.log("complete");
        });

    map.addLayer(geojsonLayer);

});