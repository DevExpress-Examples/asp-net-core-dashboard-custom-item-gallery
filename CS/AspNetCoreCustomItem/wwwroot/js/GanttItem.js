var GanttCustomItem = (function () {
    const Dashboard = DevExpress.Dashboard;

    const svgIcon = '<svg id="ganttItemIcon" viewBox="0 0 24 24"><path stroke="#ffffff" fill="#f442ae" d="M12 2 L2 22 L22 22 Z" /></svg>';

    const ganttItemMetadata = {
        bindings: [{
            propertyName: 'ID',
            dataItemType: 'Dimension',
            displayName: 'ID',
            enableInteractivity: true
        }, {
            propertyName: 'ParentID',
            dataItemType: 'Dimension',
            displayName: 'Parent ID',
            enableInteractivity: true
        }, {
            propertyName: 'Text',
            dataItemType: 'Dimension',
            displayName: 'Text',
            enableInteractivity: true
        }, {
            propertyName: 'StartDate',
            dataItemType: 'Dimension',
            displayName: 'Start Date',
            enableInteractivity: true
        }, {
            propertyName: 'FinishDate',
            dataItemType: 'Dimension',
            displayName: 'Finish Date',
            enableInteractivity: true
        }],
        interactivity: {
            filter: true
        },
        icon: 'ganttItemIcon',
        title: 'Gantt Chart',
        index: 0
    };

    function GanttItemViewer(model, $container, options) {
        Dashboard.CustomItemViewer.call(this, model, $container, options);
        this.dxGanttWidget = null;
    }

    GanttItemViewer.prototype = Object.create(Dashboard.CustomItemViewer.prototype);
    GanttItemViewer.prototype.constructor = GanttItemViewer;

    GanttItemViewer.prototype._getDataSource = function () {
        var data = [];
        var datesValid = true;

        this.iterateData(function (dataRow) {
            data.push({
                id: dataRow.getValue('ID')[0],
                parentId: dataRow.getValue('ParentID')[0],
                title: dataRow.getValue('Text')[0],
                start: dataRow.getValue('StartDate')[0],
                end: dataRow.getValue('FinishDate')[0],
                clientDataRow: dataRow
            });

            var currentItem = data[data.length - 1];
         
            if ((currentItem.start && !(currentItem.start instanceof Date)) || (currentItem.end && !(currentItem.end instanceof Date)))
                datesValid = false;
        });

        if (!datesValid) {
            DevExpress.ui.notify("Gantt: 'Start Date' or 'Finish Date' is not a Date object.", "warning", 3000);
            return [];
        }

        return data;
    };

    GanttItemViewer.prototype._getDxGanttWidgetSettings = function () {
        var _this = this;
        return {
            rootValue: -1,
            tasks: {
                dataSource: this._getDataSource()
            },
            columns: [{
                dataField: "title",
                caption: "Subject",
                width: 300,
            }, {
                dataField: "start",
                caption: "Start Date"
            }, {
                dataField: "end",
                caption: "End Date"
            }],
            onTaskClick: function (e) {
                var tasks = e.component.option("tasks.dataSource");
                var clickedTask = tasks.filter(item => item.id === e.key)[0];

                _this.setMasterFilter(clickedTask.clientDataRow);
            },
            scaleType: "days",
            taskListWidth: 500,
        };
    };

    GanttItemViewer.prototype.setSelection = function (values) {
        Object.getPrototypeOf(GanttItemViewer.prototype).setSelection.call(this, values);

        var _this = this;
        var tasks = _this.dxGanttWidget.option("tasks.dataSource");

        tasks.forEach(function (item) {
            if (_this.isSelected(item.clientDataRow))
                _this.dxGanttWidget.option("selectedRowKey", item.id);
        });
    };

    GanttItemViewer.prototype.clearSelection = function () {
        Object.getPrototypeOf(GanttItemViewer.prototype).clearSelection.call(this);
        this.dxGanttWidget.option("selectedRowKey", null);
    };

    GanttItemViewer.prototype.setSize = function (width, height) {
        Object.getPrototypeOf(GanttItemViewer.prototype).setSize.call(this, width, height);
        this.dxGanttWidget.repaint();
    };

    GanttItemViewer.prototype.renderContent = function ($element, changeExisting) {
        if (!changeExisting) {
            var element = $element.jquery ? $element[0] : $element;

            while (element.firstChild)
                element.removeChild(element.firstChild);

            this.dxGanttWidget = new DevExpress.ui.dxGantt(element, this._getDxGanttWidgetSettings());
        } else {
            this.dxGanttWidget.option(this._getDxGanttWidgetSettings());
        }
    };

    function GanttItem(dashboardControl) {
        Dashboard.ResourceManager.registerIcon(svgIcon);
        this.name = "ganttItem";
        this.metaData = ganttItemMetadata;
        this.createViewerItem = function (model, $element, content) {
            return new GanttItemViewer(model, $element, content);
        }
    };

    return GanttItem;
})();