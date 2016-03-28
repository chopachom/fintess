/**
 * Created by qweqwe on 06/01/15.
 */
'use strict';

var Promise = require('bluebird');

//
// function FormBuilder(spec){
//   this.spec = spec;
//
// }
//
//
// function Form(data){
//   this.data = data;
// }
//
// Form.prototype.validate = function(){
//   Object.keys(this.spec).forEach(function(field){
//     var promises = this.spec[field].map(function(validator){
//       validator
//     })
//   })
// };


function ensureValidator(fn){
  // This is ValidatorBuilder
  if(fn.length < 2) return fn();
  return fn;
}

function Type(label, validators){
  return {
    label,
    validate(form, field){
      // we can call field.validate() from here, why?????
      return Promise.map(validators, (validator) => {
        validator = ensureValidator(validator);
        return validator(form, field);
      }).then(function(results){
        // compact the results
        return results.filter(r => !!r);
      });
    }
  }
}

function Field(name, type, data){
  return {
    name,
    type,
    data,
    validate(form){
      // type.validate(_, Field{validate:(Type:{validate: field{})} // not good 
      return type.validate(form, this);
    }
  };
}

function Form(fieldsSpec){
  const fields = fieldsSpec.map(() => {});
  return function ConcreteForm(data) {
    return {
      fields,
      data,
      validate(){
        // return Promise.map(validators, (validator) => {
        //   validator = ensureValidator(validator);
        //   return validator(form, field);
        // })
      },
      convert(){
      }
    }
  }
}

const Required = (options = {}) => {
  return (form, field) => {
    const message = options.message || (field => `${field.name} is required`);
    const empty = ['', null, undefined].indexOf(field.data) > -1;
    let res = undefined;
    if(empty) res = new Error(message(field));
    return Promise.resolve(res);
  }
};

const String = (options = {}) => {
  return (form, field) => {
    const message = options.message || (field => `${field.name} must be a string`);
    if(typeof field.data !== 'string'){
      return Promise.resolve(new Error(message(field)));
    }
    return Promise.resolve();
  };
};

const Email = (options = {}) => {
  return (form, field) => {
    // should have access to label
    const ctx = {options, form, field};
    const label = field.type.label || field.name;
    const message = options.message || (field => `${label} must be an email`);
    if(/(^[^ ]+@[^ ].+$)/.test(field.data) === false){
      return Promise.resolve(new Error(message(ctx)));
    }
    return Promise.resolve();
  };
};

module.exports = {
  Field,
  Form,
  Type,
  validators: {
    Email,
    String,
    Required
  }
};


/*

TODO:
      - must deal with ability to call form.validate, field.validate, type.validate from type validators
        not sure if this is a legit problem but it makes me feel that API is kind of wrong

 */