let TreeViewCustomItem = (function () {
	const Dashboard = DevExpress.Dashboard;
	const dxTreeView = DevExpress.ui.dxTreeView;
	const svgIcon = '<svg id= "treeViewIcon" viewBox="0 0 24 24" class="dx-dashboard-contrast-icon"><path d="M12 2 L2 22 L22 22 Z" /></svg>';
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
		icon: 'treeViewIcon',
		// Uncomment the line below to place this custom item in the "Filter" group:
		//groupName: 'filter',
		title: 'Hierarchical Tree View',
		index: 110
	};
	
	function TreeViewViewer(model, $container, options, dashboardControl) {
		Dashboard.CustomItemViewer.call(this, model, $container, options);
		this.model = model;
		this._requiredBindingsCount = 3;
		this.dashboardControl = dashboardControl;
	}
	TreeViewViewer.prototype = Object.create(Dashboard.CustomItemViewer.prototype);
	TreeViewViewer.prototype.constructor = TreeViewViewer;
	TreeViewViewer.prototype.renderContent = function ($element, changeExisting) {		
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

		let container = $element.jquery ? $element[0] : $element;
		while (container.firstChild)
			container.removeChild(container.firstChild);

		let div = document.createElement('div');
		let treeView = new dxTreeView(div, {
			items: dataSource,
			dataStructure: "plain",
			parentIdExpr: "ParentID",
			keyExpr: "ID",
			displayExpr: "DisplayField",
			selectionMode: "multiple",
			selectNodesRecursive: true,
			showCheckBoxesMode: "normal",
			onSelectionChanged: (e) => {
				let selectedNodeKeys = e.component.getSelectedNodeKeys();
				let selectedRows = dataSource
					.filter(function (row) { return selectedNodeKeys.indexOf(row.ID) !== -1 })
					.map(function (row) {
						return [row._customData.getUniqueValue('dimensionsBinding')[0]]
					});
				let viewerApiExtension = this.dashboardControl.findExtension("viewer-api");
				if (this.getMasterFilterMode() === 'Multiple') {
					if (selectedRows.length)
						viewerApiExtension.setMasterFilter(this.model.componentName(), selectedRows);
					else
						viewerApiExtension.clearMasterFilter(this.model.componentName());
				}
			}
		});
		treeView.selectAll();
		container.appendChild(div);
	};
	
	function TreeViewItem(dashboardControl) {
		DevExpress.Dashboard.ResourceManager.registerIcon(svgIcon);		
		this.name = "hierarchicalTreeViewItem";
		this.metaData = treeViewMetadata;
		this.createViewerItem = function (model, $element, content) {
			return new TreeViewViewer(model, $element, content, dashboardControl);
		}
	};
	return TreeViewItem;
})();