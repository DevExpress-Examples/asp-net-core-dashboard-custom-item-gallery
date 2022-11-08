window.TreeViewCustomItem = (function () {
    const Dashboard = DevExpress.Dashboard;
    const dxTreeView = DevExpress.ui.dxTreeView;

    const HIERARCIAL_TREE_VIEW_EXTENSION_NAME = 'TreeView';

    const svgIcon = `<?xml version="1.0" encoding="utf-8"?>
        <svg version="1.1" id="` + HIERARCIAL_TREE_VIEW_EXTENSION_NAME +`" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve">
            <polygon class="dx-dashboard-contrast-icon" points="12,13 12,11 8,11 8,8 6,8 6,21 12,21 12,19 8,19 8,13 "/>
            <path class="dx-dashboard-accent-icon" d="M10,7H4C3.5,7,3,6.6,3,6V2c0-0.5,0.5-1,1-1h6c0.6,0,1,0.5,1,1v4C11,6.6,10.6,7,10,7z
                 M21,14v-4c0-0.6-0.5-1-1-1h-6c-0.6,0-1,0.4-1,1v4c0,0.6,0.4,1,1,1h6C20.5,15,21,14.6,21,14z M21,22v-4c0-0.5-0.5-1-1-1h-6
                c-0.6,0-1,0.5-1,1v4c0,0.5,0.4,1,1,1h6C20.5,23,21,22.5,21,22z"/>
        </svg>`;
    const treeViewMetadata = {
        bindings: [{
            propertyName: 'idBinding',
            dataItemType: 'Dimension',
            array: false,
            displayName: 'ID',
            placeholder: 'Add ID',
            configurePlaceholder: 'Configure ID',
        }, {
            propertyName: 'parentIdBinding',
            dataItemType: 'Dimension',
            array: false,
            displayName: 'Parent ID',
            placeholder: 'Add Parent ID',
            configurePlaceholder: 'Configure Parent ID',
        }, {
            propertyName: 'dimensionsBinding',
            dataItemType: 'Dimension',
            array: false,
            displayName: 'Dimensions',
            placeholder: 'Add Dimension',
            configurePlaceholder: 'Configure Dimension',
            enableInteractivity: true
        }],
        interactivity: {
            filter: true,
            applyEmptyFilter: true
        },
        icon: HIERARCIAL_TREE_VIEW_EXTENSION_NAME,
        // Uncomment the line below to place this custom item in the "Filter" group:
        //groupName: 'filter',
        title: 'Hierarchical Tree View',
        index: 110
    };
    
    class TreeViewViewer extends DevExpress.Dashboard.CustomItemViewer {
        constructor(model, $container, options, dashboardControl) {
            super(model, $container, options);
            this.model = model;
            this._requiredBindingsCount = 3;
            this.dashboardControl = dashboardControl;
        }
        renderContent($element, changeExisting) {        
            let dataSource = [];

            //Check Bindings
            let bindings = this.getBindingValue('dimensionsBinding').concat(this.getBindingValue('idBinding')).concat(this.getBindingValue('parentIdBinding'));
            if (bindings.length !== this._requiredBindingsCount)
                return;

            //Get Data Source
            this.model.iterateData(function (dataRow) {
                let row = {
                    ID: dataRow.getDisplayText('idBinding')[0],
                    ParentID: dataRow.getDisplayText('parentIdBinding')[0] !== '-1' ? dataRow.getDisplayText('parentIdBinding')[0] : null,
                    DisplayField: dataRow.getDisplayText('dimensionsBinding')[0],
                };
                row._customData = dataRow;
                dataSource.push(row);
            });

            let treeViewOptions = {
                items: dataSource,
                dataStructure: "plain",
                parentIdExpr: "ParentID",
                keyExpr: "ID",
                displayExpr: "DisplayField",
                selectionMode: "multiple",
                selectNodesRecursive: false,
                onItemClick: e => {
                    if (this.getMasterFilterMode() === 'Multiple' && this.allowMultiselection) {
                        this.setMasterFilterRecursive(e.node);
                    }
                    else {
                        this.setMasterFilter(e.itemData._customData);
                    }
                },
                onContentReady: e => {
                    this.updateTreeViewSelection();
                }
            };

            if (!changeExisting || !this.dxTreeViewWidget) {
                let container = $element.jquery ? $element[0] : $element;
                while (container.firstChild)
                    container.removeChild(element.firstChild);
                let div = document.createElement('div');
                container.appendChild(div);
                this.dxTreeViewWidget = new dxTreeView(div, treeViewOptions);
            }
            else {
                this.dxTreeViewWidget.option(treeViewOptions);
            }
        }

        setSelection(values) {
            super.setSelection(values);
            this.updateTreeViewSelection();
        }

        clearSelection() {
            super.clearSelection();
            this.updateTreeViewSelection();
        }

        updateTreeViewSelection() {
            if (this.dxTreeViewWidget) {
                this.dxTreeViewWidget.unselectAll();
                let nodes = this.dxTreeViewWidget.option('items');

                nodes.forEach(item => {
                    if (this.isSelected(item._customData))
                        this.dxTreeViewWidget.selectItem(item.ID);
                });
            }
        }

        setMasterFilterRecursive(node) {
            this.setMasterFilter(node.itemData._customData);
            node.children.forEach(x => this.setMasterFilterRecursive(x));
        }
    }
    class TreeViewItem {
        constructor(dashboardControl) {
            this.dashboardControl = dashboardControl;
            this.dashboardControl.registerIcon(svgIcon);
            this.name = HIERARCIAL_TREE_VIEW_EXTENSION_NAME;
            this.metaData = treeViewMetadata;
        }
        createViewerItem = (model, $element, content) => {
            return new TreeViewViewer(model, $element, content, this.dashboardControl);
        }
    }
    return TreeViewItem;
})();
