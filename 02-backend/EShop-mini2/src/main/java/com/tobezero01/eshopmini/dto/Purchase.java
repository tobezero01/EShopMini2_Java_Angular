package com.tobezero01.eshopmini.dto;

import com.tobezero01.eshopmini.entity.Address;
import com.tobezero01.eshopmini.entity.Customer;
import com.tobezero01.eshopmini.entity.Order;
import com.tobezero01.eshopmini.entity.OrderItem;
import lombok.Data;

import java.util.Set;

@Data
public class Purchase {

    private Customer customer;
    private Address shippingAddress;
    private Address billingAddress;
    private Order order;
    private Set<OrderItem> orderItems;

}
