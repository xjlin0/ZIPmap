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


    // function getColor(d) {
    //         return d > 50000 ? '#800026' :
    //             d > 20000 ? '#BD0026' :
    //             d > 10000 ? '#E31A1C' :
    //             d > 5000 ? '#FC4E2A' :
    //             d > 2000 ? '#FD8D3C' :
    //             d > 1000 ? '#FEB24C' :
    //             d > 500 ? '#FED976' :
    //             '#FFEDA0';
    //     }  //original series from http://leafletjs.com/examples/choropleth.html, looked bad and redish
    function getColor(d) {
            return d > 50000 ? '#49527a' :
                d > 20000 ? '#626da3' :
                d > 10000 ? '#7a89cc' :
                d > 5000 ? '#93a4f5' :
                d > 2000 ? '#9daeff' :
                d > 1000 ? '#adbcff' :
                d > 500 ? '#bec9ff' :
                '#ced7ff';
        }   // Katie's suggestion on blue //CA 29760021      NV 1201833  WY 450000


    // function getColor(d) {
    //         return d > 50000 ? '#524c38' :
    //             d > 20000 ? '#7a7254' :
    //             d > 10000 ? '#a3986f' :
    //             d > 5000 ? '#ccbe8b' :
    //             d > 2000 ? '#f5e4a7' :
    //             d > 1000 ? '#ffeeb1' :
    //             d > 500 ? '#fff1b1' :
    //             '#fff4cb';
    //     }  // Hannah's suggestion, looked grey out



    $('#map').css('height', $(window).height() - 200).css('border-radius', '5px')
    // $('#map').css('height', '500px').css('border-radius', '5px')
    var mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
    var map = L.map('map').setView([37.784633, -122.397414], 15);


    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; ' + mapLink + ' Contributors',
        maxZoom: 18,
    }).addTo(map);
    L.control.scale({
        metric: false
    }).addTo(map); // show scale on the map (lower left)

    // queryUrl= 'http://localhost:8080/geoserver/zcta510/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=zcta510:zcta510&outputFormat=text/javascript&format_options=callback:callback&featuretype&CQL_FILTER=ZCTA5CE10=';

    // map.addControl( new L.Control.Search({ url:queryUrl+'{s}', jsonpParam:'callback', text:'Color...', markerLocation: true}) );

    var redIcon = L.icon({
        iconUrl: '/js/images/r-icon.png',
        shadowUrl: '/js/images/r-shadow.png',
        iconSize: [25, 41], // size of the icon
        shadowSize: [41, 41], // size of the shadow
        iconAnchor: [12, 41], // point of the icon which will correspond to marker's location
        shadowAnchor: [10, 41], // the same for the shadow
        popupAnchor: [1, -46] // point from which the popup should open relative to the iconAnchor
    });

    var marker = L.marker([37.784633, -122.397414], {
        icon: redIcon,
        bounceOnAdd: true,
        bounceOnAddOptions: {
            duration: 3000
        },
    }).addTo(map);

    marker.bindPopup("DBC rocks!").openPopup();

    var style = {
        "clickable": true,
        "color": "#00D",
        // "fillColor": "#00D",  #decided later
        "weight": 1.0,
        "opacity": 0.3,
        "fillOpacity": 0.3
    };
    var hoverStyle = {
        "fillOpacity": 0.6
    };

    // http://gis.stackexchange.com/questions/48522/geoserver-callback-function-undefinded
    var geojsonLayer = new L.GeoJSON(null, {
        style: style,
        onEachFeature: onEachFeature
    }); // initialize new GeoJSON object with style&functions for incoming Ajax loading

//http://labs.easyblog.it/maps/leaflet-search/examples/ajax-jquery.html

    //queryUrl= 'http://localhost:8080/geoserver/zcta510/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=zcta510:zcta510&outputFormat=text/javascript&featuretype&CQL_FILTER=ZCTA5CE10='

    // map.addControl( new L.Control.Search({ url:queryUrl+'{s}', text:'search zip code..', markerLocation: true}) );



    map.on('moveend resize', function() {
        // How can I cache the previously got JSON?

        //var geojsonURL = "http://localhost:8080/geoserver/combine/ows?service=wfs&version=1.0.0&request=GetFeature&typeName=combine:combined&maxFeatures=200&outputFormat=text/javascript&format_options=callback:getJson&bbox=" + map.getBounds().toBBoxString();

        var geojsonURL = "http://ec2-52-8-27-38.us-west-1.compute.amazonaws.com:8080/geoserver/combine/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=combine:combined&maxFeatures=200&outputFormat=text/javascript&format_options=callback:getJson&bbox=" + map.getBounds().toBBoxString();

        $.ajax({
                url: geojsonURL,
                dataType: 'jsonp',
                jsonpCallback: 'getJson'
            })
            .done(function handleJson(data) {
                // console.log(data)
                geojsonLayer.clearLayers();
                geojsonLayer.addData(data);
                geojsonLayer.eachLayer(function(layer) {
                    layer.setStyle({
                            fillColor: getColor(layer.feature.properties.HC01_VC03) //population
                        }) //set fill color according to population, change "PERSONS" later
                    layer.bindLabel(layer.feature.properties.ZCTA5CE10 + ' median age: ' + layer.feature.properties.HC01_VC23, {
                        noHide: true,
                        direction: 'auto',
                        className: 'popup'
                    }); //this bindLabel moves with the mouse curser

                    var myTextLabel = L.marker(layer.getBounds().getCenter(), {
                        icon: L.divIcon({
                            className: 'text-labels', // Set class for CSS styling
                            html: layer.feature.properties.ZCTA5CE10
                        }),
                        draggable: true, // Allow label dragging...
                        zIndexOffset: 1000 // Make appear above other map features
                    });
                    myTextLabel.addTo(layer);
                });
            }).fail(function() {
                console.log("error");
            }).always(function() {
                console.log("complete");
            });

        map.addLayer(geojsonLayer);

    });
});