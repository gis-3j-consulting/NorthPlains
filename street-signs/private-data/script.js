require([
    "esri/Map",
    "esri/views/MapView",
    "esri/widgets/Home",
    "esri/widgets/Locate",
    "esri/layers/FeatureLayer",
    "esri/layers/TileLayer",
    "esri/Graphic",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/renderers/UniqueValueRenderer",
    "esri/symbols/PictureMarkerSymbol",
    "esri/core/reactiveUtils",
    "esri/identity/OAuthInfo",
    "esri/identity/IdentityManager"
    ], function(Map, MapView, Home, Locate, FeatureLayer, TileLayer, Graphic, SimpleMarkerSymbol, UniqueValueRenderer, PictureMarkerSymbol, reactiveUtils, OAuthInfo, esriId) {    
        let addMode = null;
        let currentPoint = null;
        let selectedSign = null;
        let isAdjustingLocation = false;
        const signOptions = document.querySelectorAll('.sign-option');
        const reportModal = document.getElementById('reportModal');
        const streetsignContent = document.getElementById('streetsignContent');
        const streetsignStatusDropdown = document.getElementById('streetsignStatus');
        const streetsignReflectiveDropdown = document.getElementById('streetsignReflective');
        const streetlightContent = document.getElementById('streetlightContent');
        const streetlightDropdown = document.getElementById('streetlightDropdown');
        const streetlightTypeDropdown = document.getElementById('streetlightType');
        const streetlightMaterialDropdown = document.getElementById('streetlightMaterial');
        const commentField = document.getElementById('commentField');
        const otherSignText = document.getElementById('other-sign-text');
        const otherSignOption = document.getElementById('other-sign-option');
        const adjustLocationButton = document.getElementById('adjustLocation');
        const locationConfirmButton = document.getElementById('locationConfirmButton');
        const fileInputs = [
            document.getElementById('fileInput1'),
            document.getElementById('fileInput2'),
            document.getElementById('fileInput3')
        ]
        
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
        
        const lightOn = { title: "Light Working", id: "light-on", className: "esri-icon-notice-round" };
        const lightOut = { title: "Light Out", id: "light-out", className: "esri-icon-share" };

        var streetsignPopupTemplate = {
            title: "{streetsignType}",
            content: [{
                type: "fields",
                fieldInfos: [
                    { fieldName: "streetsignStatus", label: "Sign Status" },
                    { fieldName: "streetsignReflective", label: "Reflective?" },
                    { fieldName: "commentContents", label: "Comments" }
                ]
            }]
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
            }],
            actions: [lightOn, lightOut]
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
            url: "https://services3.arcgis.com/pZZTDhBBLO3B9dnl/arcgis/rest/services/StreetSignsPrivate/FeatureServer/0",
            popupTemplate: streetsignPopupTemplate,
            outFields: ['*'],
            editable: true,
            renderer: streetsignRenderer,
            definitionExpression: "reportType = 'streetsign'"
        });

        var streetlightLayer = new FeatureLayer({
            url: "https://services3.arcgis.com/pZZTDhBBLO3B9dnl/arcgis/rest/services/StreetSignsPrivate/FeatureServer/0",
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

        function nightCheck(event) {
            var selectedFeature = view.popup.selectedFeature;
            console.log(selectedFeature);
            
            if (!selectedFeature) return;

            let newStatus = null;
            let updatedFeature = {
                attributes: {
                    ...selectedFeature.attributes
                }
            };

            if (event.action.id === "light-on") {
                newStatus = "Light Working";
            } else if (event.action.id === "light-out") {
                newStatus = "Light Out";
            }

            if (newStatus) {
                updatedFeature.attributes.streetlightNight = newStatus;

                console.log(`Updating feature ${updatedFeature.id} with status ${newStatus} (${updatedFeature.attributes.streetlightNight})`)
                
                streetlightLayer.applyEdits({ 
                    updateFeatures: [updatedFeature]
                }).then(function() {
                    view.popup.close();
                    view.popup.clear();
                });
            }
        }

        reactiveUtils.on(
            () => view.popup,
            "trigger-action",
            (event) => {
                nightCheck(event);
            }
        );
        
        
        document.getElementById("addStreetsign").addEventListener("click", function() {
            addMode = "streetsign";
            document.getElementById("map").style.cursor = "crosshair";
        });

        document.getElementById("addStreetlight").addEventListener("click", function() {
            addMode = "streetlight";
            document.getElementById("map").style.cursor = "crosshair";
        });

        view.on("click", function(event) {
            if (addMode === null && !isAdjustingLocation) return;
        
            var point = event.mapPoint;
        
            view.graphics.removeAll();
            var newGraphic = new Graphic({
                geometry: point,
                symbol: new SimpleMarkerSymbol({
                    color: "white",
                    size: 8,
                    outline: { color: [0, 0, 0], width: 1 }
                })
            });
            view.graphics.add(newGraphic);
        
            currentPoint = point;
        
            if (isAdjustingLocation) return;
        
            reportModal.style.display = "block";
            if (addMode === "streetlight") {
                streetlightContent.style.display = "block";
                streetsignContent.style.display = "none";
            } else if (addMode === "streetsign") {
                streetsignContent.style.display = "block";
                streetlightContent.style.display = "none";
            }
            document.getElementById('map').style.cursor = "auto";
        });

        document.getElementById("submitReport").addEventListener("click", function() {
            var streetsignType = selectedSign;
            var streetlightStatus = streetlightDropdown.value;
            var comments = commentField.value;
            var streetsignStatus = streetsignStatusDropdown.value;
            var streetsignReflective = streetsignReflectiveDropdown.value;
            var streetlightType = streetlightTypeDropdown.value;
            var streetlightMaterial = streetlightMaterialDropdown.value;

            const imageNames = fileInputs
                .map(input => input.value ? input.value.split('\\').pop() : '')
                .filter(name => name !== '');

            if ((addMode === "streetsign" && streetsignType === "None") || 
                (addMode === "streetlight" && streetlightStatus === "None")) {
                alert("Please select a type");
                return;
            }

            var attributes = {
                reportType: addMode,
                streetsignType: streetsignType,
                streetsignStatus: streetsignStatus,
                streetsignReflective: streetsignReflective,
                streetlightStatus: streetlightStatus,
                streetlightType: streetlightType,
                streetlightMaterial: streetlightMaterial,
                streetlightNight: "Not checked",
                commentContents: comments,
                images: imageNames.join(',')
            };

            console.log("Submitting report with the following details:");
            console.log("Point Geometry:", currentPoint);
            console.log("Attributes:", attributes);
            console.log("Image Names:", imageNames);

            var newGraphic = new Graphic({
                geometry: currentPoint,
                attributes: attributes
            });

            var targetLayer = (addMode === "streetsign") ? reportsLayer : streetlightLayer;

            targetLayer.applyEdits({
                addFeatures: [newGraphic]
            })
            .then(function(results) {
                console.log("ApplyEdits results:", results);

                if (results.addFeatureResults.length > 0) {
                    console.log("Feature successfully added.");
                    reportModal.style.display = "none";
                    view.graphics.removeAll();
                    streetlightDropdown.value = "None";
                    streetlightTypeDropdown.value = "None";
                    streetlightMaterialDropdown.value = "None";
                    streetsignStatusDropdown.value = "None";
                    streetsignReflectiveDropdown.value = "None";
                    selectedSign = null;
                    commentField.value = "";
                    fileInputs.forEach(input => input.value = '');
                    addMode = null;
                } else {
                    console.warn("No features were added.");
                }
            })
            .catch(function(error) {
                console.error("Error during applyEdits:", error);
                alert("Error submitting report. Please check the console for details.");
            });
        });

        document.getElementById("cancelReport").addEventListener("click", function() {
            reportModal.style.display = "none";
            view.graphics.removeAll();
            streetlightDropdown.value = "None";
            streetlightTypeDropdown.value = "None";
            streetlightMaterialDropdown.value = "None";
            streetsignStatusDropdown.value = "None";
            streetsignReflectiveDropdown.value = "None";
            locationConfirmButton.style.display = "None";
            selectedSign = null;
            commentField.value = null;
            fileInputs.forEach(input => input.value = '');
            addMode = null;
        });

        signOptions.forEach(option => {
            option.addEventListener('click', () => {
                signOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                selectedSign = option.dataset.value;
            });
        });

        otherSignText.addEventListener('input', () => {
            if (otherSignText.value.trim() !== '') {
                selectedSign = otherSignText.value.trim();
                signOptions.forEach(opt => opt.classList.remove('selected'));
                otherSignOption.classList.add('selected');
            }
        });

        adjustLocationButton.addEventListener("click", function() {
            reportModal.style.display = "none";
            isAdjustingLocation = true;
            document.getElementById("map").style.cursor = "crosshair";
            locationConfirmButton.style.display= "block";
        });

        locationConfirmButton.addEventListener("click", function() {
            if (currentPoint) {
                isAdjustingLocation = false;
                document.getElementById('map').style.cursor = "auto";
                locationConfirmButton.style.display = "none";

                reportModal.style.display = "block";
                if (addMode === "streetlight") {
                    streetlightContent.style.display = "block";
                    streetsignContent.style.display = "none";
                } else if (addMode === "streetsign") {
                    streetsignContent.style.display = "block";
                    streetlightContent.style.display = "none";
                }
            }
        });

        view.ui.add(locateWidget, "top-left");
        view.ui.add(homeWidget, "top-left");

        var info = new OAuthInfo({
            appId: "6SgB0tweNWk5N6kV",  
            popup: false,
            expiration: 60 * 24,
            portalUrl: "https://3j.maps.arcgis.com/"
        });
        
        esriId.registerOAuthInfos([info]);
        
        function logTokenExpiration(credential) {
            if (credential && credential.expires) {
                const expirationDate = new Date(credential.expires);
                const currentDate = new Date();
                const timeRemaining = expirationDate - currentDate;
                
                console.log("Token Expiration Details:");
                console.log("Expires at:", expirationDate.toLocaleString());
                console.log("Time remaining:", Math.round(timeRemaining / (1000 * 60)), "minutes");
            }
        }
        
        esriId.checkSignInStatus(info.portalUrl + "/sharing")
            .then(function() {
                console.log("User is already logged in.");
                logTokenExpiration(esriId.credentials[0]);
            })
            .catch(function() {
                esriId.getCredential(info.portalUrl + "/sharing", {
                    oAuthInfo: info
                });
            });
        
        if (localStorage.getItem('esriToken')) {
            const storedToken = JSON.parse(localStorage.getItem('esriToken'));
            esriId.initialize(storedToken);
            logTokenExpiration(esriId.credentials[0]);
        }
        
        esriId.on("credential-create", function(response) {
            localStorage.setItem('esriToken', JSON.stringify(esriId.toJSON()));
            logTokenExpiration(response.credential);
        });
});