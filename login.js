define(['knockout', "../accUtils", 'appController'], function(ko, accUtils, ac) {
  function LoginViewModel(params) {
    var self = this;
    self.mail = ko.observable('');
    self.pass = ko.observable('');
    self.userType = ko.observable('customer');
    self.errorMessage = ko.observable('');
    self.showSignUp = ko.observable(false);
    self.firstName = ko.observable('');
    self.lastName = ko.observable('');
    self.phoneNumber = ko.observable('');
    self.signUpEmail = ko.observable('');
    self.signUpPassword = ko.observable('');
    self.router = params && params.router;

  

    self.login = function() {
      var emailId = self.mail();
      var password = self.pass();
      var type = self.userType();
      ac.setUserLogin(emailId);
      if (!emailId || !password) {
        self.errorMessage('Please enter both email and password.');
        return;
      }

      // ADMIN HARDCODED CHECK
        if (
        type === 'admin' &&
        emailId === 'admin@gmail.com' &&
        password === 'admin'
        ) {
        localStorage.setItem("user", emailId);
        localStorage.setItem("userType", "admin");
        self.errorMessage('');
        alert('Admin login successful!');
         ac.setUserLogin(emailId);
        ac.setNavData('admin');
        if (self.router) self.router.go({ path: 'stock' });
        return;
      }

      // CUSTOMER/BACKEND LOGIN
      fetch('http://hyarrabe-61kffb4:8085/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailId: emailId, password: password, userType: type })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          localStorage.setItem("user", emailId);
          localStorage.setItem("userType", "customer");
          self.errorMessage('');
          alert('Login successful!');
          ac.setUserLogin(emailId);
          ac.setNavData('customer');
          if (self.router) self.router.go({ path: 'dashboard' });
        }
      });
    };

    self.signUp = function() {
      if (!self.firstName() || !self.lastName() || !self.phoneNumber() ||
          !self.signUpEmail() || !self.signUpPassword()) {
        self.errorMessage('Please fill all sign up fields.');
        return;
      }
      var data = {
        firstName: self.firstName(),
        lastName: self.lastName(),
        phoneNumber: self.phoneNumber(),
        emailId: self.signUpEmail(),
        password: self.signUpPassword()
      };
      fetch('http://hyarrabe-61kffb4:8085/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          alert('Sign up successful! You can now log in.');
          self.showLoginForm();
          self.mail(self.signUpEmail());
        } else {
          self.errorMessage(result.message || 'Sign up failed.');
        }
      })
      .catch(error => {
        self.errorMessage('Sign up failed: ' + error.message);
      });
    };
    self.showSignUpForm = function() {
      self.showSignUp(true);
      self.errorMessage('');
    };
    self.showLoginForm = function() {
      self.showSignUp(false);
      self.errorMessage('');
    };
    self.connected = () => {
      accUtils.announce("Login page loaded.", "assertive");
      document.title = "Login";
    };
  }
  return LoginViewModel;
});