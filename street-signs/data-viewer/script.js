require([
    "esri/Map",
    "esri/views/MapView",
    "esri/widgets/Home",
    "esri/widgets/Locate",
    "esri/widgets/BasemapGallery",
    "esri/widgets/Expand",
    "esri/layers/FeatureLayer",
    "esri/layers/TileLayer",
    "esri/Graphic",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/renderers/UniqueValueRenderer",
    "esri/symbols/PictureMarkerSymbol",
    "esri/widgets/Popup",
    "esri/core/reactiveUtils"
    ], function(Map, MapView, Home, Locate, BasemapGallery, Expand, FeatureLayer, TileLayer, Graphic, SimpleMarkerSymbol, UniqueValueRenderer, PictureMarkerSymbol, Popup, reactiveUtils) {
        const streetlightButton = document.getElementById('toggleStreetlight');
        const streetsignButton = document.getElementById('toggleStreetsign');
        const imageryButton = document.getElementById('toggleImagery');


        var map = new Map({
            basemap: "hybrid"
        });

        var view = new MapView({
            container: "map",
            map: map,
            extent: {
                xmin: -123,
                ymin: 45.585,
                xmax: -122.99,
                ymax: 45.61,
            spatialReference: { wkid: 4326 }
            }
        });

        var locateWidget = new Locate({
            view: view,
            useHeadingEnabled: false,
            goToOverride: function(view, options) {
            options.target.scale = 1500;
            return view.goTo(options.target);
            }
        });

        let homeWidget = new Home({
            view: view
        }); 

        let basemapGallery = new BasemapGallery({
            view: view
        });

        let bgExpand = new Expand({
            view: view,
            content: basemapGallery,
            expandIconClass: "esri-icon-basemap",
            expandTooltip: "Change Basemap",
            group: "top-left",
            autoCollapse: true
        });

        var streetsignPopupTemplate = {
            title: "{streetsignType}",
            content: [{
                type: "fields",
                fieldInfos: [
                    { fieldName: "streetsignStatus", label: "Sign Status" },
                    { fieldName: "streetsignReflective", label: "Reflective?" },
                    { fieldName: "commentContents", label: "Comments" }
                    ]
                },
                {
                    type: "media",
                    mediaInfos: [
                        {
                            title: "Image 1",
                            type: "image",
                            value: {
                                sourceURL: "images/{OBJECTID}-1.jpeg"
                            }
                        },
                        {
                            title: "Image 2",
                            type: "image",
                            value: {
                                sourceURL: "images/{OBJECTID}-2.jpeg"
                            }
                        },
                        {
                            title: "Image 3",
                            type: "image",
                            value: {
                                sourceURL: "images/{OBJECTID}-3.jpeg"
                            }
                        }
                    ]
                }
            ]
        }

        var streetlightPopupTemplate = {
            title: `Streetlight Status: {streetlightStatus}`,
            content: [{
                type: "fields",
                fieldInfos: [
                    { fieldName: "streetlightStatus", label: "Streetlight Status" },
                    { fieldName: "streetlightType", label: "Attachment Type" },
                    { fieldName: "streetlightMaterial", label: "Material" },
                    { fieldName: "streetlightNight", label: "Night Status" },
                    { fieldName: "commentContents", label: "Comments" }
                    ]
                },
                ,
                {
                    type: "media",
                    mediaInfos: [
                        {
                            title: "Image 1",
                            type: "image",
                            value: {
                                sourceURL: "images/{OBJECTID}-1.jpeg"
                            }
                        },
                        {
                            title: "Image 2",
                            type: "image",
                            value: {
                                sourceURL: "images/{OBJECTID}-2.jpeg"
                            }
                        },
                        {
                            title: "Image 3",
                            type: "image",
                            value: {
                                sourceURL: "images/{OBJECTID}-3.jpeg"
                            }
                        }
                    ]
                }
            ]
        }

        var streetsignRenderer = new UniqueValueRenderer({
            field: "streetsignType",
            defaultSymbol: new PictureMarkerSymbol({
                url: "https://upload.wikimedia.org/wikipedia/commons/d/d9/Icon-round-Question_mark.svg",
                width: "20px",
                height: "20px"
            }),
            uniqueValueInfos: [
                {
                    value: "Stop Sign",
                    symbol: new PictureMarkerSymbol({
                        url: "https://upload.wikimedia.org/wikipedia/commons/2/20/Stopsign.svg",
                        width: "20px",
                        height: "20px"
                    })
                },
                {
                    value: "Stop Sign/Cross Streets",
                    symbol: new PictureMarkerSymbol({
                        url: "https://upload.wikimedia.org/wikipedia/commons/2/20/Stopsign.svg",
                        width: "20px",
                        height: "20px"
                    })
                },
                {
                    value: "Cross Streets",
                    symbol: new PictureMarkerSymbol({
                        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSaPa10f5nJJ8RfBS2Ap7ElWbQtGkdjkNUbeQ&s",
                        width: "30px",
                        height: "10px"
                    })
                },
                {
                    value: "Stop Ahead",
                    symbol: new PictureMarkerSymbol({
                        url: "https://upload.wikimedia.org/wikipedia/commons/7/7d/MUTCD_W3-1_%28non-compliant_4%29.svg",
                        width: "20px",
                        height: "20px"
                    })
                },
                {
                    value: "Traffic Light",
                    symbol: new PictureMarkerSymbol({
                        url: "https://upload.wikimedia.org/wikipedia/commons/9/95/LED_traffic_light.svg",
                        width: "20px",
                        height: "20px"
                    })
                },
                {
                    value: "Yield Sign",
                    symbol: new PictureMarkerSymbol({
                        url: "https://upload.wikimedia.org/wikipedia/commons/3/39/MUTCD_R1-2.svg",
                        width: "20px",
                        height: "20px"
                    })
                },
                {
                    value: "Speed Limit",
                    symbol: new PictureMarkerSymbol({
                        url: "https://upload.wikimedia.org/wikipedia/commons/5/5d/Oregon-speed.svg",
                        width: "20px",
                        height: "20px"
                    })
                },
                {
                    value: "Railroad Crossing",
                    symbol: new PictureMarkerSymbol({
                        url: "https://upload.wikimedia.org/wikipedia/commons/d/d4/MUTCD_W10-1_%28non-compliant%29.svg",
                        width: "20px",
                        height: "20px"
                    })
                },
                {
                    value: "Crosswalk",
                    symbol: new PictureMarkerSymbol({
                        url: "https://upload.wikimedia.org/wikipedia/commons/2/23/MUTCD_Sign_Assembly_-_W11-2_with_W16-7PL.svg",
                        width: "20px",
                        height: "20px"
                    })
                },
                {
                    value: "Roundabout",
                    symbol: new PictureMarkerSymbol({
                        url: "https://upload.wikimedia.org/wikipedia/commons/8/8f/MUTCD_Sign_Assembly_-_W2-6_with_W16-12aP.svg",
                        width: "20px",
                        height: "20px"
                    })
                },
                {
                    value: "Slippery When Icy",
                    symbol: new PictureMarkerSymbol({
                        url: "https://upload.wikimedia.org/wikipedia/commons/6/63/MUTCD_Sign_Assembly_-_W8-5_with_W8-5aP.svg",
                        width: "20px",
                        height: "20px"
                    })
                },
                {
                    value: "Slow",
                    symbol: new PictureMarkerSymbol({
                        url: "https://upload.wikimedia.org/wikipedia/commons/a/ab/United_States_sign_-_Slow.svg",
                        width: "20px",
                        height: "20px"
                    })
                },
                {
                    value: "Slow Traffic Ahead",
                    symbol: new PictureMarkerSymbol({
                        url: "https://upload.wikimedia.org/wikipedia/commons/5/55/United_States_sign_-_Slow_Traffic_Ahead.svg",
                        width: "20px",
                        height: "20px"
                    })
                },
                {
                    value: "One Way",
                    symbol: new PictureMarkerSymbol({
                        url: "https://upload.wikimedia.org/wikipedia/commons/0/05/MUTCD_R6-2L.svg",
                        width: "20px",
                        height: "20px"
                    })
                },
                {
                    value: "School Zone",
                    symbol: new PictureMarkerSymbol({
                        url: "https://upload.wikimedia.org/wikipedia/commons/6/62/MUTCD-CA_SW24-1.svg",
                        width: "20px",
                        height: "20px"
                    })
                },
                {
                    value: "End School Zone",
                    symbol: new PictureMarkerSymbol({
                        url: "https://upload.wikimedia.org/wikipedia/commons/6/62/MUTCD-CA_SW24-1.svg",
                        width: "20px",
                        height: "20px"
                    })
                },
                {
                    value: "Curvy Road",
                    symbol: new PictureMarkerSymbol({
                        url: "https://upload.wikimedia.org/wikipedia/commons/3/3c/CL_road_sign_PG-4a.svg",
                        width: "20px",
                        height: "20px"
                    })
                },
                {
                    value: "Type 3 Barricade",
                    symbol: new PictureMarkerSymbol({
                        url: "https://cdni.iconscout.com/illustration/premium/thumb/traffic-road-barriers-illustration-download-in-svg-png-gif-file-formats--barrier-various-themes-set-128-pack-miscellaneous-illustrations-9142180.png?f=webp",
                        width: "30px",
                        height: "30px"
                    })
                },
                {
                    value: "No Parking",
                    symbol: new PictureMarkerSymbol({
                        url: "https://upload.wikimedia.org/wikipedia/commons/5/5b/Philippines_road_sign_R5-3P.svg",
                        width: "15px",
                        height: "20px"
                    })
                },
                {
                    value: "No Parking (One Way)",
                    symbol: new PictureMarkerSymbol({
                        url: "https://upload.wikimedia.org/wikipedia/commons/5/5b/Philippines_road_sign_R5-3P.svg",
                        width: "15px",
                        height: "20px"
                    })
                },
                {
                    value: "No Parking (Two Way)",
                    symbol: new PictureMarkerSymbol({
                        url: "https://upload.wikimedia.org/wikipedia/commons/5/5b/Philippines_road_sign_R5-3P.svg",
                        width: "15px",
                        height: "20px"
                    })
                }
            ]
        });

        var streetlightRenderer = new UniqueValueRenderer({
            field: "streetlightNight",
            defaultSymbol: new SimpleMarkerSymbol(),
            uniqueValueInfos: [
                { value: "Not checked", symbol: {type: "simple-marker", size: 5, color: [255, 255, 0], outline: null }},
                { value: "Light Working", symbol: {type: "simple-marker", size: 5, color: [0, 255, 0], outline: null }},
                { value: "Light Out", symbol: {type: "simple-marker", size: 5, color: [255, 0, 0], outline: null }}
            ]
        });

        var reportsLayer = new FeatureLayer({
            url: "https://services3.arcgis.com/pZZTDhBBLO3B9dnl/arcgis/rest/services/StreetsignReports/FeatureServer/0",
            popupTemplate: streetsignPopupTemplate,
            outFields: ['*'],
            editable: true,
            renderer: streetsignRenderer,
            definitionExpression: "reportType = 'streetsign'"
        });

        var streetlightLayer = new FeatureLayer({
            url: "https://services3.arcgis.com/pZZTDhBBLO3B9dnl/arcgis/rest/services/StreetsignReports/FeatureServer/0",
            popupTemplate: streetlightPopupTemplate,
            outFields: ['*'],
            editable: true,
            renderer: streetlightRenderer,
            definitionExpression: "reportType = 'streetlight'"
        });

        var aerialImagery = new TileLayer({
            url: "https://tiles.arcgis.com/tiles/pZZTDhBBLO3B9dnl/arcgis/rest/services/NPaerial24_online/MapServer"
        });

        map.add(aerialImagery);
        map.add(reportsLayer);
        map.add(streetlightLayer);

        streetlightLayer.effect = "bloom(1, 0.2px, 10%)";

        streetlightButton.addEventListener('click', () => {
            if (streetlightButton.classList.contains('selected')) {
                streetlightButton.classList.remove('selected');
            } else {
                streetlightButton.classList.add('selected')
            }

            streetlightLayer.visible = !streetlightLayer.visible;
        });
        
        streetsignButton.addEventListener('click', () => {
            if (streetsignButton.classList.contains('selected')) {
                streetsignButton.classList.remove('selected');
            } else {
                streetsignButton.classList.add('selected')
            }

            reportsLayer.visible = !reportsLayer.visible;
        });
        
        imageryButton.addEventListener('click', () => {
            if (imageryButton.classList.contains('selected')) {
                imageryButton.classList.remove('selected');
            } else {
                imageryButton.classList.add('selected')
            }

            aerialImagery.visible = !aerialImagery.visible;
        });
        view.ui.add(locateWidget, "top-left");
        view.ui.add(homeWidget, "top-left");
        view.ui.add(bgExpand, "top-left");
});