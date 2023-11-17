﻿window.OnlineMapCustomItem = (function () {
    const Dashboard = DevExpress.Dashboard;
    const Model = DevExpress.Dashboard.Model;
    const Designer = DevExpress.Dashboard.Designer;
    const dxMap = DevExpress.ui.dxMap;

    const ONLINE_MAP_EXTENSION_NAME = 'OnlineMap';

    const svgIcon = `<?xml version="1.0" encoding="utf-8"?>
        <svg version="1.1" id="` + ONLINE_MAP_EXTENSION_NAME + `" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve">
            <path class="dx-dashboard-contrast-icon" d="M12,1C8.1,1,5,4.1,5,8c0,3.9,3,10,7,15c4-5,7-11.1,7-15C19,4.1,15.9,1,12,1z M12,12c-2.2,0-4-1.8-4-4
                c0-2.2,1.8-4,4-4s4,1.8,4,4C16,10.2,14.2,12,12,12z"/>
            <circle class="dx-dashboard-accent-icon" cx="12" cy="8" r="2"/>
        </svg>`;

    const onlineMapMetadata = {
        bindings: [{
            propertyName: 'Latitude',
            dataItemType: 'Dimension',
            array: false,
            enableInteractivity: true,
            displayName: 'Latitude',
            emptyPlaceholder: 'Set Latitude',
            selectedPlaceholder: 'Configure Latitude',
            constraints: {
                allowedTypes: ['Integer', 'Float', 'Double', 'Decimal']
            }
        }, {
            propertyName: 'Longitude',
            dataItemType: 'Dimension',
            array: false,
            enableInteractivity: true,
            displayName: 'Longitude',
            emptyPlaceholder: 'Set Longitude',
            selectedPlaceholder: 'Configure Longitude',
            constraints: {
                allowedTypes: ['Integer', 'Float', 'Double', 'Decimal']
            }
        }, {
            propertyName: 'Tooltip',
            dataItemType: 'Dimension',
            array: false,
            enableInteractivity: true,
            displayName: 'Tooltip',
            emptyPlaceholder: 'Set Tooltip',
            selectedPlaceholder: 'Configure Tooltip',
            constraints: {
                allowedTypes: ['Text']
            }
        }],
        customProperties: [{
            ownerType: Model.CustomItem,
            propertyName: 'Provider',
            valueType: 'string',
            defaultValue: 'Bing'
        }, {
            ownerType: Model.CustomItem,
            propertyName: 'Type',
            valueType: 'string',
            defaultValue: 'RoadMap'
        }, {
            ownerType: Model.CustomItem,
            propertyName: 'DisplayMode',
            valueType: 'string',
            defaultValue: 'Markers'
        }],
        optionsPanelSections: [{
            title: 'Custom Options',
            items: [{
                dataField: 'Provider',
                template: Designer.FormItemTemplates.buttonGroup,
                editorOptions: {
                    items: [{ text: 'Google' }, { text: 'Bing' }]
                }
            }, {
                dataField: 'Type',
                    template: Designer.FormItemTemplates.buttonGroup,
                editorOptions: {
                    items: [{ text: 'RoadMap' }, { text: 'Satellite' }, { text: 'Hybrid' }]
                }
            }, {
                dataField: 'DisplayMode',
                    template: Designer.FormItemTemplates.buttonGroup,
                editorOptions: {
                    keyExpr: 'value',
                    items: [{
                        value: 'Markers',
                        text: 'Markers'
                    }, {
                        value: 'Routes',
                        text: 'Routes'
                    }, {
                        value: 'MarkersAndRoutes',
                        text: 'All'
                    }]
                }
            }]
        }],
        interactivity: {
            filter: true,
            drillDown: false
        },
        icon: ONLINE_MAP_EXTENSION_NAME,
        title: 'Online Map',
        index: 1
    };

    class OnlineMapItemViewer extends DevExpress.Dashboard.CustomItemViewer {
        constructor(model, $container, options) {
            super(model, $container, options);
            this.mapViewer = null;
        }

        _onClick(index, row) {
            var markers = this.mapViewer.option('markers');
            for (var i = 0; i < markers.length; i++) {
                markers[i].tooltip.isShown = i == index;
            }

            this.setMasterFilter(row);
            this._updateSelection();
        }

        _updateSelection() {
            var markers = this.mapViewer.option('markers');
            markers.forEach(marker => {
                marker.iconSrc = this.isSelected(marker.tag) ? "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/maps/map-marker.png" : null;
            });
            this.mapViewer.option('autoAdjust', false);
            this.mapViewer.option('markers', markers);
        }

        setSize(width, height) {
            super.setSize(width, height);
            let contentWidth = this.contentWidth(),
                contentHeight = this.contentHeight();
            this.mapViewer.option('width', contentWidth);
            this.mapViewer.option('height', contentHeight);
        }
        setSelection(values) {
            super.setSelection(values);
            this._updateSelection();
        }
        clearSelection() {
            super.clearSelection();
            this._updateSelection();
        }

        renderContent($element, changeExisting) {
            let markers = [],
                routes = [],
                mode = this.getPropertyValue('DisplayMode'),
                showMarkers = mode === 'Markers' || mode === 'MarkersAndRoutes' || this.canMasterFilter(),
                showRoutes = mode === 'Routes' || mode === 'MarkersAndRoutes';
            if (this.getBindingValue('Latitude').length > 0 && this.getBindingValue('Longitude').length > 0) {
                let index = 0;
                this.iterateData(row => {
                    var latitude = row.getValue('Latitude')[0];
                    var longitude = row.getValue('Longitude')[0];
                    var tooltip = row.getValue('Tooltip')[0];

                    let idx = index;

                    if (latitude && longitude) {
                        if (showMarkers) {
                            markers.push({
                                location: { lat: latitude, lng: longitude },
                                iconSrc: this.isSelected(row) ? "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/maps/map-marker.png" : null,
                                onClick: args => this._onClick(idx, row),
                                tooltip: {
                                    text: tooltip
                                },
                                tag: row
                            });
                        }
                        if (showRoutes) {
                            routes.push([latitude, longitude]);
                        }
                    }

                    index++;
                });
            }
            let autoAdjust = markers.length > 0 || routes.length > 0,
            options = {
                provider: this.getPropertyValue('Provider').toLowerCase(),
                type: this.getPropertyValue('Type').toLowerCase(),
                controls: true,
                zoom: autoAdjust ? 1000 : 1,
                autoAdjust: autoAdjust,
                width: this.contentWidth(),
                height: this.contentHeight(),
                // Use the template below to authenticate the application within the required map provider.
                //apiKey: { 
                //    bing: 'BINGAPIKEY',
                //    google: 'GOOGLEAPIKEY'
                //},             
                markers: markers,
                routes: routes.length > 0 ? [{
                    weight: 6,
                    color: 'blue',
                    opacity: 0.5,
                    mode: '',
                    locations: routes
                }] : [],
            };
            if (changeExisting && this.mapViewer) {
                this.mapViewer.option(options);
            }
            else {
                this.mapViewer = new dxMap($element, options);
            }
        }
    }
    class OnlineMapItem {
        constructor(dashboardControl) {
            dashboardControl.registerIcon(svgIcon);
            this.name = ONLINE_MAP_EXTENSION_NAME;
            this.metaData = onlineMapMetadata;
        }
        createViewerItem(model, $element, content) {
            return new OnlineMapItemViewer(model, $element, content);
        };
    }

    return OnlineMapItem;
})();
