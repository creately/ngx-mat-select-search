/**
 * Copyright (c) 2018 Bithost GmbH All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { NgModule } from '@angular/core';
import { MatSelectSearchComponent } from './mat-select-search.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';

import { MatSelectSearchClearDirective } from './mat-select-search-clear.directive';
import { MatSelectSearchIconDirective } from './mat-select-search-icon.directive';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectNoEntriesFoundDirective } from './mat-select-no-entries-found.directive';
import { MatDividerModule } from '@angular/material/divider';

export const MatSelectSearchVersion = '8.0.1';
export { MatSelectSearchClearDirective };
export { MatSelectNoEntriesFoundDirective };

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  declarations: [
    MatSelectSearchComponent,
    MatSelectSearchClearDirective,
    MatSelectSearchIconDirective,
    MatSelectNoEntriesFoundDirective
  ],
  exports: [
    MatSelectSearchComponent,
    MatSelectSearchClearDirective,
    MatSelectSearchIconDirective,
    MatSelectNoEntriesFoundDirective
  ]
})
export class NgxMatSelectSearchModule {
}
