import { MyFormService } from './../../services/my-form.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Country } from '../../common/country';
import { State } from '../../common/state';
import { MyValidators } from '../../validators/my-validators';
import { CartService } from '../../services/cart.service';
import { CheckoutService } from '../../services/checkout.service';
import { Order } from '../../common/order';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {


  checkoutFormGroup: FormGroup | undefined;
  isDisabled: boolean = false;

  totalQuantity: number = 0;
  totalPrice: number = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries: Country[] = [];
  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  constructor(private readonly formBuilder: FormBuilder,
    private readonly myFormService: MyFormService,
    private readonly cartService: CartService,
    private readonly checkoutService: CheckoutService,
    private readonly router: Router
  ) {

  }
  ngOnInit(): void {
    this.reviewCartDetails();


    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('',
          [Validators.required,
          Validators.minLength(2),
          MyValidators.notOnlyWhitespace]),

        lastName: new FormControl('',
          [Validators.required,
          Validators.minLength(2),
          MyValidators.notOnlyWhitespace]),

        email: new FormControl('',
          [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2),
        MyValidators.notOnlyWhitespace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2),
        MyValidators.notOnlyWhitespace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2),
        MyValidators.notOnlyWhitespace])
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2),
        MyValidators.notOnlyWhitespace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2),
        MyValidators.notOnlyWhitespace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2),
        MyValidators.notOnlyWhitespace])
      }),
      creditCard: this.formBuilder.group({

      })
    });


    const startMonth: number = new Date().getMonth() + 1;

    this.myFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        this.creditCardMonths = data
      }
    )

    this.myFormService.getCreditCardYears().subscribe(
      data => {
        this.creditCardYears = data
      }
    )

    this.myFormService.getCountries().subscribe(
      data => {
        console.log("Retrieved countries: " + JSON.stringify(data));
        this.countries = data;
      }
    );
  }
  reviewCartDetails() {
    this.cartService.totalQuantity.subscribe(
      totalQuantity => this.totalQuantity = totalQuantity
    );

    this.cartService.totalPrice.subscribe(
      totalPrice => this.totalPrice = totalPrice
    );

  }

  onSubmit() {
    console.log("Handling the submit button");

    if (this.checkoutFormGroup?.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    const cartItems = this.cartService.cartItems;

  }

  get firstName() { return this.checkoutFormGroup?.get('customer.firstName'); }
  get lastName() { return this.checkoutFormGroup?.get('customer.lastName'); }
  get email() { return this.checkoutFormGroup?.get('customer.email'); }

  get shippingAddressStreet() { return this.checkoutFormGroup?.get('shippingAddress.street'); }
  get shippingAddressCity() { return this.checkoutFormGroup?.get('shippingAddress.city'); }
  get shippingAddressState() { return this.checkoutFormGroup?.get('shippingAddress.state'); }
  get shippingAddressZipCode() { return this.checkoutFormGroup?.get('shippingAddress.zipCode'); }
  get shippingAddressCountry() { return this.checkoutFormGroup?.get('shippingAddress.country'); }

  get billingAddressStreet() { return this.checkoutFormGroup?.get('billingAddress.street'); }
  get billingAddressCity() { return this.checkoutFormGroup?.get('billingAddress.city'); }
  get billingAddressState() { return this.checkoutFormGroup?.get('billingAddress.state'); }
  get billingAddressZipCode() { return this.checkoutFormGroup?.get('billingAddress.zipCode'); }
  get billingAddressCountry() { return this.checkoutFormGroup?.get('billingAddress.country'); }

  get creditCardType() { return this.checkoutFormGroup?.get('creditCard.cardType'); }
  get creditCardNameOnCard() { return this.checkoutFormGroup?.get('creditCard.nameOnCard'); }
  get creditCardNumber() { return this.checkoutFormGroup?.get('creditCard.cardNumber'); }
  get creditCardSecurityCode() { return this.checkoutFormGroup?.get('creditCard.securityCode'); }


  copyShippingAddressToBillingAddress(event: any) {
    if (event.target.checked) {
      this.checkoutFormGroup?.get('billingAddress')?.setValue(
        this.checkoutFormGroup?.get('shippingAddress')?.value
      );
      this.billingAddressStates = this.shippingAddressStates;
    } else {
      this.checkoutFormGroup?.get('billingAddress')?.reset();
      this.billingAddressStates = [];
    }
  }

  getStates(formGroupName: string) {

    const formGroup = this.checkoutFormGroup?.get(formGroupName);

    const countryCode = formGroup?.value.country.code;
    const countryName = formGroup?.value.country.name;

    this.myFormService.getStates(countryCode).subscribe(
      data => {

        if (formGroupName === 'shippingAddress') {
          this.shippingAddressStates = data;
        }
        else {
          this.billingAddressStates = data;
        }

        formGroup?.get('state')?.setValue(data[0]);
      }
    );
  }



}
