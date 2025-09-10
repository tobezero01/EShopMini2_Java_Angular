package com.tobezero01.eshopmini.service;

import com.tobezero01.eshopmini.dto.Purchase;
import com.tobezero01.eshopmini.dto.PurchaseResponse;

public interface CheckoutService {
    PurchaseResponse placeOrder(Purchase purchase);
}
