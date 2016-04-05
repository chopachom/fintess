/**
 * Created by qweqwe on 06/01/15.
 */

'use strict';
require('source-map-support').install();

const _ = require('lodash');
const Promise = require('bluebird');
const chai = require('chai');
const expect = chai.expect;

const {Field, Form, Type, validators} = require('../index');
const {Email, String, Required} = validators;



// test are written using mocha-exports-ui interface, if you like it check it out:
// https://github.com/chopachom/mocha-exports-ui
module.exports = {
  const: {
    builder(){
      return function SomeValidator(options){
        options || (options = {});
        return function(context, data, next){
          const message = options.message || (field => `${field.name} is required`);
          if(!data) return Promise.reject(new Error(message(context.field), context));
          return next();
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
  'Validator(context, data, next)': {
    const: {
      validator(){
        return this.builder();
      },
      context(){
        return {
          field: {name: 'test'}
        }
      },
      next(){
        return () => {
          return Promise.resolve('next')
        }
      }
    },
    'is a function'(){
      expect(this.validator).to.be.a('function');
    },
    'arity = 2'(){
      expect(this.validator.length).to.be.eql(3);
    },
    'returns': {
      'a promise'(){
        expect(this.validator(this.context, 'value', this.next).then).to.be.a('function');
      }
    },
    'resolves to a value if validation passed'(){
      return this.validator(this.context, 'value', this.next).then(function(result){
        expect(result).to.be.eql('next');
      });
    },
    'rejected if validation failed'(){
      return this.validator(this.context, null, this.next).catch(function(err){
        expect(err).to.be.an('error');
      });
    }
  },
  'Type(label, validators)': {
    const: {
      type: function(){
        return Type('String', [String, Required, function(context, data, next){
          return next(data+'-transformed');
        }, function(context, data, next){
          return next(data+'-last')
        }])
      },
      context: function(){
        return {
          field: {
            name: 'test-field',
            data: 'text'
          }
        }
      }
    },
    '#validate(form, field)': {
      'returns a promise'(){
        expect(this.type.validate(this.context).then).to.be.a('function');
      },
      'resolves with': {
        'if validation passed': {
          'transformed field data'(){
            return this.type.validate(this.context).then(function(data){
              expect(data).to.be.eql('text-transformed-last');
            })
          }
        },
        'if one of the validators failed': {
          'Error'(){
            const context = _.set(_.cloneDeep(this.context), 'field.data', '');
            return this.type.validate(context).catch(function(error){
              expect(error.message).to.contain('required');
            })
          }
        }
        // 'if N validators failed':{
        //   'Array<Error>.length === N'(){
        //     const context = _.set(_.cloneDeep(this.context), 'field.data', '');
        //     return this.type.validate(context).then(function(errors){
        //       expect(errors).to.have.length(2);
        //     })
        //   }
        // }
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
        expect(this.field.type).to.have.a.property('label', 'Email');
        expect(this.field.type.validate).to.have.a.property('length', 1);
      }
    },
    '#validate(formContext)':{
      const: {
        invalidField: function(){
          return Field('email', this.type, 'afsfas');
        }
      },
      'returns error if any of the Type validators failed'(){
        return this.invalidField.validate({}).catch(function(error){
          expect(error.message).to.be.eql('Email must be an email');
        });
      }
    }
  },
  '!Form': {
    const: {
      Form(){
        const transform = (ctx, data, next) => next(data+'-transformed');
        return Form({
          email: Type('Email', [Required, String, Email, transform]),
          nickname: Type('Nickname', [Required, String, transform]),
          password: Type('Password', [Required, String])
        })
      },
      validForm(){
        return this.Form({email: 'john@doe.com', nickname: 'john', password: 'qwerty'})
      },
      invalidForm(){
        return this.Form({email: 'err?', nickname: '', password: 'qweqwe'})
      }
    },
    '#validate(data)': {
      'if data is valid': {
        'resolved with transformed data'(){
          return this.validForm.validate().then((data) => {
            return expect(data).to.be.eql({
              email: 'john@doe.com-transformed',
              nickname: 'john-transformed',
              password: 'qwerty'
            })
          })
        }
      },
      'if data is invalid': {
        'rejected with array of errors'(){
          return this.invalidForm.validate().catch((error) => {
            expect(error.errors.length).to.be.eql(2);
          });
        },
        'contains an error for each failed validator'(){
          return this.invalidForm.validate().catch((error) => {
            expect(error.errors[0].message).to.contain('email');
            expect(error.errors[1].message).to.contain('Nickname is required');
          });
        }
      }
    }
  }
};
