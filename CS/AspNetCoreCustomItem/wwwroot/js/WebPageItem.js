let WebPageCustomItem = (function () {
    const svgIcon = `<?xml version="1.0" encoding="utf-8"?>        
        <svg version = "1.1" id = "webPageItemIcon" xmlns = "http://www.w3.org/2000/svg" xmlns: xlink = "http://www.w3.org/1999/xlink" x = "0px" y = "0px" viewBox = "0 0 24 24" style = "enable-background:new 0 0 24 24;" xml: space = "preserve" >
            <path class="dx-dashboard-contrast-icon" d="M20.7,4.7l-3.4-3.4C17.1,1.1,16.9,1,16.6,1H4C3.4,1,3,1.4,3,2v20c0,0.6,0.4,1,1,1h16
	        c0.6,0,1-0.4,1-1V5.4C21,5.1,20.9,4.9,20.7,4.7z M19,21H5V3h11v2c0,0.6,0.4,1,1,1h2V21z"/>
            <path class="dx-dashboard-accent-icon" d="M13.7,17.5c-0.2-0.4-1.6-1.8-1.4-2.2s0.2-1.1-0.1-1.3c-0.3-0.1-0.7,0.1-0.7-0.2
	        c-0.1-0.3-1.1-0.2-1.2-1.6c-0.1-1.5-0.6-2-1.2-2s-1.6,0.6-1.5,0c0-0.1,0-0.2,0-0.3c-1,1-1.6,2.5-1.6,4.1c0,3.3,2.7,6,6,6
	        c0.6,0,1.1-0.1,1.6-0.2C13.7,19.1,13.9,17.8,13.7,17.5z M12,8c-1.1,0-2.2,0.3-3.1,0.9H9c1,0.2,3.1,0.7,3.1,0.3S12,8.3,12.2,8.4
	        c0.2,0.2,0.8,0.7,0.6,1S12,10,12.2,10.3c0.2,0.2,0.8,0.6,1,0.4s-0.1-0.9,0.2-0.8c0.3,0,1.8,0.8,1.3,1.1s-1.4,1.9-1.9,2
	        s-0.9,0.2-0.8,0.6c0.2,0.5,0.5,0.2,0.7,0.3c0.1,0.1,0.1,0.4,0.3,0.6s0.4,0.1,0.7,0.1c0.3-0.1,2.5,0.9,2.3,1.4
	        c-0.2,0.5-0.2,1.2-1,2.1c-0.5,0.5-0.7,1.1-0.9,1.5c2.3-0.8,4-3,4-5.6C18,10.7,15.3,8,12,8z"/>
        </svg>`;
    const webPageMetadata = {
        bindings: [{
            propertyName: 'Attribute',
            dataItemType: 'Dimension',
            array: false,
            displayName: "Attribute",
            emptyPlaceholder: 'Set Attribute',
            selectedPlaceholder: "Configure Attribute"
        }],
        customProperties: [{
            ownerType: DevExpress.Dashboard.Model.CustomItem,
            propertyName: 'Url',
            valueType: 'string',
            defaultValue: 'https://en.m.wikipedia.org/wiki/{0}',
        }],
        optionsPanelSections: [{
            title: 'Custom Options',
            items: [{
                dataField: 'Url',
                editorType: 'dxTextBox',
            }]
        }],
        icon: 'webPageItemIcon',
        title: 'Web Page',
        index: 2
    };

    function WebPageItemViewer(model, $container, options) {
        DevExpress.Dashboard.CustomItemViewer.call(this, model, $container, options);
        this.iframe = undefined;
    }

    WebPageItemViewer.prototype = Object.create(DevExpress.Dashboard.CustomItemViewer.prototype);
    WebPageItemViewer.prototype.constructor = WebPageItemViewer;

    WebPageItemViewer.prototype.renderContent = function (element, changeExisting) {
        var attribute;
        var $element = $(element);
        if(!changeExisting || !this.iframe) {
            this.iframe = $('<iframe>', { 
                attr: {
                    width: '100%',
                    height: '100%'
                },
                style: 'border: none;'
            });
            $element.append(this.iframe);
        }
        this.iterateData(row => {
            if(!attribute) {
                attribute = row.getDisplayText('Attribute')[0];
            }
        });
        this.iframe.attr('src', this.getPropertyValue('Url').replace('{0}', attribute));
    };

    function WebPageItem(dashboardControl) {
        DevExpress.Dashboard.ResourceManager.registerIcon(svgIcon);
        this.name = "webPageItem";
        this.metaData = webPageMetadata;
        this.createViewerItem = function (model, $element, content) {
            return new WebPageItemViewer(model, $element, content);
        }
    };

    return WebPageItem;
})();
