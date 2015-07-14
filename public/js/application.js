$(document).ready(function() {
    var x = document.getElementById("demo");

    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(p) {
                map.setView([p.coords.latitude, p.coords.longitude], 13);
            })
        } else {
            x.innerHTML = "Geolocation is not supported by this browser.";
        }
    }

    function onEachFeature(feature, layer) {
        if (feature.properties) {
            var popupString = '<div class="popup">' + feature.properties.ZCTA5CE10 + ':<br />';
            // for (var k in feature.properties) {
            //     var v = feature.properties[k];
            //     popupString += k + ': ' + v + '<br />';
            // }  // works for take all properties in the JSON
            var population = feature.properties.HC01_VC03;
            var age = feature.properties.HC01_VC23;
            var income = feature.properties['2_EST_VC02']; //need to recheck
            popupString += 'Population' + ': ' + population + '<br />';
            popupString += 'Median age' + ': ' + age + '<br />';
            popupString += 'Median household income' + ':<br />' + income + '<br />';
            popupString += '</div>';
            layer.bindPopup(popupString);
        } // this shows only population, age and income
        if (!(layer instanceof L.Point)) {
            layer.on('mouseover', function() {
                layer.setStyle(hoverStyle);
            });
            layer.on('mouseout', function() {
                layer.setStyle(style);
            });
        } // changing area fillOpacity when mousehover
    }

    function getColor(d) {
            return d > 50000 ? '#49527a' :
                d > 20000 ? '#626da3' :
                d > 10000 ? '#7a89cc' :
                d > 5000 ? '#93a4f5' :
                d > 2000 ? '#9daeff' :
                d > 1000 ? '#adbcff' :
                d > 500 ? '#bec9ff' :
                '#ced7ff';
        } // Katie's suggestion on blue //CA 29760021      NV 1201833  WY 450000


    $('.navbar-brand').on('click', function(event) {
        event.preventDefault();
        getLocation();
    });

    $('#map').css('height', $(window).height() - 200).css('border-radius', '5px')
    var mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
    var map = L.map('map').setView([37.784633, -122.397414], 15); //DBC location

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
        // "fillColor": "#00D",  #will change by function getColor() later
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

    map.on('moveend resize', function() {
        // How can I cache the previously got JSON?

        //http://ec2-52-8-27-38.us-west-1.compute.amazonaws.com:8080/geoserver/combine/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=combine:combined&outputFormat=text/javascript&CQL_FILTER=ZCTA5CE10=94546  //working slow on EC2, 5 minute!!

        //http://localhost:8080/geoserver/combine/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=combine:combined&outputFormat=text/javascript&CQL_FILTER=ZCTA5CE10=94546  //working for query one zcta at localhost

        //var geojsonURL = "http://ec2-52-8-27-38.us-west-1.compute.amazonaws.com:8080/geoserver/combine/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=combine:combined&maxFeatures=200&outputFormat=text/javascript&format_options=callback:getJson&bbox=" + map.getBounds().toBBoxString(); //working for typical overlay on EC2

        var geojsonURL = "http://localhost:8080/geoserver/combine/ows?service=wfs&version=1.0.0&request=GetFeature&typeName=combine:combined&maxFeatures=200&outputFormat=text/javascript&format_options=callback:getJson&bbox=" + map.getBounds().toBBoxString(); //working for overlay on localhost

        $.ajax({
                url: geojsonURL,
                dataType: 'jsonp', // using jsonp to overcome CORS
                jsonpCallback: 'getJson',
                cache: true
            })
            .done(function(data) {
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

    // http://leafletjs.com/examples/choropleth.html  legend:
    var legend = L.control({
        position: 'bottomright'
    });

    legend.onAdd = function(map) {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 500, 1000, 2000, 5000, 10000, 20000, 50000],
            labels = [];

        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        } // loop through our density intervals and generate a label with a colored square for each interval
        return div;
    };

    legend.addTo(map);

    // map.addControl(new L.Control.Search({layer: geojsonLayer }));  //didn't work
    queryUrl= 'http://localhost:8080/geoserver/combine/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=combine:combine&outputFormat=text/javascript&CQL_FILTER=ZCTA5CE10=';

    //map.addControl( new L.Control.Search({layer: geojsonLayer, url:queryUrl+'{s}', jsonpParam:'callback', text:'Color...', markerLocation: true}) );  //didn't work

});