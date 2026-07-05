sap.ui.define(function () {
	"use strict";

	return {
		name: "QUnit test suite for the UI5 Application: ui",
		defaults: {
			page: "ui5://test-resources/ui/Test.qunit.html?testsuite={suite}&test={name}",
			qunit: {
				version: 2
			},
			sinon: {
				version: 1
			},
			ui5: {
				language: "EN",
				theme: "sap_horizon"
			},
			coverage: {
				only: "ui/",
				never: "test-resources/ui/"
			},
			loader: {
				paths: {
					"ui": "../"
				}
			}
		},
		tests: {
			"unit/unitTests": {
				title: "Unit tests for ui"
			},
			"integration/opaTests": {
				title: "Integration tests for ui"
			}
		}
	};
});
