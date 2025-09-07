package com.ofss;

import org.springframework.jdbc.core.support.JdbcDaoSupport;
import org.springframework.stereotype.Repository;

import jakarta.annotation.PostConstruct;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;

@Repository
public class TransactionDAO extends JdbcDaoSupport {

    @Autowired
    private DataSource dataSource;

    @PostConstruct
    private void init() {
        setDataSource(dataSource);
    }
    public JdbcTemplate createJdbcTemplate() {
        return getJdbcTemplate();
    }
    public void saveTransaction(Transaction t) {
        // 1. Get next transaction_id from sequence
        String getIdSQL = "SELECT transaction_seq.NEXTVAL FROM dual";
        Long transactionId = createJdbcTemplate().queryForObject(getIdSQL, Long.class);

        // 2. Insert into transactions table
        String insertSQL = "INSERT INTO transactions "
            + "(transaction_id, stock_id, customer_id, transaction_type, transaction_price, volume, transaction_time) "
            + "VALUES (?,?,?,?,?,?,?)";
        createJdbcTemplate().update(
            insertSQL,
            transactionId,
            t.getStockId(),
            t.getCustomerId(),
            t.getTransactionType(),
            t.getTransactionPrice(),
            t.getVolume(),
            (t.getTransactionTime() != null) ? Timestamp.valueOf(t.getTransactionTime()) : new Timestamp(System.currentTimeMillis())
        );
    }
    public List<Transaction> findTransactionsByCustomerId(Long customerId) {
        String sql = "SELECT stock_id,transaction_type, transaction_price, volume, transaction_time "
                   + "FROM transactions WHERE customer_id = ?";
        List<Transaction> transactions = createJdbcTemplate().query(sql, new Object[]{customerId},
        	    (rs, rowNum) -> {
        	        Transaction t = new Transaction();
        	       
        	        t.setStockId(rs.getLong("stock_id"));
        	        
        	        t.setTransactionType(rs.getString("transaction_type"));
        	        t.setTransactionPrice(rs.getDouble("transaction_price"));
        	        t.setVolume(rs.getInt("volume"));
        	        java.sql.Timestamp ts = rs.getTimestamp("transaction_time");
        	        if (ts != null) {
        	            t.setTransactionTime(ts.toLocalDateTime());
        	        }
        	        return t;
        	    }
        	);
        return transactions;
    }
    
}