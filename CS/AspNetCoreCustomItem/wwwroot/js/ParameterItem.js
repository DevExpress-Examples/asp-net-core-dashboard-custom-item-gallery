var ParameterCustomItem = (function () {
    const Model = DevExpress.Dashboard.Model;
    const Designer = DevExpress.Dashboard.Designer;

    const onOffButtons = [{ text: 'On' }, { text: 'Off' }];
    const buttonsStyle = {
        containerHeight: 60,
        height: 40,
        width: 82,
        marginRight: 15,
        marginTop: 10
    };

    const svgIcon = '<svg id="parameterItemIcon" viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="11" fill="#39A866" /></svg>';
    const parameterMetadata = {
        customProperties: [{
            ownerType: Model.CustomItem,
            propertyName: 'showHeaders',
            valueType: 'string',
            defaultValue: 'On',
        }, {
            ownerType: Model.CustomItem,
            propertyName: 'showParameterName',
            valueType: 'string',
            defaultValue: 'On',
        }, {
            ownerType: Model.CustomItem,
            propertyName: 'automaticUpdates',
            valueType: 'string',
            defaultValue: 'Off',
        }],
        optionsPanelSections: [{
            title: 'Parameters settings',
            items: [{
                dataField: 'showHeaders',
                template: Designer.FormItemTemplates.buttonGroup,
                editorOptions: {
                    items: onOffButtons,
                },
            }, {
                dataField: 'showParameterName',
                template: Designer.FormItemTemplates.buttonGroup,
                editorOptions: {
                    items: onOffButtons,
                },
            }, {
                dataField: 'automaticUpdates',
                template: Designer.FormItemTemplates.buttonGroup,
                editorOptions: {
                    items: onOffButtons,
                },
            }],
        }],
        icon: 'parameterItemIcon',
        title: 'Parameters',
    };

    function ParameterItemViewer(model, $container, options, parametersExtension) {
        DevExpress.Dashboard.CustomItemViewer.call(this, model, $container, options);

        this.buttons = [];

        this.parametersExtension = parametersExtension;
        this._subscribeProperties();
        this.parametersExtension.showDialogButton(false);
        this.parametersExtension.subscribeToContentChanges(() => {
            this._generateParametersContent();
        });
        this.dialogButtonSubscribe = this.parametersExtension.showDialogButton.subscribe(() => {
            this.parametersExtension.showDialogButton(false);
        });
    }

    ParameterItemViewer.prototype = Object.create(DevExpress.Dashboard.CustomItemViewer.prototype);
    ParameterItemViewer.prototype.constructor = ParameterItemViewer;


    ParameterItemViewer.prototype.setSize = function (width, height) {
        Object.getPrototypeOf(ParameterItemViewer.prototype).setSize.call(this, width, height);
        this._setGridHeight();
    };

    ParameterItemViewer.prototype.dispose = function () {
        Object.getPrototypeOf(ParameterItemViewer.prototype).dispose.call(this);
        this.parametersContent && this.parametersContent.dispose && this.parametersContent.dispose();
        this.dialogButtonSubscribe.dispose();
        this.parametersExtension.showDialogButton(true);
        this.buttons.forEach(button => button.dispose());
    }


    ParameterItemViewer.prototype.renderContent = function ($element, changeExisting) {
        var element = $element.get(0);
        if (!changeExisting) {
            element.innerHTML = '';
            this.buttons.forEach(button => button.dispose());
            element.style.overflow = 'auto';

            this.gridContainer = document.createElement('div');
            element.appendChild(this.gridContainer);
            this._generateParametersContent();
            this.buttonContainer = document.createElement('div');
            this.buttonContainer.style.height = buttonsStyle.containerHeight + 'px',
                this.buttonContainer.style.width = buttonsStyle.width * 2 + buttonsStyle.marginRight * 2 + 'px',
                this.buttonContainer.style.cssFloat = 'right'

            element.appendChild(this.buttonContainer);
            this.buttons.push(this._createButton(this.buttonContainer, "Reset", () => {
                this.parametersContent.resetParameterValues();
            }));
            this.buttons.push(this._createButton(this.buttonContainer, "Submit", () => {
                this._submitValues();
            }));
            if (this.getPropertyValue('automaticUpdates') !== 'Off')
                this.buttonContainer.style.display = 'none';
        }
    };

    ParameterItemViewer.prototype._generateParametersContent = function () {
        this.parametersContent = this.parametersExtension.renderContent(this.gridContainer);
        this.parametersContent.valueChanged.add(() => this._updateParameterValues());
        this._setGridHeight();
        this._update({
            showHeaders: this.getPropertyValue('showHeaders'),
            showParameterName: this.getPropertyValue('showParameterName')
        });
    };

    ParameterItemViewer.prototype._submitValues = function () {
        this.parametersContent.submitParameterValues();
        this._update({
            showHeaders: this.getPropertyValue('showHeaders'),
            showParameterName: this.getPropertyValue('showParameterName')
        });
    };

    ParameterItemViewer.prototype._updateParameterValues = function () {
        this.getPropertyValue('automaticUpdates') !== 'Off' ? this._submitValues() : null;
    };

    ParameterItemViewer.prototype._setGridHeight = function () {
        var gridHeight = this.contentHeight();
        if (this.getPropertyValue('automaticUpdates') === 'Off')
            gridHeight -= buttonsStyle.containerHeight;
        this.parametersContent.grid.option('height', gridHeight);
    };

    ParameterItemViewer.prototype._createButton = function (container, buttonText, onClick) {
        var button = document.createElement("div");
        button.style.marginRight = buttonsStyle.marginRight + 'px';
        button.style.marginTop = buttonsStyle.marginTop + 'px';
        container.appendChild(button);
        return new DevExpress.ui.dxButton(button, {
            text: buttonText,
            height: buttonsStyle.height + 'px',
            width: buttonsStyle.width + 'px',
            onClick: onClick
        });
    };

    ParameterItemViewer.prototype._subscribeProperties = function () {
        this.subscribe('showHeaders', (showHeaders) => { this._update({ showHeaders: showHeaders }); });
        this.subscribe('showParameterName', (showParameterName) => { this._update({ showParameterName: showParameterName }); });
        this.subscribe('automaticUpdates', (automaticUpdates) => { this._update({ automaticUpdates: automaticUpdates }) });
    };

    ParameterItemViewer.prototype._update = function (options) {
        if (options.showHeaders) {
            this.parametersContent.grid.option('showColumnHeaders', options.showHeaders === 'On');
        }
        if (options.showParameterName) {
            this.parametersContent.valueChanged.empty();
            this.parametersContent.grid.columnOption(0, 'visible', options.showParameterName === 'On');
            this.parametersContent.valueChanged.add(() => { return this._updateParameterValues(); });
        }
        if (options.automaticUpdates) {
            if (options.automaticUpdates === 'Off') {
                this.buttonContainer.style.display = 'block';
            } else {
                this.buttonContainer.style.display = 'none';
            }
        }
        this._setGridHeight();
    };

    function ParameterItem(dashboardControl) {
        DevExpress.Dashboard.ResourceManager.registerIcon(svgIcon);
        this.name = "Parameter Item",
            this.metaData = parameterMetadata,
            this.createViewerItem = function (model, $element, content) {
                var parametersExtension = dashboardControl.findExtension("dashboard-parameter-dialog");
                if (!parametersExtension) {
                    throw Error('The "dashboard-parameter-dialog" extension does not exist. To register this extension, call the DashboardControl.registerExtension method and pass the extension name.');
                }
                return new ParameterItemViewer(model, $element, content, parametersExtension);
            }
    };

    return ParameterItem;
})();