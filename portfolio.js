define(['knockout','../accUtils'], function(ko,accUtils) {
  function PortfolioViewModel(params) {
    var self = this;
    self.stock = ko.observableArray([]);
    self.errorMessage = ko.observable('');
    self.customerId = ko.observable(''); 
    self.router = params && params.router// <--- Store the customerId for use later
    self.loadData = function() {
      // 1. Get email from localStorage
      var email = localStorage.getItem('user');
      if (!email) {
        self.errorMessage('No logged in user. Please log in first.');
        return;
      }
      // 2. Fetch customer info by email to get customerId
      var customerUrl = 'http://hyarrabe-61kffb4:8085/customer/' + encodeURIComponent(email);
      fetch(customerUrl)
        .then(function(response) {
          return response.json();
        })
        .then(function(customer) {
          if (customer && customer.customerId) {
            self.customerId(customer.customerId); // <--- Set the customerId
            self.loadStocks(customer.customerId);
          } else {
            self.stock([]);
            self.errorMessage('Customer not found for this email.');
          }
        })
        .catch(function(error) {
          self.errorMessage('Failed to fetch customer info: ' + error.message);
        });
    };

    self.loadStocks = function(customerId) {
      var stocksUrl = 'http://hyarrabe-61kffb4:8085/customer/stocksDetails/' + encodeURIComponent(customerId);
      fetch(stocksUrl)
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          if (Array.isArray(data) && data.length > 0) {
            // Transform stock data into observable objects for each row
            self.stock(data.map(function(s) {
              return {
                stockId: ko.observable(s.stockId),
                stockName: ko.observable(s.stockName),
                currentVolume: ko.observable(s.currentVolume),
                netInvested: ko.observable(s.netInvested),
                currentPrice: ko.observable(s.currentPrice),
                currentValue: ko.observable(s.currentValue)
              };
            }));
            self.errorMessage('');
          } else {
            self.stock([]);
            self.errorMessage('No stocks found for this customer.');
          }
        })
        .catch(function(error) {
          self.errorMessage('Failed to fetch stocks: ' + error.message);
        });
    };

    // Add the sellStock method
    self.sellStock = function(stockItem) {
      var max = stockItem.currentVolume();
      var volume = parseInt(prompt('Enter number of shares to sell (max ' + max + '):'), 10);
      if (isNaN(volume) || volume <= 0 || volume > max) {
        alert('Invalid volume entered.');
        return;
      }

      // Compose payload
      var payload = {
        stockId: stockItem.stockId(),
        customerId: self.customerId(),
        transactionType: 'SELL',
        volume: volume
      };

      // Make the POST request
      fetch('http://hyarrabe-61kffb4:8086/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(function(response) {
        if (!response.ok) throw new Error('Sell failed');
        return response.json();
      })
      .then(function(data) {
        alert('Sell successful!');
        self.loadStocks(self.customerId()); // Reload stocks to reflect changes
      })
      .catch(function(error) {
        self.errorMessage('Error processing sell: ' + (error.message || 'Sell failed.'));
      });
    };
      self.connected = () => {
      console.log("params in login ViewModel:", params);

      accUtils.announce("Login page loaded.", "assertive");
      document.title = "Login";
    };
    // Automatically load data on ViewModel creation
    self.loadData();
  }
  return PortfolioViewModel;
});