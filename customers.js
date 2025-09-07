define(['../accUtils', 'knockout'],
  function (accUtils, ko) {
    function CustomerViewModel() {
      this.customers = ko.observableArray([]);
      this.deleteCustomerId = ko.observable('');
      this.currentSection = ko.observable('list'); // 'list' or 'delete'

      this.listCustomers = () => {
        fetch('http://hyarrabe-61kffb4:8085/customer/list')
          .then(response => response.json())
          .then(data => { this.customers(data); })
          .catch(error => { alert('Failed to list customers: ' + error); });
      };

      this.showListSection = () => {
        this.currentSection('list');
        this.deleteCustomerId('');
        this.listCustomers();
      };

      this.showDeleteSection = () => {
        this.currentSection('delete');
        this.deleteCustomerId('');
      };

      this.deleteCustomer = () => {
        const id = this.deleteCustomerId();
        if (!id) {
          alert("Please enter a Customer ID to delete.");
          return;
        }
        if (!confirm("Are you sure you want to delete customer " + id + "? This action cannot be undone.")) {
          return;
        }
        fetch('http://hyarrabe-61kffb4:8085/customer/' + encodeURIComponent(id), {
          method: 'DELETE'
        })
          .then(resp => resp.text())
          .then(msg => {
            alert("Deleted: " + msg);
            this.showListSection();
          })
          .catch(err => alert("Error deleting customer: " + err));
      };

      // Load the table at startup
      this.showListSection();

      this.connected = () => {
        accUtils.announce('Customers page loaded.', 'assertive');
        document.title = "Customers";
      };
      this.disconnected = () => {};
      this.transitionCompleted = () => {};
    }
    return CustomerViewModel;
  }
);