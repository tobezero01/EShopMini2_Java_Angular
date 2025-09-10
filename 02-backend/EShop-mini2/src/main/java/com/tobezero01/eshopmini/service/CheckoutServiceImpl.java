package com.tobezero01.eshopmini.service;

import com.tobezero01.eshopmini.dao.CustomerRepository;
import com.tobezero01.eshopmini.dto.Purchase;
import com.tobezero01.eshopmini.dto.PurchaseResponse;
import com.tobezero01.eshopmini.entity.Customer;
import com.tobezero01.eshopmini.entity.Order;
import com.tobezero01.eshopmini.entity.OrderItem;
import jakarta.transaction.Transactional;

import java.util.Set;
import java.util.UUID;

public class CheckoutServiceImpl implements CheckoutService{

    private CustomerRepository customerRepository;

    public CheckoutServiceImpl(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Override
    @Transactional
    public PurchaseResponse placeOrder(Purchase purchase) {
        Order order = purchase.getOrder();

        String orderTrackingNumber = generateOrderTrackingNumber();
        order.setOrderTrackingNumber(orderTrackingNumber);

        Set<OrderItem> orderItems = purchase.getOrderItems();
        orderItems.forEach(item -> order.add(item));

        order.setBillingAddress(purchase.getBillingAddress());
        order.setShippingAddress(purchase.getShippingAddress());

        Customer customer = purchase.getCustomer();
        String theEmail = customer.getEmail();
        Customer customerFromDB = customerRepository.findByEmail(theEmail);
        if (customerFromDB != null) {
            customer = customerFromDB;
        }
        customer.add(order);
        customerRepository.save(customer);

        return new PurchaseResponse(orderTrackingNumber);
    }

    private String generateOrderTrackingNumber() {
        return UUID.randomUUID().toString();
    }
}
