/**
 * @license
 * Copyright (c) 2014, 2025, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/*
 * Your application specific code will go here
 */
define(['knockout','accUtils','ojs/ojcontext', 'ojs/ojmodule-element-utils', 'ojs/ojknockouttemplateutils', 'ojs/ojcorerouter', 'ojs/ojmodulerouter-adapter', 'ojs/ojknockoutrouteradapter', 'ojs/ojurlpathadapter', 'ojs/ojresponsiveutils', 'ojs/ojresponsiveknockoututils', 'ojs/ojarraydataprovider',
        'ojs/ojdrawerpopup', 'ojs/ojmodule-element', 'ojs/ojknockout'],
  function(ko,accUtils, Context, moduleUtils, KnockoutTemplateUtils, CoreRouter, ModuleRouterAdapter, KnockoutRouterAdapter, UrlPathAdapter, ResponsiveUtils, ResponsiveKnockoutUtils, ArrayDataProvider) {

     function ControllerViewModel() {
      this.KnockoutTemplateUtils = KnockoutTemplateUtils;

      
      // Handle announcements sent when pages change, for Accessibility.
      this.manner = ko.observable('polite');
      this.message = ko.observable();
      announcementHandler = (event) => {
          this.message(event.detail.message);
          this.manner(event.detail.manner);
      };

      document.getElementById('globalBody').addEventListener('announce', announcementHandler, false);


      // Media queries for responsive layouts
      const smQuery = ResponsiveUtils.getFrameworkQuery(ResponsiveUtils.FRAMEWORK_QUERY_KEY.SM_ONLY);
      this.smScreen = ResponsiveKnockoutUtils.createMediaQueryObservable(smQuery);
      const mdQuery = ResponsiveUtils.getFrameworkQuery(ResponsiveUtils.FRAMEWORK_QUERY_KEY.MD_UP);
      this.mdScreen = ResponsiveKnockoutUtils.createMediaQueryObservable(mdQuery);

       this.navData = ko.observableArray([
      { path: "", redirect: "login" },
      {
        path: "login",
        detail: { label: "Login", iconClass: "oj-ux-ico-enter" },
      },
      {
        path: "about",
        detail: { label: "About", iconClass: "oj-ux-ico-information-s" },
      }
    ]);
       this.setNavData = function(userType){
      if (userType==="admin") {
        this.navData(
        [
          { path: "", redirect: "inventory" },
          { path: "stock", detail: { label: "Stock", iconClass: "oj-ux-ico-box-grid" }},
          { path: "customers", detail: { label: "Customers", iconClass: "oj-ux-ico-contact-group" }},
          { path: "about", detail: { label: "About", iconClass: "oj-ux-ico-information-s" }}
        ]
      )
      } else {
        this.navData(
          [
            { path: "", redirect: "dashboard" },
            { path: "dashboard", detail: { label: "Dashboard", iconClass: "oj-ux-ico-dashboard" }},
            { path: "portfolio", detail: { label: "Portfolio", iconClass: "oj-ux-ico-coins-money" }},
            { path: "history", detail: { label: "History", iconClass: "oj-ux-ico-clock-history" }},
            { path: "about", detail: { label: "About", iconClass: "oj-ux-ico-information-s" }},
          ]
        )
      }
    }
       const allRoutes = [
        { path: "", redirect: "login" },
        { path: "login", detail: { label: "Login", iconClass: "oj-ux-ico-enter" } },
        { path: "dashboard", detail: { label: "Dashboard", iconClass: "oj-ux-ico-dashboard" } },
        { path: "portfolio", detail: { label: "Portfolio", iconClass: "oj-ux-ico-coins-money" } },
        { path: "history", detail: { label: "History", iconClass: "oj-ux-ico-clock-history" }},
        { path: "stock", detail: { label: "Stock", iconClass: "oj-ux-ico-box-grid" } },
        { path: "customers", detail: { label: "Customers", iconClass: "oj-ux-ico-contact-group" } },
        { path: "about", detail: { label: "About", iconClass: "oj-ux-ico-information-s" } }
        // ...any other possible routes
      ];
      // Router setup
      let router = new CoreRouter(allRoutes, {
        urlAdapter: new UrlPathAdapter()
      });
      this.router = router;
      
      this.setUserLogin = function (email) {
      this.userLogin(email);
      localStorage.setItem('user', email);
    };
      this.moduleAdapter = new ModuleRouterAdapter(router);

      this.selection = new KnockoutRouterAdapter(router);
      router.sync();
      this.signout= function(){
          localStorage.removeItem('user');
          this.userLogin("");
          this.navData([
          { path: "", redirect: "login" },
          {
            path: "login",
            detail: { label: "Login", iconClass: "oj-ux-ico-enter" },
          },
          {
            path: "about",
            detail: { label: "About", iconClass: "oj-ux-ico-information-s" },
          }
          ]);
          localStorage.removeItem('userType');

          this.router.go({path: 'login'});
    // Optionally clear sensitive observables
         
      }
      // Setup the navDataProvider with the routes, excluding the first redirected
      // route.
      this.navDataProvider = ko.pureComputed(() => {
    return new ArrayDataProvider(this.navData().slice(1), { keyAttributes: "path" });
  });

      // Drawer
      self.sideDrawerOn = ko.observable(false);

      // Close drawer on medium and larger screens
      this.mdScreen.subscribe(() => { self.sideDrawerOn(false) });

      // Called by navigation drawer toggle button and after selection of nav drawer item
      this.toggleDrawer = () => {
        self.sideDrawerOn(!self.sideDrawerOn());
      }

      // Header
      // Application Name used in Branding Area
      this.appName = ko.observable("Stock Manager");
      // User Info used in Global Navigation area
      var value = localStorage.getItem('user');
      console.log(value);
      this.userLogin = ko.observable(value);
      // Footer
      this.footerLinks = [
        {name: 'About Oracle', linkId: 'aboutOracle', linkTarget:'http://www.oracle.com/us/corporate/index.html#menu-about'},
        { name: "Contact Us", id: "contactUs", linkTarget: "http://www.oracle.com/us/corporate/contact/index.html" },
        { name: "Legal Notices", id: "legalNotices", linkTarget: "http://www.oracle.com/us/legal/index.html" },
        { name: "Terms Of Use", id: "termsOfUse", linkTarget: "http://www.oracle.com/us/legal/terms/index.html" },
        { name: "Your Privacy Rights", id: "yourPrivacyRights", linkTarget: "http://www.oracle.com/us/legal/privacy/index.html" },
      ];
       
    };
      self.connected = () => {
      console.log("params in login ViewModel:", params);
      
      accUtils.announce("Login page loaded.", "assertive");
      document.title = "Login";
     }
     // release the application bootstrap busy state
     Context.getPageContext().getBusyContext().applicationBootstrapComplete();

     return new ControllerViewModel();
  }
);
