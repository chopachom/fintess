/**
 * Created by qweqwe on 06/01/15.
 */
'use strict';
const Promise = require('bluebird');

function isError(err){
  return err instanceof Error;
}

function ensureValidator(fn){
  debugger;
  // This is ValidatorBuilder
  if(fn.length < 2) return fn();
  return fn;
}

function next(context, data, validators) {
  const validator = ensureValidator(validators[0]);
  return validator(context, data, function(data){
    const tail = validators.slice(1);
    if(tail.length === 0) return Promise.resolve(data);
    return next(context, data, tail);
  });
}

function Type(label, validators){
  return {
    validators,
    label,
    validate(context){
      return next(context, context.field.data, this.validators);
    }
  }
}

function Field(name, type, data){
  return {
    name,
    type,
    data,
    validate(formContext){
      return type.validate(FieldContext(formContext, this));
    }
  };
}

function FormContext(form){
  return {
    fields: Object.keys(form.fields).map(name => {
      const field = form.fields[name];
      return {
        [name]: {
          name: field.name,
          data:field.data,
          type: {
            label: field.type.label
          }
        }
      }
    })
  }
}

function FieldContext(formContext, field){
  return Object.assign({}, formContext, {
    field: {
      name: field.name,
      data:field.data,
      type: {
        label: field.type.label
      }
    }
  });
}


function FormFactory(schema){
  return function ConcreteForm(data) {
    const fields = Object.keys(schema).reduce((acc, name) => {
      const type = schema[name];
      const fieldData = data[name];
      return Object.assign(acc, {[name]: Field(name, type, fieldData)});
    }, {});

    return {
      fields,
      data,
      validate(){
        const names = Object.keys(this.fields);
        // iterating over fields getting their validation results to a new object
        return Promise.reduce(names, (acc, name) => {
          const field = this.fields[name];
          return field.validate(this.context()).then((data) => {
            return Object.assign(acc, {[name]: data});
          });
        }, {});
      },
      context(){
        return FormContext(this);
      }
    }
  }
}
const Required = (options = {}) => {
  // TODO: default value
  return (context, data, next) => {
    const message = options.message || (field => `${field.name} is required`);
    const empty = ['', null, undefined].indexOf(data) > -1;
    if(empty) return Promise.reject(new Error(message(context.field)));
    return next(data);
  }
};

const String = (options = {}) => {
  const trim = (data) => {
    return options.trim ? data.trim() : data;
  };
  return (context, data, next) => {
    const message = options.message || (field => `${field.name} must be a string`);
    if(typeof data !== 'string'){
      return Promise.reject(new Error(message(context.field)));
    }
    return next(trim(data));
  };
};

const Email = (options = {}) => {
  return (context, data, next) => {
    // should have access to label
    const label = context.field.type.label || context.field.name;
    const message = options.message || (() => `${label} must be an email`);
    if(/(^[^ ]+@[^ ].+$)/.test(data) === false){
      return Promise.reject(new Error(message(context)));
    }
    return next(data);
  };
};

module.exports = {
  Field,
  Form: FormFactory,
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