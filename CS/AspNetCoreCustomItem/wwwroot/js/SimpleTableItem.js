var SimpleTableCustomItem = (function () {
    const CustomItem = DevExpress.Dashboard.Model.CustomItem;
    const FormItemTemplates = DevExpress.Dashboard.Designer.FormItemTemplates;

    const svgIcon = '<svg id="simpleTableIcon" viewBox="0 0 24 24"><path fill="#39A866" d="M12 2 L2 22 L22 22 Z" /></svg>';

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
        }],
        optionsPanelSections: [{
            title: "Custom Options",
            items: [{
                dataField: 'showHeaders',
                template: FormItemTemplates.buttonGroup,
                editorOptions: {
                    items: [{ text: 'Auto' }, { text: 'Off' }, { text: 'On' }],
                },
            }]
        }],        
        icon: 'simpleTableIcon',
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
            row.appendChild(cell);
        });

        this.tableElt.appendChild(row);
    };

    function SimpleTableItem(dashboardControl) {
        DevExpress.Dashboard.ResourceManager.registerIcon(svgIcon);
        this.name = "simpleTableItem";
        this.metaData = simpleTableMetadata;
        this.createViewerItem = function (model, $element, content) {
            return new SimpleTableItemViewer(model, $element, content);
        }
    }
    return SimpleTableItem;
})();