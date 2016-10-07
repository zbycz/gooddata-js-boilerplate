# Boilerplate info

After creating copy, replace the following placeholders:

- GDC_APP_NAME (eg. 'Indigo Analytical Designer')
- GDC_APP_PATH (eg. 'analyze')
- GDC_APP_GA_PAGE (eg. 'insights')
- GDC_REPO_NAME (eg. 'gdc-analytical-designer')

# GDC_APP_NAME

## Our Values

 * Customer Obsession
 * Excellence
 * Innovation
 * Transparency
 * Ownership
 * Our GoodData Family

## Setup

Install [Node.js](http://nodejs.org). MacOS users should install [Homebrew](http://brew.sh/) first and then run:
```
$ brew install git
$ brew install node
$ npm install -g grunt-cli
```

Get the dependecies with:
```
$ npm install
```

#### Supported versions:
![supported versions](http://client-demo.na.intgdc.com:50480/badge?repo=GDC_REPO_NAME)

## Develop
Run the app with ```grunt dev```

To run the standard application, open **https://localhost:8443/GDC_APP_PATH/** in your favorite browser.

In each case a development proxy will be started, which allows the app to communicate
with [secure.gooddata.com](https://secure.gooddata.com).

#### Options:

- `--host` or `--backend` defaults to `secure.gooddata.com` and specifies which backend to proxy HTTP requests to.
- `--port` defaults to `8443` and specifies which local port number will be used.
- `--public` defaults to false and enables remote access to development build.

Grunt will watch for changes in packages, pre-compile CSS, pre-compile handlebars templates.

Optionaly you can to install terminal-notifier to get notified about build status.
The easy way is to use Homebrew:

```shell
brew install terminal-notifier
```

## Test
For unit tests run ```grunt test```

## Deploy
Build the application with ```grunt dist```.

This will build production version into **dist/**.

## License
Copyright (C) 2007-2016, GoodData(R) Corporation. All rights reserved.
