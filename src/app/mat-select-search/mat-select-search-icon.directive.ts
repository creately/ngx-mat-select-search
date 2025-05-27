import { Directive } from '@angular/core';

/**
 * Directive for providing a custom search-icon.
 * e.g.
 * <ngx-mat-select-search [formControl]="bankFilterCtrl">
 *   <mat-icon ngxMatSelectSearchIcon>search</mat-icon>
 * </ngx-mat-select-search>
 */
@Directive({
    selector: '[ngxMatSelectSearchIcon]'
})
export class MatSelectSearchIconDirective {}
