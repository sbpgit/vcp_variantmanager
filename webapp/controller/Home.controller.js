sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], (Controller, JSONModel, MessageToast,Filter,FilterOperator) => {
    "use strict";
    var that;
    return Controller.extend("vcpapp.vcpvariantmanagement.controller.Home", {

        onInit() {
            that = this;
        },
        onAfterRendering: function () {
            sap.ui.core.BusyIndicator.show();
            this.getOwnerComponent().getModel("oModel").read("/getVariantHeader", {
                filters: [new sap.ui.model.Filter("SCOPE", sap.ui.model.FilterOperator.EQ, "Public")],
                success: (oData) => {
                    sap.ui.core.BusyIndicator.hide();
                    const variantModel = new JSONModel({ results1: oData.results });
                    this.byId("idVariantTabVM").setModel(variantModel);
                },
                error: (e) => {
                    sap.ui.core.BusyIndicator.hide();
                    sap.m.MessageToast.show("Failed to get variant data");
                }
            });
        },
        onDeletePress: function () {
            sap.ui.core.BusyIndicator.show();
            var selectedID = that.byId("idVariantTabVM").getSelectedItems();
            var idObject = {}, idArray = [];
            selectedID.forEach(id => {
                idObject.ID = parseInt(id.getCells()[3].getText());
                idArray.push(idObject);
                idObject = {};
            });
            if (idArray.length > 0) {
                this.getOwnerComponent().getModel("oModel").callFunction("/createVariant", {
                    method: "GET",
                    urlParameters: {
                        Flag: "D",
                        USER: "",
                        VARDATA: JSON.stringify(idArray)
                    },
                    success: (oData) => {
                        MessageToast.show("Deleted successfully");
                        this.onAfterRendering();
                        sap.ui.core.BusyIndicator.hide();
                    },
                    error: () => {
                        sap.ui.core.BusyIndicator.hide();
                        sap.m.MessageToast.show("Error while deleting");
                    }
                });
            }
            else {
                sap.ui.core.BusyIndicator.hide();
                MessageToast.show("No items selected for deletion");
            }
        },
        handleSearch: function (oEvent) {
            var sQuery =
                oEvent.getParameter("value") || oEvent.getParameter("newValue"),
                sId = oEvent.getParameter("id"),
                oFilters = [];
            // Check if search filter is to be applied
            sQuery = sQuery ? sQuery.trim() : "";
            if (sQuery !== "") {
                oFilters.push(
                    new Filter({
                        filters: [
                            new Filter("USER", FilterOperator.Contains, sQuery),
                            new Filter("APPLICATION_NAME", FilterOperator.Contains, sQuery)
                        ],
                        and: false,
                    })
                );
            }
            that.byId("idVariantTabVM").getBinding("items").filter(oFilters);
        }
    });
});