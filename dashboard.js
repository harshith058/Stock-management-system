define(['../accUtils', 'knockout'], function (accUtils, ko) {
  function DashboardViewModel(params) {
    var self = this;
    self.stock = ko.observableArray([]);
    self.customerId = ko.observable('');
    self.errorMessage = ko.observable('');
    self.router = params && params.router
    // Fetch and store customerId at startup
    if(localStorage.getItem("user")==null){self.router.go({path: 'login'})}
    self.loadCustomerId = function () {
      var email = localStorage.getItem('user');
      if (!email) {
        self.errorMessage('No logged in user. Please log in first.');
        return;
      }
      var customerUrl = 'http://hyarrabe-61kffb4:8085/customer/' + encodeURIComponent(email);
      fetch(customerUrl)
        .then(function (response) {
          return response.json();
        })
        .then(function (customer) {
          if (customer && customer.customerId) {
            self.customerId(customer.customerId);
          } else {
            self.errorMessage('Customer not found for this email.');
          }
        })
        .catch(function (error) {
          self.errorMessage('Failed to fetch customer info: ' + error.message);
        });
    };

    // Fetch stock data
    self.getStocks = function () {
      fetch('http://hyarrabe-61kffb4:8091/stock', { method: 'GET' })
        .then(response => response.json())
        .then(data => {
          // Use observable for each row so each stock is observable object
          self.stock(data.map(function (s) {
            return {
              stockId: ko.observable(s.stockId),
              stockName: ko.observable(s.stockName),
              stockPrice: ko.observable(s.stockPrice),
              stockVolume: ko.observable(s.stockVolume),
              listedPrice: ko.observable(s.listedPrice),
              listedDate: ko.observable(s.listedDate),
              listedExchange: ko.observable(s.listedExchange)
            };
          }));
        })
        .catch(error => {
          self.errorMessage('Failed to list stocks: ' + error);
        });
    };

    // Handle Buy button
    self.buyStock = function (stockItem) {
      if (!self.customerId()) {
        alert('Customer ID not loaded. Please refresh or log in.');
        return;
      }
      var volume = parseInt(prompt('Enter number of stocks to buy:'), 10);
      if (isNaN(volume) || volume <= 0) {
        alert('Invalid quantity.');
        return;
      }
      var payload = {
        stockId: stockItem.stockId(),
        customerId: self.customerId(),
        transactionType: 'BUY',
        volume: volume
      };

      fetch('http://hyarrabe-61kffb4:8086/transaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        .then(function (response) {
          if (!response.ok) throw new Error('Buy failed');
          return response.json();
        })
        .then(function (data) {
          alert('Buy successful!');
          // Optionally refresh stock list, or update UI as needed
        })
        .catch(function (error) {
          self.errorMessage('Error processing buy: ' + (error.message || 'Buy failed.'));
        });
    };
      self.connected = () => {
      console.log("params in login ViewModel:", params);

      accUtils.announce("Login page loaded.", "assertive");
      document.title = "Login";
    };
    // Load data on ViewModel creation
    self.loadCustomerId();
    self.getStocks();
  }

  return DashboardViewModel;
});