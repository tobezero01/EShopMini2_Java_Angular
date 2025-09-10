package com.tobezero01.eshopmini.dao;

import com.tobezero01.eshopmini.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Customer findByEmail(String theEmail);

}
