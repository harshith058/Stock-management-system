define(['knockout', '../accUtils'], function(ko, accUtils) {
  function HistoryViewModel(params) {
    var self = this;
    self.stock = ko.observableArray([]);
    self.errorMessage = ko.observable('');
    self.customerId = ko.observable('');
    self.router = params && params.router;

    // 1. Load data function
    self.loadData = function() {
      // a. Get email from localStorage
      var email = localStorage.getItem('user');
      if (!email) {
        self.errorMessage('No logged in user. Please log in first.');
        return;
      }
      // b. Fetch customer info
      var customerUrl = 'http://hyarrabe-61kffb4:8085/customer/' + encodeURIComponent(email);
      fetch(customerUrl)
        .then(function(response) { return response.json(); })
        .then(function(customer) {
          if (customer && customer.customerId) {
            self.customerId(customer.customerId);
            self.loadTransactions(customer.customerId);
          } else {
            self.stock([]);
            self.errorMessage('Customer not found for this email.');
          }
        })
        .catch(function(error) {
          self.errorMessage('Failed to fetch customer info: ' + error.message);
        });
    };

    // 2. Load transactions by customerId
    self.loadTransactions = function(customerId) {
      var url = 'http://hyarrabe-61kffb4:8086/transactions/customer/' + encodeURIComponent(customerId);
      fetch(url)
        .then(function(response) { return response.json(); })
        .then(function(data) {
          if (Array.isArray(data) && data.length > 0) {
            // Only map the required fields
            self.stock(data.map(function(t) {
              return {
                stockId: ko.observable(t.stockId),
                transactionType: ko.observable(t.transactionType),
                transactionPrice: ko.observable(t.transactionPrice),
                volume: ko.observable(t.volume),
                transactionTime: ko.observable(t.transactionTime)
              };
            }));
            self.errorMessage('');
          } else {
            self.stock([]);
            self.errorMessage('No transactions found for this customer.');
          }
        })
        .catch(function(error) {
          self.errorMessage('Failed to fetch transactions: ' + error.message);
        });
    };

    self.connected = function() {
      accUtils.announce("History page loaded.", "assertive");
      document.title = "History";
    };

    // Auto-load
    self.loadData();
  }

  return HistoryViewModel;
});