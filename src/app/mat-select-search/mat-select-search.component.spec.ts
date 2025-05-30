/**
 * Copyright (c) 2018 Bithost GmbH All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { ReplaySubject } from 'rxjs';
import { Subject } from 'rxjs';
import { delay, take } from 'rxjs/operators';
import { takeUntil } from 'rxjs/operators';

import { MatSelectSearchComponent } from './mat-select-search.component';
import { NgxMatSelectSearchModule } from './ngx-mat-select-search.module';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { DOWN_ARROW } from '@angular/cdk/keycodes';
import { MAT_SELECTSEARCH_DEFAULT_OPTIONS, MatSelectSearchOptions } from './default-options';

interface Bank {
  id: string;
  name: string;
  bic: { value: string };
}

@Component({
  selector: 'mat-select-search-test',
  standalone: false,
  template: `
    <h3>Single selection</h3>
    <p>
      <mat-form-field>
        <mat-select [formControl]="bankCtrl" placeholder="Bank" #selectSingle>
          <ngx-mat-select-search [formControl]="bankFilterCtrl" #selectSearchSingle></ngx-mat-select-search>
          <mat-option *ngFor="let bank of filteredBanks | async" [value]="bank">
            {{bank.name}}
          </mat-option>
        </mat-select>
      </mat-form-field>
    </p>
    <p>
      Selected Bank: {{bankCtrl.value?.name}}
    </p>

    <h3>Single selection inside mat-option</h3>
    <p>
      <mat-form-field>
        <mat-select [formControl]="bankCtrlMatOption" placeholder="Bank" #selectSingleMatOption>
          <mat-option>
            <ngx-mat-select-search [formControl]="bankFilterCtrlMatOption"
                                   #selectSearchSingleMatOption></ngx-mat-select-search>
          </mat-option>
          <mat-option *ngFor="let bank of filteredBanksMatOption | async" [value]="bank">
            {{bank.name}}
          </mat-option>
        </mat-select>
      </mat-form-field>
    </p>
    <p>
      Selected Bank: {{bankCtrlMatOption.value?.name}}
    </p>

    <h3>Multiple selection</h3>
    <p>
      <mat-form-field>
        <mat-select [formControl]="bankMultiCtrl" placeholder="Banks" [multiple]="true" #selectMulti>
          <ngx-mat-select-search [formControl]="bankMultiFilterCtrl" #selectSearchMulti></ngx-mat-select-search>
          <mat-option *ngFor="let bank of filteredBanksMulti | async" [value]="bank">
            {{bank.name}}
          </mat-option>
        </mat-select>
      </mat-form-field>
    </p>
    <p>
      Selected Banks:
    </p>
    <ul *ngFor="let bank of bankMultiCtrl?.value">
      <li>{{bank.name}}</li>
    </ul>
  `,
})
export class MatSelectSearchTestComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('selectSingle') matSelect: MatSelect;
  @ViewChild('selectSingleMatOption') matSelectMatOption: MatSelect;
  @ViewChild('selectMulti') matSelectMulti: MatSelect;
  @ViewChild('selectSearchSingle') matSelectSearch: MatSelectSearchComponent;
  @ViewChild('selectSearchSingleMatOption') matSelectSearchMatOption: MatSelectSearchComponent;
  @ViewChild('selectSearchMulti') matSelectSearchMulti: MatSelectSearchComponent;

  // control for the selected bank
  public bankCtrl: UntypedFormControl = new UntypedFormControl();
  // control for the selected bank
  public bankCtrlMatOption: UntypedFormControl = new UntypedFormControl();
  // control for the MatSelect filter keyword
  public bankFilterCtrl: UntypedFormControl = new UntypedFormControl();
  // control for the MatSelect filter keyword
  public bankFilterCtrlMatOption: UntypedFormControl = new UntypedFormControl();

  /** control for the selected bank for multi-selection */
  public bankMultiCtrl: UntypedFormControl = new UntypedFormControl();

  /** control for the MatSelect filter keyword multi-selection */
  public bankMultiFilterCtrl: UntypedFormControl = new UntypedFormControl();


  // list of banks
  public banks: Bank[] = [
    { name: 'Bank A', id: 'A', bic: { value: '102' } },
    { name: 'Bank B', id: 'B', bic: { value: '203' } },
    { name: 'Bank C', id: 'C', bic: { value: '304' } },
    { name: 'Bank DC', id: 'DC', bic: { value: '405' } }
  ];

  public filteredBanks: ReplaySubject<Bank[]> = new ReplaySubject<Bank[]>(1);
  public filteredBanksMatOption: ReplaySubject<Bank[]> = new ReplaySubject<Bank[]>(1);

  /** list of banks filtered by search keyword for multi-selection */
  public filteredBanksMulti: ReplaySubject<Bank[]> = new ReplaySubject<Bank[]>(1);

  public initialSingleSelection: Bank;
  public initialSingleSelectionMatOption: Bank;
  public initialMultiSelection: Bank[] = [];


  // Subject that emits when the component has been destroyed.
  private _onDestroy = new Subject<void>();

  ngOnInit() {
    // set initial selection
    if (this.initialSingleSelection) {
      this.bankCtrl.setValue(this.initialSingleSelection);
    }
    if (this.initialSingleSelectionMatOption) {
      this.bankCtrlMatOption.setValue(this.initialSingleSelectionMatOption);
    }
    if (this.initialMultiSelection) {
      this.bankMultiCtrl.setValue(this.initialMultiSelection);
    }


    // load the initial bank list
    this.filteredBanks.next(this.banks.slice());
    this.filteredBanksMatOption.next(this.banks.slice());
    this.filteredBanksMulti.next(this.banks.slice());

    // listen for search field value changes
    this.bankFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterBanks();
      });
    this.bankFilterCtrlMatOption.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterBanksMatOption();
      });
    this.bankMultiFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterBanksMulti();
      });
  }

  ngAfterViewInit() {
    this.setInitialValue();
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  /**
   * Sets the initial value after the filteredBanks are loaded initially
   */
  private setInitialValue() {
    this.filteredBanks
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        // setting the compareWith property to a comparison function
        // triggers initializing the selection according to the initial value of
        // the form control (i.e. _initializeSelection())
        // this needs to be done after the filteredBanks are loaded initially
        // and after the mat-option elements are available
        this.matSelect.compareWith = (a: Bank, b: Bank) => a && b && a.id === b.id;
        this.matSelectMatOption.compareWith = (a: Bank, b: Bank) => a && b && a.id === b.id;
        this.matSelectMulti.compareWith = (a: Bank, b: Bank) => a && b && a.id === b.id;
      });
  }

  private filterBanks() {
    if (!this.banks) {
      return;
    }

    // get the search keyword
    let search = this.bankFilterCtrl.value;
    if (!search) {
      this.filteredBanks.next(this.banks.slice());
      return;
    } else {
      search = search.toLowerCase();
    }

    // filter the banks
    this.filteredBanks.next(
      this.banks.filter(bank => bank.name.toLowerCase().indexOf(search) > -1)
    );
  }

  private filterBanksMatOption() {
    if (!this.banks) {
      return;
    }

    // get the search keyword
    let search = this.bankFilterCtrlMatOption.value;
    if (!search) {
      this.filteredBanksMatOption.next(this.banks.slice());
      return;
    } else {
      search = search.toLowerCase();
    }

    // filter the banks
    this.filteredBanksMatOption.next(
      this.banks.filter(bank => bank.name.toLowerCase().indexOf(search) > -1)
    );
  }


  private filterBanksMulti() {
    if (!this.banks) {
      return;
    }
    // get the search keyword
    let search = this.bankMultiFilterCtrl.value;
    if (!search) {
      this.filteredBanksMulti.next(this.banks.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredBanksMulti.next(
      this.banks.filter(bank => bank.name.toLowerCase().indexOf(search) > -1)
    );
  }
}

describe('MatSelectSearchComponent', () => {
  let component: MatSelectSearchTestComponent;
  let fixture: ComponentFixture<MatSelectSearchTestComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        NgxMatSelectSearchModule
      ],
      declarations: [MatSelectSearchTestComponent],
      providers: [{
        provide: LiveAnnouncer,
        useValue: {
          announce: jasmine.createSpy('announce')
        }
      }
      ]
    })
      .compileComponents();
  }));


  beforeEach(() => {
    fixture = TestBed.createComponent(MatSelectSearchTestComponent);
    component = fixture.componentInstance;
  });

  describe('without initial selection', () => {

    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should show a search field and focus it when opening the select', (done) => {

      component.filteredBanks
        .pipe(
          take(1),
          delay(1)
        )
        .subscribe(() => {
          // when the filtered banks are initialized
          fixture.detectChanges();

          component.matSelect.open();
          fixture.detectChanges();

          component.matSelect.openedChange
            .pipe(
              take(1),
              delay(1)
            )
            .subscribe((opened) => {
              expect(opened).toBe(true);
              const searchField = document.querySelector('.mat-select-search-inner .mat-select-search-input');
              const searchInner = document.querySelector('.mat-select-search-inner');
              expect(searchInner).toBeTruthy();
              expect(searchField).toBeTruthy();
              // check focus
              expect(searchField).toBe(document.activeElement);

              const optionElements = document.querySelectorAll('mat-option');
              expect(component.matSelect.options.length).toBe(4);
              expect(optionElements.length).toBe(4);

              done();
            });

        });

    });


    it('should filter the options available and hightlight the first option in the list, filter the options by input "c" and reset the list', (done) => {

      component.filteredBanks
        .pipe(
          take(1),
          delay(1)
        )
        .subscribe(() => {
          // when the filtered banks are initialized
          fixture.detectChanges();

          component.matSelect.open();
          fixture.detectChanges();

          component.matSelect.openedChange
            .pipe(take(1))
            .subscribe((opened) => {
              expect(opened).toBe(true);
              const searchField = document.querySelector('.mat-select-search-inner .mat-select-search-input');
              expect(searchField).toBeTruthy();

              expect(component.matSelect.options.length).toBe(4);

              // search for "c"
              component.matSelectSearch._formControl.setValue('c');
              fixture.detectChanges();

              expect(component.bankFilterCtrl.value).toBe('c');
              expect(component.matSelect.panelOpen).toBe(true);

              component.filteredBanks
                .pipe(take(1))
                .subscribe(() => {
                  fixture.detectChanges();

                  setTimeout(() => {
                    expect(component.matSelect.options.length).toBe(2);
                    expect(component.matSelect.options.first.value.id).toBe('C');
                    expect(component.matSelect.options.first.active).toBe(true, 'first active');

                    component.matSelectSearch._reset(true);
                    fixture.detectChanges();

                    // check focus
                    expect(searchField).toBe(document.activeElement);
                    expect(component.matSelect.panelOpen).toBe(true);

                    component.filteredBanks
                      .pipe(take(1))
                      .subscribe(() => {
                        fixture.detectChanges();
                        if (component.matSelectSearch.clearSearchInput) {
                          expect(component.matSelect.options.length).toBe(4);
                        } else {
                          expect(component.matSelect.options.length).toBe(2);
                        }

                        done();
                      });
                  });

                });

            });

        });

    });

    it('should not announce active option if there are no options', (done) => {
      const announcer = TestBed.get(LiveAnnouncer);
      component.filteredBanks
        .pipe(
          take(1),
          delay(1)
        )
        .subscribe(() => {
          // when the filtered banks are initialized
          fixture.detectChanges();

          component.matSelect.open();
          fixture.detectChanges();

          component.matSelect.openedChange
            .pipe(take(1))
            .subscribe(() => {

              // search for "something definitely not in the list"
              component.matSelectSearch._formControl.setValue('something definitely not in the list');
              fixture.detectChanges();

              component.filteredBanks
                .pipe(take(1))
                .subscribe(() => {
                  fixture.detectChanges();

                  setTimeout(() => {
                    expect(component.matSelect.options.length).toBe(0);

                    component.matSelectSearch._handleKeyup({keyCode: DOWN_ARROW} as KeyboardEvent);
                    expect(announcer.announce).not.toHaveBeenCalled();
                    done();
                  });
                });
            });
        });
    });

    describe('inside mat-option', () => {

      it('should show a search field and focus it when opening the select', (done) => {

        component.filteredBanksMatOption
          .pipe(
            take(1),
            delay(1)
          )
          .subscribe(() => {
            // when the filtered banks are initialized
            fixture.detectChanges();

            component.matSelectMatOption.open();
            fixture.detectChanges();

            component.matSelectMatOption.openedChange
              .pipe(
                take(1),
                delay(1)
              )
              .subscribe((opened) => {
                expect(opened).toBe(true);
                const searchField = document.querySelector('.mat-select-search-inner .mat-select-search-input');
                const searchInner = document.querySelector('.mat-select-search-inner');
                expect(searchInner).toBeTruthy();
                expect(searchField).toBeTruthy();
                // check focus
                expect(searchField).toBe(document.activeElement);

                const optionElements = document.querySelectorAll('mat-option');
                expect(component.matSelectMatOption.options.length).toBe(5);
                expect(optionElements.length).toBe(5);

                done();
              });

          });

      });


      it('should filter the options available and hightlight the first option in the list, filter the options by input "c" and reset the list', (done) => {

        component.filteredBanksMatOption
          .pipe(
            take(1),
            delay(1)
          )
          .subscribe(() => {
            // when the filtered banks are initialized
            fixture.detectChanges();

            component.matSelectMatOption.open();
            fixture.detectChanges();

            component.matSelectMatOption.openedChange
              .pipe(take(1))
              .subscribe((opened) => {
                expect(opened).toBe(true);
                const searchField = document.querySelector('.mat-select-search-inner .mat-select-search-input');
                expect(searchField).toBeTruthy();

                expect(component.matSelectMatOption.options.length).toBe(5);

                // search for "c"
                component.matSelectSearchMatOption._formControl.setValue('c');
                fixture.detectChanges();

                expect(component.bankFilterCtrlMatOption.value).toBe('c');
                expect(component.matSelectMatOption.panelOpen).toBe(true);

                component.filteredBanks
                  .pipe(take(1))
                  .subscribe(() => {
                    fixture.detectChanges();

                    setTimeout(() => {
                      expect(component.matSelectMatOption.options.length).toBe(3);
                      expect(component.matSelectMatOption.options.toArray()[1].value.id).toBe('C');
                      expect(component.matSelectMatOption.options.toArray()[1].active).toBe(true, 'first active');

                      component.matSelectSearchMatOption._reset(true);
                      fixture.detectChanges();

                      // check focus
                      expect(searchField).toBe(document.activeElement);
                      expect(component.matSelectMatOption.panelOpen).toBe(true);

                      component.filteredBanks
                        .pipe(take(1))
                        .subscribe(() => {
                          fixture.detectChanges();
                          expect(component.matSelectMatOption.options.length).toBe(5);

                          done();
                        });
                    });

                  });

              });

          });

      });

      it('should compare first option changed by value of "bic"', (done) => {
        component.matSelectMatOption.compareWith = (b1: Bank, b2: Bank) => b1.bic.value === b2.bic.value;

        component.filteredBanksMatOption
          .pipe(
            take(1),
            delay(1)
          )
          .subscribe(() => {
            // when the filtered banks are initialized
            fixture.detectChanges();

            component.matSelectMatOption.open();
            fixture.detectChanges();

            component.matSelectMatOption.openedChange
              .pipe(take(1))
              .subscribe((opened) => {
                expect(opened).toBe(true);
                const searchField = document.querySelector('.mat-select-search-inner .mat-select-search-input');
                expect(searchField).toBeTruthy();

                expect(component.matSelectMatOption.options.length).toBe(5);

                // search for "c"
                component.matSelectSearchMatOption._formControl.setValue('c');
                fixture.detectChanges();

                expect(component.bankFilterCtrlMatOption.value).toBe('c');
                expect(component.matSelectMatOption.panelOpen).toBe(true);

                component.filteredBanks
                  .pipe(take(1))
                  .subscribe(() => {
                    fixture.detectChanges();

                    setTimeout(() => {
                      expect(component.matSelectMatOption.options.length).toBe(3);
                      expect(component.matSelectMatOption.options.toArray()[1].value.id).toBe('C');
                      expect(component.matSelectMatOption.options.toArray()[1].active).toBe(true, 'first active');

                      // search for DC
                      component.matSelectSearchMatOption._formControl.setValue('DC');
                      fixture.detectChanges();

                      component.filteredBanks
                        .pipe(take(1))
                        .subscribe(() => {
                          fixture.detectChanges();

                          setTimeout(() => {
                            expect(component.matSelectMatOption.options.length).toBe(2);
                            expect(component.matSelectMatOption.options.toArray()[1].value.id).toBe('DC');
                            expect(component.matSelectMatOption.options.toArray()[1].active).toBe(true, 'first active');

                            done();
                          });
                        });
                    });

                  });

              });

          });

      });
    })

  });

  describe('with initial selection', () => {

    it('should set the initial selection of MatSelect', waitForAsync((done) => {
      component.initialSingleSelection = component.banks[3];
      fixture.detectChanges();

      component.filteredBanks
        .pipe(
          take(1),
          delay(1)
        )
        .subscribe(() => {

          // when the filtered banks are initialized
          fixture.detectChanges();
          fixture.whenStable().then(() => {
            fixture.detectChanges();
            component.matSelect.options.changes
              .pipe(take(1))
              .subscribe(() => {

                expect(component.matSelect.value).toEqual(component.banks[3]);

                component.matSelect.open();
                fixture.detectChanges();

                component.matSelect.openedChange
                  .pipe(take(1))
                  .subscribe((opened) => {
                    expect(opened).toBe(true);
                    expect(component.matSelect.value).toEqual(component.banks[3]);
                    expect(component.bankCtrl.value).toEqual(component.banks[3]);

                    done();
                  });
              });

          });

        });

    }));

    it('set the initial selection with multi=true and filter the options available, filter the options by input "c" and select an option', waitForAsync((done) => {
      component.initialMultiSelection = [component.banks[1]];
      fixture.detectChanges();

      component.filteredBanksMulti
        .pipe(
          take(1),
          delay(1)
        )
        .subscribe(() => {
          // when the filtered banks are initialized
          fixture.detectChanges();
          fixture.whenStable().then(() => {
            fixture.detectChanges();
            component.matSelect.options.changes
              .pipe(take(1))
              .subscribe(() => {

                component.matSelectMulti.open();
                fixture.detectChanges();

                component.matSelectMulti.openedChange
                  .pipe(take(1))
                  .subscribe((opened) => {
                    expect(opened).toBe(true);
                    expect(component.matSelectMulti.value).toEqual([component.banks[1]]);
                    expect(component.bankMultiCtrl.value).toEqual([component.banks[1]]);

                    const searchField = document.querySelector('.mat-select-search-inner .mat-select-search-input');
                    expect(searchField).toBeTruthy();

                    expect(component.matSelectMulti.options.length).toBe(4);

                    // search for "c"
                    component.matSelectSearchMulti._formControl.setValue('c');
                    fixture.detectChanges();

                    expect(component.bankFilterCtrl.value).toBe('c');
                    expect(component.matSelectMulti.panelOpen).toBe(true);

                    component.filteredBanks
                      .pipe(take(1))
                      .subscribe(() => {
                        fixture.detectChanges();

                        setTimeout(() => {
                          expect(component.matSelectMulti.options.length).toBe(2);
                          expect(component.matSelectMulti.options.first.value.id).toBe('C');
                          expect(component.matSelectMulti.options.first.active).toBe(true, 'first active');

                          component.matSelectMulti.options.first._selectViaInteraction();

                          fixture.detectChanges();

                          // check focus
                          expect(component.matSelectMulti.panelOpen).toBe(true);

                          setTimeout(() => {
                            fixture.detectChanges();
                            expect(component.matSelectMulti.value).toEqual([component.banks[1], component.banks[2]]);
                            expect(component.bankMultiCtrl.value).toEqual([component.banks[1], component.banks[2]]);

                            // search for "d"
                            component.matSelectSearchMulti._formControl.setValue('d');
                            fixture.detectChanges();

                            expect(component.bankFilterCtrl.value).toBe('d');
                            expect(component.matSelectMulti.panelOpen).toBe(true);

                            component.filteredBanks
                              .pipe(take(1))
                              .subscribe(() => {
                                fixture.detectChanges();

                                setTimeout(() => {
                                  expect(component.matSelectMulti.options.length).toBe(1);
                                  expect(component.matSelectMulti.options.first.value.id).toBe('DC');
                                  expect(component.matSelectMulti.options.first.active).toBe(true, 'first active');

                                  component.matSelectMulti.options.first._selectViaInteraction();

                                  fixture.detectChanges();

                                  // check focus
                                  expect(component.matSelectMulti.panelOpen).toBe(true);

                                  setTimeout(() => {
                                    fixture.detectChanges();
                                    expect(component.matSelectMulti.value).toEqual([component.banks[1], component.banks[2], component.banks[3]]);
                                    expect(component.bankMultiCtrl.value).toEqual([component.banks[1], component.banks[2], component.banks[3]]);
                                    done();

                                  });
                                });

                              });

                          });
                        });

                      });

                  });
              });
          });


        });
    }));

  });

});


describe('MatSelectSearchComponent with default options', () => {
  let component: MatSelectSearchTestComponent;
  let fixture: ComponentFixture<MatSelectSearchTestComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        NgxMatSelectSearchModule
      ],
      declarations: [MatSelectSearchTestComponent],
      providers: [
        {
          provide: LiveAnnouncer,
          useValue: {
            announce: jasmine.createSpy('announce')
          }
        },
        {
          provide: MAT_SELECTSEARCH_DEFAULT_OPTIONS,
          useValue: {
            placeholderLabel: 'Mega bla',
          } as MatSelectSearchOptions,
        },
      ]
    })
      .compileComponents();
  }));


  beforeEach(() => {
    fixture = TestBed.createComponent(MatSelectSearchTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should show a search field and focus it when opening the select', (done) => {

      component.filteredBanks
        .pipe(
          take(1),
          delay(1)
        )
        .subscribe(() => {
          // when the filtered banks are initialized
          fixture.detectChanges();

          component.matSelect.open();
          fixture.detectChanges();

          component.matSelect.openedChange
            .pipe(
              take(1),
              delay(1)
            )
            .subscribe(() => {
              const searchField = document.querySelector('.mat-select-search-inner .mat-select-search-input') as HTMLInputElement;

              expect(searchField.placeholder).toBe('Mega bla');
              done();
            });

        });

    });

});
