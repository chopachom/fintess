/**
 * Created by qweqwe on 05/04/16.
 */

'use strict';
require('source-map-support').install();

const Promise = require('bluebird');
const chai = require('chai');
const expect = chai.expect;

const {Field, Form, Type, validators} = require('../index');
const {Email, String, Required, List} = validators;


module.exports = {
  'List(validators: Array<Validators>)': {
    const: {
      listType(){
        return Type('label', [List([String])]);
      },
      context(){
        return {
          field: {
            name: 'test-field',
            data: ['text', 1, null],
            type: {
              label: 'A list of tags'
            }
          }
        }
      }
    },
    'rejected when any of the `validators` are rejected for any of the elements'(){
      return this.listType.validate(this.context);
    }
  }
};