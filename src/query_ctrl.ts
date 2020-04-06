///<reference path="../headers/common.d.ts" />

import _ from 'lodash'
import kbn from 'app/core/utils/kbn'
import { QueryCtrl } from './sdk/sdk'

export class CompareQueriesQueryCtrl extends QueryCtrl {
  static templateUrl = 'partials/query.editor.html'
  errors: any
  query: any
  target: any

  /** @ngInject **/
  constructor($scope, $injector, $q) {
    super($scope, $injector)
  }

  targetBlur() {
    this.refresh()
  }
  onChangeInternal() {
    this.refresh() // Asks the panel to refresh data.
  }
  
}
