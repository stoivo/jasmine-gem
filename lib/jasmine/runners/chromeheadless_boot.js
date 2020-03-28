(function(){
  function objectForEach(object, fn) {
    Object.keys(object).forEach(key => {
      fn(object[key],key, object)
    })
  }
  var stringConstructor = ("").constructor;
  var numberConstructor = (1).constructor;
  var boolenConstructor = (false).constructor;
  var dateConstructor = (new Date).constructor;
  var arrayConstructor = [].constructor;
  var objectConstructor = ({}).constructor;
  var documentConstructor = document.constructor

  function remove_nonestringyfy_elements(object) {
    objectForEach(object, (value, key, obj) => {
      if (
        value === undefined ||
        value === null ||
        value.constructor === stringConstructor ||
        value.constructor === numberConstructor ||
        value.constructor === boolenConstructor ||
        value.constructor === dateConstructor
        ){
      } else if (value.constructor === documentConstructor ){
        object[key] = "document reference";
      } else if (
        value.constructor === objectConstructor ||
        value.constructor === arrayConstructor
      ){
        remove_nonestringyfy_elements(value)
      } else {
        // we don't know what type it is so copy all of its' properties
        // test like this would try to forward the document which is circular
        //
        // it('crash spec', function(){
        //   expect(document).toHaveLength(undefined);
        // })

        var newObj = {};
        objectForEach(value, (innerValue, innerKey, obj) => {
          newObj[innerKey] = innerValue
        });
        object[key] = remove_nonestringyfy_elements(newObj);
      }
    })

    return object;
  }

  function json_stringify_result(object){
    try {
      return JSON.stringify([].concat(object));
    }
    catch(error) {
      return JSON.stringify([].concat(remove_nonestringyfy_elements(object)));
    }
  }

  function ChromeHeadlessReporter() {
    this.jasmineDone = function(details) {
      console.log('jasmine_done', JSON.stringify(details));
    };

    this.specDone = function(results) {
      console.log('jasmine_spec_result', json_stringify_result(results));
    };

    this.suiteDone = function(results) {
      console.log('jasmine_suite_result',json_stringify_result(results));
    };
  }
  jasmine.getEnv().addReporter(new ChromeHeadlessReporter());
})()
