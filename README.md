# Funcy Azure
[![npm version](https://badge.fury.io/js/funcy-azure.svg)](https://badge.fury.io/js/funcy-azure)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg?maxAge=2592000)]()

![alt text](https://azurenewsexplorer.blob.core.windows.net/funcyazure/funcyazure-logo.png)

Funcy Azure is the application framework for building web, 
mobile, IoT and event-based applications exclusively on [Azure Functions](https://functions.azure.com). 
It is a command line interface that helps you structure, build, test, provision and deploy 
applications built with Azure Functions. Functionality is also extensible via Plugins.

##Features
* Run and test Azure Functions (Node.js) locally on your machine
* Automated provisioning of your project resources to Azure
* Configurable continuous integration support with Git
* Automatic installation of your Node packages (as defined in package.json) upon deployment   
* Project scaffolding
* Function scaffolding
* 100% extensible - Extend the framework and its operations via plugins. 

##Documentation
Please see [https://funcy-azure.readme.io/](https://funcy-azure.readme.io/) for detailed documentation and tutorials.

##Quickstart
Install the Funcy Azure framework via npm: (requires Node V4)
```
npm install funcy-azure -g
```
Create a new project (type `--help` for available options)
```
faz project create --name MyNewProject
```
Add a new http triggered function (type `--help` for available options)
```
cd MyNewProject
faz function create --name MyFunction --event http
```
Run and test locally on your machine (type `--help` for available options)
```
faz function run --file MyFunction/index.js
```
Provisioning of resources to Azure (type --help for available options)
```
faz project provision 
```
To get an overview of all available commands and options simply type `faz --help`

##Links
* [Documentation](https://funcy-azure.readme.io/)
* [Twitter](https://twitter.com/FuncyAzure)

##Notes
* This project is in a very early state so please expect a lot of (breaking) changes and additional features in the near future.