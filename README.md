__fitness__ is a node.js library that helps with validation and transformation of your API's incoming data by defining a scheme for your data which is usually known as a _form_

The base form usage can be described in the few lines of code:

```javascript
const {Form, Type, validators, ValidationError} = require('fitness');
const {Required, String, Email} = validators;
const LoginForm = Form({
  email: Type('Email', [Required, String({trim: true}), Email]),
  password: Type('Password', [Required, String])
});

// using the form
// data is plain object like for example {email: ' john@doe.com', pasword:'qwerty'}
// note the leading space in the email address, fitness will remove it in the validation result
// because string validator was called with `trim` option: `String({trim: true})` 
const data = {...}
form(data).validate().then(data => {
  // if the form validation succeeds we will get valid and tranformed data here   
  console.log(data);	
}).catch(e => {
  // and if the validation fails we'll get a special error object that contains all errors
  // for failed validations    
  if(!e instance of ValidationError) return Promise.reject(e);  
  console.log(e.errors);	
});
```