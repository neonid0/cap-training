sap.ui.define([
	"./BaseController",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel"
], function(BaseController, MessageBox, MessageToast, JSONModel) {
	"use strict";

	return BaseController.extend("ui.controller.Main", {

		onInit: function() {
			// 1. Initialize your model container instantly with an undefined state
			var oUserModel = new JSONModel({
				name: "",
				email: "",
				role: undefined
			});
			this.getView().setModel(oUserModel, "userModel");

			// 2. Trigger the async context retrieval
			this._loadUserContext();
		},

		/**
		 * Fetches the current authenticated session context from XSUAA via AppRouter
		 * @private
		 */
		_loadUserContext: async function() {
			var oUserModel = this.getView().getModel("userModel");

			try {
				// Call the relative AppRouter path
				var response = await fetch("/user-api/currentUser");

				if (!response.ok) {
					throw new Error("Failed to fetch user context status: " + response.status);
				}

				var oData = await response.json();

				// The user-api returns an object structured like this:
				// { firstname: "John", lastname: "Doe", email: "...", name: "...", scopes: [...] }
				Log.info("Authenticated User context successfully retrieved", JSON.stringify(oData));

				// 3. Determine the user's operational role based on their enterprise XSUAA scopes
				var sDeterminedRole = "guest";
				if (oData.scopes && oData.scopes.includes("logiflow.driver")) {
					var sDeterminedRole = "driver";
				} else if (oData.scopes && oData.scopes.includes("logiflow.admin")) {
					sDeterminedRole = "admin";
				} else if (oData.scopes && oData.scopes.includes("logiflow.processor")) {
					sDeterminedRole = "processor";
				} else if (oData.scopes && oData.scopes.includes("logiflow.reviewer")) {
					sDeterminedRole = "reviewer";
				}

				// 4. Safely update the model state; your view bindings will react instantly
				oUserModel.setProperty("/name", oData.firstname + " " + oData.lastname);
				oUserModel.setProperty("/email", oData.email);
				oUserModel.setProperty("/role", sDeterminedRole);

			} catch (oError) {
				Log.error("Error retrieving XSUAA user session context", oError.message);
				oUserModel.setProperty("/role", "guest");
			}
		},

		sayHello: function() {
			MessageBox.show("Hello World!");
		},

		onGetDrivers: function() {
			const oView = this.getView();
			const oUserModel = oView.getModel("userModel");
			const sRole = oUserModel && oUserModel.getProperty("/role");
			if (!sRole) {
				MessageBox.show("User unsigned — please sign in");
				return;
			}

			const oOData = oView.getModel(); // OData V2 model configured in manifest
			oOData.read("/operation/Drivers", {
				success: function(oData) {
					const aDrivers = oData.results || oData.value || oData;
					oView.setModel(new JSONModel({ drivers: aDrivers }), "driversModel");
					MessageToast.show("Loaded " + (aDrivers.length || 0) + " drivers");
				},
				error: function(oErr) {
					MessageBox.show("Failed to load drivers");
					console.error(oErr);
				}
			});
		},

		onGetVehicles: function() {
			// TODO: implement vehicle read
		},

		onDoAction: function() {
			// TODO: implement action
		},

		onLogin: function() {
			var redirect = encodeURIComponent(window.location.pathname + window.location.search);
			window.location.href = '/login?redirectUrl=' + redirect;
		},

		onLogout: function() {
			var redirect = encodeURIComponent('/');
			window.location.href = '/logout?redirectUrl=' + redirect;
		}

	});
});
