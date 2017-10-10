# Boilerplate info
> GoodData SBA starter project

## Setup

Install [Node.js](http://nodejs.org). MacOS users should install [Homebrew](http://brew.sh/) first and then run:
```
$ brew install git
$ brew install node
$ brew install yarn
$ npm install -g grunt-cli
```

Get the dependecies with:
```
$ yarn install --pure-lockfile
```

## Develop
Run the app with ```grunt dev```

To run the standard application, open **https://localhost:8443/app/** in your favorite browser.

In each case a development proxy will be started, which allows the app to communicate
with [secure.gooddata.com](https://secure.gooddata.com).

#### Options:

- `--host` or `--backend` defaults to `secure.gooddata.com` and specifies which backend to proxy HTTP requests to.
- `--port` defaults to `8443` and specifies which local port number will be used.
- `--public` defaults to false and enables remote access to development build.

## Test
For unit tests run ```yarn test```

## Deploy
Build the application with ```grunt dist```.

This will build production version into **dist/**.

## Contributing
Report bugs and features on our [issues page](https://github.com/gooddata/gooddata-js-boilerplate/issues).

## License
Copyright (C) 2007-2017, GoodData(R) Corporation. All rights reserved.

For more information, please see [LICENSE](https://github.com/gooddata/gooddata-js-boilerplate/blob/master/LICENSE)
