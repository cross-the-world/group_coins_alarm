# Client

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.x.x.


## Update
   
View: https://update.angular.io/


## Build

**Commit** 

1. npm install
2. npm audit fix
3. changes updating to `package*.json` 


### Local Build

1. Run `npm install` to update or install the corresponding modules, libraries using for the app.

2. Run `npm update` and `npm audit fix` to upgrade and validate the package versions.

3. Run `ng build` to build the project. The build artifacts will be stored in the `../public/` directory. 
Use the `--prod` flag for a production build and `--configuration=en` for english version (ref. to `./Dockerfile`). 

4. Review the client (doing Tests if available) before committing the changes.


### Development

1. Run `npm run extract-i18n` to update the default translation file of `angular` under `src/message.xlf`
Then, compare and update the another translation files under `src/locale`.

2. Run `node ./build/build-pre.js to generate ` app.config.ts ` to `src/environments/`. 

3. Run `ng build --prod` to build the german version to `../public/backend-client`. Short step: `npm run-script build_de`.

5. Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files. Short step: `npm run-script start`.

Step 2 - 5 can be done with `npm run start`. When the local build works well, the changes can be committed to `master` branch.


## Code scaffolding

Run `ng generate component component-name` to generate a new component. 
You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

For most applications 'Remove deprecated RxJS 6 features' will mean running the following two commands:
```linux
npm install -g rxjs-tslint
rxjs-5-to-6-migrate -p src/tsconfig.app.json
```


## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io). (NOT WORKING)


## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/). (NOT WORKING)


## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

