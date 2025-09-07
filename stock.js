define(['../accUtils', 'knockout'],
 function(accUtils, ko) {
    function DashboardViewModel() {
      // Section navigation (show one at a time)
      this.currentSection = ko.observable('add'); // Default to "add" section

      // Stock fields
      this.stock = ko.observableArray([]);
      this.sId = ko.observable('');
      this.sName = ko.observable('');
      this.price = ko.observable('');
      this.volume = ko.observable('');
      this.lisPrice = ko.observable('');
      this.listedDate = ko.observable('');
      this.exchange = ko.observable('');
      this.clearFields = () => {
        this.sId('');
        this.sName('');
        this.price('');
        this.volume('');
        this.lisPrice('');
        this.listedDate('');
        this.exchange('');
      };
        // Add Stock
        this.addStock = () => {
          const stock = {
            stockId: this.sId(),
            stockName: this.sName(),
            stockPrice: this.price(),
            stockVolume: this.volume(),
            listedPrice: this.lisPrice(),
            listedExchange: this.exchange()
          };
          fetch('http://hyarrabe-61kffb4:8091/stock', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(stock)
          })
            .then(response => response.text())
            .then(data => {
              alert('Response : ' + JSON.stringify(data));
              this.clearFields(); 
            })
            .catch(error => {
              alert('Failed to add a stock: ' + error);
            });
        };

        // List Stocks
        this.getStocks = () => {
          fetch('http://hyarrabe-61kffb4:8091/stock', {
            method: 'GET'
          })
            .then(response => response.json())
            .then(data => {
              this.stock(data);
            })
            .catch(error => {
              alert('Failed to list stocks: ' + error);
            });
        };

        // Update Stock
        this.updateStock = () => {
          const stock = {
            stockId: this.sId(),
            stockName: this.sName(),
            stockPrice: this.price(),
            stockVolume: this.volume(),
            listedPrice: this.lisPrice(),
            listedDate: this.listedDate() || new Date().toISOString().substring(0,10),
            listedExchange: this.exchange()
          };
          fetch('http://hyarrabe-61kffb4:8091/stock/' + this.sId(), {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(stock)
          })
          .then(response => response.text())
          .then(data => {
            alert('Stock updated: ' + data);
            this.clearFields(); 
          })
          .catch(error => {
            alert('Failed to update stock: ' + error);
          });
        };

        // Delete Stock
        this.deleteStock = () => {
          fetch('http://hyarrabe-61kffb4:8091/stock/' + this.sId(), {
            method: 'DELETE'
          })
            .then(response => response.text())
            .then(data => { alert('Stock deleted: ' + data); })
            .catch(error => { alert('Failed to delete stock: ' + error); });
        };

        // Optional ViewModel hooks (for Oracle JET module lifecycle):
        this.connected = () => {
          accUtils.announce('Dashboard page loaded.', 'assertive');
          document.title = "Dashboard";
        };
        this.disconnected = () => {};
        this.transitionCompleted = () => {};
      }
    return DashboardViewModel;
  }
);