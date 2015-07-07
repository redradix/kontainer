# Simple DI / IoC container

This is a really simple dependecy injection container for using in Javascript applications (both nodejs/iojs and browser environments). No external dependencies but it uses `Array.prototype.forEach` so please polyfill as needed.

# API

This container works in a very simple way: you **register** modules/services with dependencies, and then can retrieve/start/stop each of them, or all at once.

## Registering modules

* container.registerModule()

## Obtaining modules

## Start / stop hooks

## Other methods
