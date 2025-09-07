package com.ofss;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CustomerController {

	@Autowired
	private CustomerService customerService;

	@RequestMapping(value = "/customer", method = RequestMethod.POST)
	public ResponseEntity<Map<String, Object>> addNewCustomer(@RequestBody Customer c) {
	    boolean isAdded = customerService.addNewCustomer(c);
	    Map<String, Object> response = new HashMap<>();
	    if (isAdded) {
	        response.put("success", true);
	        response.put("message", "Customer Added Successfully");
	        return ResponseEntity.ok(response);
	    } else {
	        response.put("success", false);
	        response.put("message", "Failed to add customer");
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
	    }
	}

	@RequestMapping(value = "/customer/{email}", method = RequestMethod.GET)
	public ResponseEntity<Customer> getCustomerDetails(@PathVariable("email") String email) {
	    Customer c = customerService.getCustomerDetailsByEmail(email);
	    if (c != null) {
	        return ResponseEntity.ok(c);
	    } else {
	        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
	    }
	}

	@RequestMapping(value = "/customer/login", method = RequestMethod.POST)
	public ResponseEntity<Map<String, Object>> loginCustomer(@RequestBody Customer c) {
	    boolean valid = customerService.validateLogin(c.getEmailId(), c.getPassword());
	    Map<String, Object> response = new HashMap<>();
	    if (valid) {
	        response.put("success", true);
	        response.put("message", "Login successful!");
	        return ResponseEntity.ok(response);
	    } else {
	        response.put("success", false);
	        response.put("message", "Invalid email or password");
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
	    }
	}
	
	@RequestMapping(value = "/customer/stocksDetails/{customerId}", method = RequestMethod.GET)
	public ResponseEntity<List<CustomerStockDetail>> getCustomerStockDetails(@PathVariable("customerId") int customerId) {
		System.out.println("I am in customer controller");
		List<CustomerStockDetail> details = customerService.getCustomerStockDetails(customerId);
        return ResponseEntity.ok(details);
	}
	@RequestMapping(value = "/customer/list", method = RequestMethod.GET)
	public ArrayList<Customer> getCustomers() {
		System.out.println("Fetching all stocks...");
		return customerService.getAllCustomers(); 
	} 
		
	@RequestMapping(value="/customer/{customerId}", method=RequestMethod.DELETE)
	public ResponseEntity<Object> deleteAStockById(@PathVariable("customerId") int cid) {
		System.out.println("Deleting a stock by id called from the controller");
		return customerService.deleteACustomerById(cid);
	}
}
