sap.ui.define(["sap/ui/core/UIComponent", "sap/ui/Device", "./model/models"], function(UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("ui.Component", {

		metadata: {
			manifest: "json",
			interfaces: ["sap.ui.core.IAsyncContentCreation"]
		},

		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.call(this); // create the views based on the url/hash

			// create the device model
			this.setModel(models.createDeviceModel(), "device");

			this._initializeUserModel();

			// create the views based on the url/hash
			this.getRouter().initialize();
		},

		_initializeUserModel: async function() {

			const oUserModel = new JSONModel({
				id: "",
				firstname: "",
				lastname: "",
				role: "guest",
				isReady: false
			});

			this.setModel(oUserModel, "userModel");

			try {
				const oDataModel = this.getModel();

				const oContextBinding = oDataModel.bindContext("/getUserContext(...)");

				await oContextBinding.execute();

				const oContextData = oContextBinding.getBoundContext().getObject();

				oUserModel.setProperty("/id", oContextData.id);
				oUserModel.setProperty("/firstname", oContextData.firstname);
				oUserModel.setProperty("/lastname", oContextData.lastname);
				oUserModel.setProperty("/role", oContextData.role);
				oUserModel.setProperty("/isReady", true);

				Log.info("Global User Context initialized successfully.");

			} catch (oError) {
				Log.error("Failed to retrieve user context from CAP.", oError);

			}


		},


		/**
		 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
		 * design mode class should be set, which influences the size appearance of some controls.
		 * @public
		 * @returns {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
		 */
		getContentDensityClass: function() {
			if (this.contentDensityClass === undefined) {
				// check whether FLP has already set the content density class; do nothing in this case
				if (document.body.classList.contains("sapUiSizeCozy") || document.body.classList.contains("sapUiSizeCompact")) {
					this.contentDensityClass = "";
				} else if (!Device.support.touch) {
					// apply "compact" mode if touch is not supported
					this.contentDensityClass = "sapUiSizeCompact";
				} else {
					// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
					this.contentDensityClass = "sapUiSizeCozy";
				}
			}
			return this.contentDensityClass;
		},



	});
});
