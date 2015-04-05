# angular_slideInput.js
angular version of an awesome input field

1. add slideInput.js, slideInput.sass (or .css)
2. add https://ajax.googleapis.com/ajax/libs/angularjs/x.y.z/angular-animate.js
3. add module dependency 'slideInput'
4. add directive
```html
<slide-input ng-model="requiredField" button="submit"></slide-input>
```
or you can add more custom things (you don't really need button, but it doesn't really make sense without it)
```html
<slide-input ng-model="requiredField" button="submit" focus="true"></slide-input>
```
