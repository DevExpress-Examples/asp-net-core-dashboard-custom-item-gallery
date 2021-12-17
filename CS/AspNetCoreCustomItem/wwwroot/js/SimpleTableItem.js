let SimpleTableCustomItem = (function () {
    const CustomItem = DevExpress.Dashboard.Model.CustomItem;
    const FormItemTemplates = DevExpress.Dashboard.Designer.FormItemTemplates;

    const SIMPLE_TABLE_EXTENSION_NAME = 'CustomItemSimpleTable';

    const svgIcon = `<?xml version="1.0" encoding="utf-8"?>
        <svg version="1.1" id="` + SIMPLE_TABLE_EXTENSION_NAME + `" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	         viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve">
        <path class="dx-dashboard-contrast-icon" d="M21,2H3C2.5,2,2,2.5,2,3v18c0,0.5,0.5,1,1,1h18c0.5,0,1-0.5,1-1V3
	        C22,2.5,21.5,2,21,2z M14,4v4h-4V4H14z M10,10h4v4h-4V10z M4,4h4v4H4V4z M4,10h4v4H4V10z M4,20v-4h4v4H4z M10,20v-4h4v4H10z M20,20
	        h-4v-4h4V20z M20,14h-4v-4h4V14z M20,8h-4V4h4V8z"/>
        </svg>`;

    const simpleTableMetadata = {        
        bindings: [{
            propertyName: 'customDimensions',
            dataItemType: 'Dimension',
            array: true,
            displayName: "Custom Dimensions"
        }, {
            propertyName: 'customMeasure',
            dataItemType: 'Measure',
            displayName: "Custom Measure"
        }],
        customProperties: [{
            ownerType: CustomItem,
            propertyName: 'showHeaders',
            valueType: 'string',
            defaultValue: 'Auto',
        }, {
            ownerType: CustomItem,
            propertyName: 'textColor',
            valueType: 'string',
            defaultValue: 'Dark',
        }],
        optionsPanelSections: [{
            title: "Custom Options",
            items: [{
                dataField: 'showHeaders',
                template: FormItemTemplates.buttonGroup,
                editorOptions: {
                    items: [{ text: 'Auto' }, { text: 'Off' }, { text: 'On' }],
                }
            },{
                dataField: 'textColor',
                label: { text: 'Text Color' },
                template: FormItemTemplates.buttonGroup,
                editorOptions: {
                    items: [{ text: 'Light' }, { text: 'Dark' }]
                }
            }]
        }],        
        icon: SIMPLE_TABLE_EXTENSION_NAME,
        title: 'Simple Table'
    };
    
    function SimpleTableItemViewer(model, $container, options) {
        DevExpress.Dashboard.CustomItemViewer.call(this, model, $container, options);
    }

    SimpleTableItemViewer.prototype = Object.create(DevExpress.Dashboard.CustomItemViewer.prototype);
    SimpleTableItemViewer.prototype.constructor = SimpleTableItemViewer;

    SimpleTableItemViewer.prototype.renderContent = function ($element, changeExisting) {    
        let element = $element.jquery ? $element[0] : $element;
        if (!changeExisting) {
            while (element.firstChild)
                element.removeChild(element.firstChild);
            element.style.overflow = 'auto';
            this.tableElt = document.createElement('table');

            this.tableElt.setAttribute("border", "1");
            this.tableElt.setAttribute("cellspacing", "0");

            element.append(this.tableElt);
        }
        this._update(this.getPropertyValue('showHeaders'));
    };

    SimpleTableItemViewer.prototype._getTextColor = function() {
        switch (this.getPropertyValue('textColor')) {
            case 'Light': return "gray";
            case 'Dark': return "black";
        }
    };
    
    SimpleTableItemViewer.prototype._update = function (mode) {
        while (this.tableElt.firstChild)
            this.tableElt.removeChild(this.tableElt.firstChild);

        if (mode !== 'Off') {
            let bindingValues = this.getBindingValue('customDimensions').concat(this.getBindingValue('customMeasure'));
            this._addTableRow(bindingValues.map(function (item) { return item.displayName(); }), true);
        }

        this.iterateData(rowDataObject => {
            let valueTexts = rowDataObject.getDisplayText('customDimensions').concat(rowDataObject.getDisplayText('customMeasure'));
            this._addTableRow(valueTexts, false);
        });
    };
    SimpleTableItemViewer.prototype._addTableRow = function (rowValues, isHeader) {
        const row = document.createElement('tr');

        rowValues.forEach(text => {
            const cell = document.createElement(isHeader ? 'th' : 'td');
            cell.style.padding = '3px';            
            cell.innerText = text;
            cell.style.color = this._getTextColor();
            row.appendChild(cell);
        });

        this.tableElt.appendChild(row);
    };

    function SimpleTableItem(dashboardControl) {
        dashboardControl.registerIcon(svgIcon);
        this.name = SIMPLE_TABLE_EXTENSION_NAME;
        this.metaData = simpleTableMetadata;
        this.createViewerItem = function (model, $element, content) {
            return new SimpleTableItemViewer(model, $element, content);
        }
    }
    return SimpleTableItem;
})();