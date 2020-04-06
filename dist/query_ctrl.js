///<reference path="../headers/common.d.ts" />
System.register(['./sdk/sdk'], function(exports_1) {
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var sdk_1;
    var CalcQueriesQueryCtrl;
    return {
        setters:[
            function (sdk_1_1) {
                sdk_1 = sdk_1_1;
            }],
        execute: function() {
            CalcQueriesQueryCtrl = (function (_super) {
                __extends(CalcQueriesQueryCtrl, _super);
                /** @ngInject **/
                function CalcQueriesQueryCtrl($scope, $injector, $q) {
                    _super.call(this, $scope, $injector);
                }
                CalcQueriesQueryCtrl.prototype.targetBlur = function () {
                    this.refresh();
                };
                CalcQueriesQueryCtrl.prototype.onChangeInternal = function () {
                    this.refresh(); // Asks the panel to refresh data.
                };
                CalcQueriesQueryCtrl.templateUrl = 'partials/query.editor.html';
                return CalcQueriesQueryCtrl;
            })(sdk_1.QueryCtrl);
            exports_1("CalcQueriesQueryCtrl", CalcQueriesQueryCtrl);
        }
    }
});
//# sourceMappingURL=query_ctrl.js.map