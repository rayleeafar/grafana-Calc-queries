/// <reference path="../headers/common.d.ts" />
import { QueryCtrl } from './sdk/sdk';
export declare class CalcQueriesQueryCtrl extends QueryCtrl {
    static templateUrl: string;
    errors: any;
    query: any;
    target: any;
    /** @ngInject **/
    constructor($scope: any, $injector: any, $q: any);
    targetBlur(): void;
    onChangeInternal(): void;
}
