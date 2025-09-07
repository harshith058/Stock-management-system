package com.ofss;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
public class TransactionController {
	
	@Autowired
	private TransactionService transactionService;
	@Autowired
    private RestTemplate restTemplate;
	
	@PostMapping("/transaction")
	public ResponseEntity<Map<String, Object>> performTransaction(@RequestBody Transaction t) {
	    Double unitPrice = getTransactionPrice(t.getStockId());
	    Map<String, Object> response = new HashMap<>();
	    if (unitPrice == null) {
	        response.put("success", false);
	        response.put("message", "Stock not found for ID: " + t.getStockId());
	        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
	    }
	    t.setTransactionPrice(t.getVolume() * unitPrice);
	    t.setTransactionTime(LocalDateTime.now());
	    boolean result = transactionService.performTransaction(t);
	    if (result) {
	        response.put("success", true);
	        response.put("message", "Transaction successful!");
	        response.put("transactionPrice", t.getTransactionPrice());
	        response.put("transactionTime", t.getTransactionTime());
	    } else {
	        response.put("success", false);
	        response.put("message", "Transaction failed.");
	    }
	    return ResponseEntity.status(result ? HttpStatus.OK : HttpStatus.INTERNAL_SERVER_ERROR).body(response);
	}
	
	public Double getTransactionPrice(long stockId) {
	    Stocks stock = restTemplate.getForObject(
	            "http://STOCKSMSJDBC/stock/{stockId}",
	            Stocks.class,
	            stockId
	    );
	    if (stock != null) {
	        return stock.getStockPrice();
	    } else {
	        return null; // no stock found
	    }
	}
	
	@GetMapping("/transactions/customer/{customerId}")
	public ResponseEntity<?> getCustomerTransactions(@PathVariable Long customerId) {
	    List<Transaction> transactions = transactionService.getTransactionsByCustomerId(customerId);
	    if (transactions == null || transactions.isEmpty()) {
	        Map<String, Object> response = new HashMap<>();
	        response.put("success", false);
	        response.put("message", "No transactions found for customer ID: " + customerId);
	        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
	    }
	    return ResponseEntity.ok(transactions);
	}
	
	
}
