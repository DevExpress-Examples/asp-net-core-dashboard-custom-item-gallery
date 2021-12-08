let TreeViewCustomItem = (function () {
	const Dashboard = DevExpress.Dashboard;
	const dxTreeView = DevExpress.ui.dxTreeView;
	const svgIcon = `<?xml version="1.0" encoding="utf-8"?>
		<svg version="1.1" id="treeViewIcon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve">
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