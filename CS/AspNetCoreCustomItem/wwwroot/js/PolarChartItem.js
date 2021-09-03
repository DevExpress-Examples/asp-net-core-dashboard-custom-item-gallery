var PolarChartCustomItem = (function () {
    const Model = DevExpress.Dashboard.Model;
    const CustomItemViewer = DevExpress.Dashboard.CustomItemViewer;
    const dxPolarChart = DevExpress.viz.dxPolarChart;

    const svgIcon = '<?xml version="1.0" encoding="utf-8"?><svg version="1.1" id="polarChartItemIcon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve"><style type="text/css">.Black{fill:#414242;} .Blue{fill:#5B99D2;}</style><path class="Black" d="M12,1C5.9,1,1,5.9,1,12s4.9,11,11,11s11-4.9,11-11S18.1,1,12,1z M12,21c-5,0-9-4-9-9s4-9,9-9s9,4,9,9S17,21,12,21z"/><path class="Blue" d="M17,10c-0.6,0-1.1,0.2-1.5,0.4L13.8,9C13.9,8.7,14,8.4,14,8c0-1.7-1.3-3-3-3S8,6.3,8,8c0,1,0.5,2,1.3,2.5L8.7,13C7.2,13.2,6,14.4,6,16c0,1.7,1.3,3,3,3s3-1.3,3-3c0,0,0,0,0-0.1l2.7-1c0.6,0.7,1.4,1.1,2.3,1.1c1.7,0,3-1.3,3-3S18.7,10,17,10z M9,17c-0.6,0-1-0.4-1-1s0.4-1,1-1s1,0.4,1,1S9.6,17,9,17z M10,8c0-0.6,0.4-1,1-1s1,0.4,1,1s-0.4,1-1,1S10,8.6,10,8zM14,13.1l-2.7,1c-0.2-0.2-0.4-0.4-0.6-0.6l0.6-2.5c0.4,0,0.9-0.2,1.2-0.4l1.7,1.4C14.1,12.3,14,12.6,14,13.1C14,13,14,13,14,13.1zM17,14c-0.6,0-1-0.4-1-1s0.4-1,1-1s1,0.4,1,1S17.6,14,17,14z"/></svg>';
    const polarChartItemMetaData = {
        bindings: [{
            propertyName: 'measureValue',
            dataItemType: 'Measure',
            displayName: 'Value',
            array: true,
            emptyPlaceholder: 'Set Value',
            selectedPlaceholder: 'Configure Value'
        }, {
            propertyName: 'dimensionValue',
            dataItemType: 'Dimension',
            displayName: 'Argument',
            array: false,
            enableColoring: true,
            enableInteractivity: true,
            emptyPlaceholder: 'Set Argument',
            selectedPlaceholder: 'Configure Argument'
        }],
        interactivity: {
            filter: true
        },
        customProperties: [{
            ownerType: Model.CustomItem,
            propertyName: 'labelVisibleProperty',
            valueType: 'boolean',
            defaultValue: true
        }],
        optionsPanelSections: [{
            title: 'Labels',
            items: [{
                dataField: 'labelVisibleProperty',
                label: {
                    text: 'Display labels'
                }
            }]
        }],
        icon: 'polarChartItemIcon',
        title: 'Polar Chart',
        index: 2
    };

    function PolarChartItemViewer(model, $container, options) {
        CustomItemViewer.call(this, model, $container, options);
        this.dxPolarWidget = null;
        this.dxPolarWidgetSettings = null;
    }

    PolarChartItemViewer.prototype = Object.create(CustomItemViewer.prototype);
    PolarChartItemViewer.prototype.constructor = PolarChartItemViewer;

    PolarChartItemViewer.prototype._getDataSource = function () {
        var data = [];

        if (this.getBindingValue('measureValue').length > 0) {
            this.iterateData(function (dataRow) {
                var dataItem = {
                    arg: dataRow.getValue('dimensionValue') || "",
                    color: dataRow.getColor()[0],
                    clientDataRow: dataRow
                };

                var measureValues = dataRow.getValue('measureValue');

                for (var i = 0; i < measureValues.length; i++) {
                    dataItem["measureValue" + i] = measureValues[i];
                }

                data.push(dataItem);
            });
        }

        return data;
    };

    PolarChartItemViewer.prototype._getDxPolarWidgetSettings = function () {
        var _this = this;

        var series = [];
        var dataSource = this._getDataSource();
        var measureValueBindings = this.getBindingValue('measureValue');

        for (var i = 0; i < measureValueBindings.length; i++) {
            series.push({ valueField: "measureValue" + i, name: measureValueBindings[i].displayName() });
        }

        return {
            dataSource: dataSource,
            series: series,
            useSpiderWeb: true,
            resolveLabelOverlapping: "hide",
            pointSelectionMode: "multiple",
            commonSeriesSettings: {
                type: "line",
                label: {
                    visible: this.getPropertyValue("labelVisibleProperty")
                }
            },
            "export": {
                enabled: false
            },
            tooltip: {
                enabled: false
            },
            onPointClick: function (e) {
                var point = e.target;
                _this.setMasterFilter(point.data.clientDataRow);
            }
        };
    };

    PolarChartItemViewer.prototype.renderContent = function ($element, changeExisting) {
        if (!changeExisting) {
            while ($element.firstChild)
                $element.removeChild($element.firstChild);
            this.dxPolarWidget = new dxPolarChart($element, this._getDxPolarWidgetSettings());
        } else {
            this.dxPolarWidget.option(this._getDxPolarWidgetSettings());
        }
        this.updateSelection();
    };

    PolarChartItemViewer.prototype.setSelection = function (values) {
        Object.getPrototypeOf(PolarChartItemViewer.prototype).setSelection.call(this, values);

        this.updateSelection();
    };

    PolarChartItemViewer.prototype.updateSelection = function () {
        var series = this.dxPolarWidget.getAllSeries();

        for (var i = 0; i < series.length; i++) {
            var points = series[i].getAllPoints()
            for (var j = 0; j < points.length; j++) {
                if (this.isSelected(points[j].data.clientDataRow))
                    points[j].select();
                else
                    points[j].clearSelection();
            }
        }
    };

    PolarChartItemViewer.prototype.clearSelection = function () {
        Object.getPrototypeOf(PolarChartItemViewer.prototype).clearSelection.call(this);
        this.dxPolarWidget.clearSelection();
    };

    PolarChartItemViewer.prototype.setSize = function (width, height) {
        Object.getPrototypeOf(PolarChartItemViewer.prototype).setSize.call(this, width, height);
        this.dxPolarWidget.render();
    };

    function PolarChartItem(dashboardControl) {
        DevExpress.Dashboard.ResourceManager.registerIcon(svgIcon);
        this.name = "PolarChart",
        this.metaData = polarChartItemMetaData,
        this.createViewerItem = function (model, $element, content) {
            return new PolarChartItemViewer(model, $element, content);
        }
    };

    return PolarChartItem;
})();