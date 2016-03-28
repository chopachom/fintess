/**
 * Created by qweqwe on 06/01/15.
 */

'use strict';
require('source-map-support').install();

const Promise = require('bluebird');
const chai = require('chai');
const expect = chai.expect;
var FormBuilder;
const Validator = () => {};


const {Field, Type, validators} = require('../index');
const {Email, String, Required} = validators;


const Length = (options) => {
  options || (options = {});
  return (form, field) => {
    // should have access to label
    if(/(^[^ ]+@[^ ].+$)/.test(field.data) === false){
      return Promise.resolve((form, field) => {
        const ctx = {options, form, field};
        const label = type.label || field.name;
        const message = options.message || (() => `${label} must be an email`);
        return message(ctx)
      });
    }
    return Promise.resolve();
  };
};

const Range = () => {};

const ValidationError = Error;

const UserModel = {};
const ModelAdapter = () => {};



function StringType(label, validators){
  return function(name){
    return new Field(name, label, [String].concat(validators))
  }
}


module.exports = {
  '- possible usages'(){
    /*
    var UsernameLoginForm = function(){
      FormBuilder({

      }).apply(this);
      var _this = LoginForm.apply(this, arguments);
    };

    UsernameLoginForm.prototype = Object.create(LoginForm.prototype);
    UsernameLoginForm.prototype.constructor = UsernameLoginForm;
    */
    const LoginForm = FormBuilder({
      email: new Type([String, Required, Length({min: 3, max: 128}), Email]),
      age: new Type([Integer, Range({min: 18, max: 60})]),
      experience: new Type('Work experience', [
        Integer,
        // options{options, form, field, type}
        Range({
          min: 1,
          max: 60,
          // Your work experience is out of range
          // how we prevent context.form.validate()?
          message: (context) => `Your ${context.type.label.toLowerCase()} is out of range`
        }),
        // custom validation
        function(form, field){
          if(field.data){
            
          }
        }
      ])
    });

    Object.assign(LoginForm.prototype, {
      *save(){
        const data = this.transform
      },
      *transformer(data){
          
      }
    });
    
    const UserForm = ModelAdapter(FormBuilder, UserModel);

    const ModelForm = FormBuilder((builder) => {
      builder.fields({

      });
      const clazz = builder.build();
      Object.assign(clazz.prototype, {
        *transformer(){

        }
      })
    });

    const form = new LoginForm({email: 'john.doe@gmail.com', age:25});
    // const data = yield* form.transform();

  },
  const: {
    builder(){
      return function SomeValidator(options){
        options || (options = {});
        return function(form, field){
          const message = options.message || (field => `${field.name} is required`);
          if(!field.data) return Promise.resolve(new ValidationError(message(field), field));
          return Promise.resolve();
        }
      };
    }
  },
  'ValidatorBuilder(options)': {
    const: {
      subject(){
        return this.builder;
      }
    },
    'is a function'(){
      expect(this.subject).to.be.a('function');
    },
    'arity = 1'(){
      expect(this.subject.length).to.be.eql(1);
    },
    'returns': {
      const:{
        result(){return this.subject()}
      },
      'function'(){
        expect(this.result).to.be.a('function');
      },
      'arity = 2'(){
        expect(this.result.length).to.be.eql(2);
      }
    }
  },
  'Validator(form, field)': {
    const: {
      validator(){
        return this.builder();
      }
    },
    'is a function'(){
      expect(this.validator).to.be.a('function');
    },
    'arity = 2'(){
      expect(this.validator.length).to.be.eql(2);
    },
    'returns': {
      'a promise'(){
        expect(this.validator(/*form*/null, {data: 'value'}).then).to.be.a('function');
      },
      'resolves to': {
        'undefined if validation passed'(){
          return this.validator(/*form*/null, {data: 'value'}).then(function(result){
            expect(result).to.be.eql(undefined);
          });
        },
        'an error if validation failed'(){
          return this.validator(/*form*/null, {data: null}).then(function(err){
            expect(err).to.be.an('error');
          });
        }
      }
    }
  },
  'Type(label, validators)': {
    const: {
      type: function(){
        return Type('String', [String, Required])
      },
      form: function(){
        return {}
      },
      field: function(){
        return {name: 'username', data: ''};
      }
    },
    '#validate(form, field)': {
      'returns a promise'(){
        expect(this.type.validate(this.form, this.field).then).to.be.a('function');
      },
      'resolves with': {
        'if one of the validators failed': {
          'Array<Error>'(){
            return this.type.validate(this.form, this.field).then(function(errors){
              expect(errors).to.have.length(1);
              expect(errors[0].message).to.contain('required');
            })
          }
        },
        'if N validators failed':{
          'Array<Error>.length === N'(){
            return this.type.validate(this.form, {name: 'user', data: undefined}).then(function(errors){
              expect(errors).to.have.length(2);
            })
          }
        }
      }
    }
  },
  'Field(name, type, value)': {
    const: {
      type(){
        return Type('Email', [String, Email, Required]);
      },
      field(){
        return Field('email', this.type, 'john@doe.com');
      }
    },
    '#name': {
      'contains field name'(){
        expect(this.field).have.property('name', 'email');
      }
    },
    '#data': {
      'contains field data'(){
        expect(this.field.data).to.be.eql('john@doe.com');
      }
    },
    '#type': {
      'contains field type'(){
        // TODO: more strict duck type check for Type
        expect(this.field.type.validate).to.have.a.property('length', 2);
      }
    },
    '#validate(form)':{
      const: {
        invalidField: function(){
          return Field('email', this.type, 'afsfas');
        }
      },
      'returns false if any of the Type validators failed'(){
        return this.invalidField.validate({}).then(function(errors){
          expect(errors).to.have.length(1);
        });
      }
    }
  },
  'Form': {
    '(fields: Object)': {
      'creates form with the fields': false
    },
    '(label: String, fields: Object)': {
      'assigns label to field': false
    },
    '#fields': {
      'is a map': false
    },
    '#validate()': {
      'runs each validator for each field': false
    }
  }
};

/*
 TODO: add possibility to not only hydrate data using Form#transform() but also dehydrate it using some other method
       this may become useful for APIs that have input and output data of the same type
       #convert(), #revert/invert(); #transform(), #conform()/retransform(); #dehydrate(), #hydrate();

  TODO: how to specify default value?

  TODO: names for the library postform, formate,
        sculptor - deals with forms, but unfortunately taken
        fitness - controlling your forms or controlling your objects shape
        hydra - hydrate and dehydrate

  TODO: how to access req context in the validation logic?
        there propably should be a way to do this, if you want to access some data just pass it to the form
*/