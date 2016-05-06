# Funcy Azure - The Azure Functions Application Framework
[![npm version](https://badge.fury.io/js/funcy-azure.svg)](https://badge.fury.io/js/funcy-azure)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg?maxAge=2592000)]()

Funcy Azure is the application framework for building web, 
mobile, IoT and event-based applications on [Azure Functions](https://functions.azure.com). 
It is a command line interface that helps you structure, build and test
Azure Functions based applications. Functionality is also extensible via Plugins.

##Features
* Run/test Azure Functions locally on your machine
* Project scaffolding
* Function scaffolding
* 100% extensible - Extend the framework and its operations via plugins. 

##Getting started
Install the Funcy Azure framework via npm: (requires Node V4)
```
npm install funcy-azure -g
```
Create a new project (or type `--help` for available options)
```
faz project create --name MyNewProject
```
And add a new http triggered function (or type `--help` for available options)
```
cd MyNewProject
faz function create --name MyFunction --event http
```
Run and test locally on your machine (or type `--help` for available options)
```
faz function run --file MyFunction/index.js
```
To get an overview of all available commands and options simply type `funcy-azure --help`

##Notes
* This project is in a very early state so please expect a lot of (breaking) changes and additional features in the near future. 
* Azure Function App creation still needs to be done manually through the portal. We are
working on it, though, to integrate this functionality as well.