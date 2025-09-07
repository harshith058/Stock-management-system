package com.ofss;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TransactionService {

    @Autowired
    private TransactionDAO transactionDAO;

    public boolean performTransaction(Transaction t) {
        try {
            transactionDAO.saveTransaction(t);
            return true;
        } catch (Exception e) {
            // You can log the exception here for diagnostics
            e.printStackTrace();
            return false;
        }
    }
    public List<Transaction> getTransactionsByCustomerId(Long customerId) {
	    return transactionDAO.findTransactionsByCustomerId(customerId);
	}
    // Optionally, add methods for getting transactions, etc.
}