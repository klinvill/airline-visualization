// @deprecated: No longer used since I replaced requireJS with escript2015 import and export functionality using babel and webpack

// var allTestFiles = [];
// var TEST_REGEXP = /(spec|test)_.*\.js$/i;

// // Get a list of all the test files to include
// Object.keys(window.__karma__.files).forEach(function(file) {
//   if (TEST_REGEXP.test(file)) {
//     // Normalize paths to RequireJS module names.
//     // If you require sub-dependencies of test files to be loaded as-is (requiring file extension)
//     // then do not normalize the paths
//     var normalizedTestModule = file.replace(/^\/base\/scripts\/src\/|\.js$/g, '.js');
//     allTestFiles.push(normalizedTestModule);
//   }
// });

// require.config({
//   // Karma serves files under /base, which is the basePath from your config file
//   baseUrl: '/base/scripts/src',

//   paths: {
//     'd3': '../../node_modules/d3/d3'
//   },

//   // dynamically load all test files
//   deps: allTestFiles,

//   // we have to kickoff jasmine, as it is asynchronous
//   callback: window.__karma__.start
// });
