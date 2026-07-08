sap.ui.define(function () {
	"use strict";

	return {
		name: "QUnit test suite for the UI5 Application: abc",
		defaults: {
			page: "ui5://test-resources/abc/Test.qunit.html?testsuite={suite}&test={name}",
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
				only: "abc/",
				never: "test-resources/abc/"
			},
			loader: {
				paths: {
					"abc": "../"
				}
			}
		},
		tests: {
			"unit/unitTests": {
				title: "Unit tests for abc"
			},
			"integration/opaTests": {
				title: "Integration tests for abc"
			}
		}
	};
});
