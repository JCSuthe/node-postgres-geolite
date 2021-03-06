# node-postgres-geolite [![npm version](https://badge.fury.io/js/postgres-geolite.svg)](https://badge.fury.io/js/postgres-geolite) [![Build Status](https://travis-ci.org/zikeji/node-postgres-geolite.svg?branch=master)](https://travis-ci.org/zikeji/node-postgres-geolite)

MaxMind Geolite PostgreSQL importer & interface to provide IPv4 and IPv6 lookups for country, subdivisions, city, timezone, area code, ISP, etc. This module is designed to import the GeoIP2 and Geolite Legacy database CSVs into a PostgreSQL database and query it efficiently and effectively.

#### Apologies

I had originally wanted to return the data similar to the [node-maxmind](https://github.com/runk/node-maxmind) project, thus allowing this module to server as a drop-in replacement. Unfortunately I was unable to figure out how to best map the geoname ID data in the database to allow for geoname_ids on each location type (continent, country, subdivisions, city). If you are able to do this, feel free to fork and submit a PR. Otherwise if you have ideas on doing this feel free to contact me to discuss.

## Table of Contents

- [Requirements](#requirements)
- [Install](#install)
- [Usage](#usage)
- [API](#api)
  - [geolite.init(options)](#geoliteinitoptions)
  - [geoliteDB.update()](#geolitedbupdate)
  - [geoliteDB.get(ip)](#geolitedbgetip)
- [Performance](#performance)
  - [Initializing & updating the database](#initializing--updating-the-database)
  - [Queries](#queries)
- [License](#license)

## Requirements

- 1GB RAM
  - This is the for the build process only, if you plan on building & updating a different machine you can still utilize this on a machine with less RAM.
- PostgreSQL >= 9.4

## Install
```
$ npm install --save postgres-geolite
```

## Usage

**TODO**

## API

### `geolite.init(options)`

Checks whether the database in PostgreSQL has been initialized, and validates the schema with the current version of this module. If the database is ready, it returns the geoliteDB object in the promise. Otherwise, it updates the PostgreSQL database using the options provided.

#### Object: `options`

If the options provided don't get properly validated by [Joi](https://github.com/hapijs/joi), then an error is returned and can be caught via the reject promise. Validation schema can be found [here](https://github.com/zikeji/node-postgres-geolite/blob/master/lib/configvalidator/index.js).

```javascript
{
  database: object,
  downloads: object,
}
```

##### Object: `database`

Takes the [configuration object](https://github.com/vitaly-t/pg-promise/wiki/Connection-Syntax#configuration-object) from [pg-promise](https://github.com/vitaly-t/pg-promise) with most of the properties.

##### Object: `downloads`

- **(string)** `location`: relative or absolute path to where the GeoLite databases get downloaded (if `local` is false) and decompressed to.
  - **default**: `'./tmp'`
- **(boolean)** `cleanup`: the location folder above will be created if it doesn't exist, if cleanup is set to true it will delete the location folder once it is no longer necessary.
  - **default**: `false`
- **(boolean)** `local`: if set to true, the resources below are interpreted as filepaths and decompressed to the location specified above.
  - **default**: `false`
- **(object)** `resources`
  - **(string)** `geolite2_city`: direct download link or filepath for the GeoLite2 City database in CSV format, zipped.
    - https://dev.maxmind.com/geoip/geoip2/geolite2/
  - **(string)** `geolite_asn`: direct download link or filepath for the GeoLite ASN database in CSV / zip format.
  - **(string)** `geolite_asn_ipv6`: direct download link or filepath for the GeoLite ASN database in CSV / zip format.
    - https://dev.maxmind.com/geoip/legacy/geolite/

#### Returns: `Promise (geoliteDB)`

Promise that contains the object used for all future API calls.

### `geoliteDB.update()`

Forces an update on the PostgreSQL database using the options provided in `geolite.init`.

#### Returns: `Promise ()`

Resolves when finished, if any error occurs it rejects.

### `geoliteDB.get(ip)`

Gets all the information available on the provided IP.

#### String: `ip`

The IPv4 address or IPv6 address you are querying, as a string.

#### Returns: `Promise (result)`

The resulting lookup data from you query.

##### Example

```json
{
  "city":{
    "names":{
      "de":"Mountain View",
      "en":"Mountain View",
      "fr":"Mountain View",
      "ja":"マウンテンビュー",
      "ru":"Маунтин-Вью",
      "zh-CN":"芒廷维尤"
    }
  },
  "continent":{
    "code":"NA",
    "names":{
      "de":"Nordamerika",
      "en":"North America",
      "es":"Norteamérica",
      "fr":"Amérique du Nord",
      "ja":"北アメリカ",
      "pt-BR":"América do Norte",
      "ru":"Северная Америка",
      "zh-CN":"北美洲"
    }
  },
  "country":{
    "iso_code":"US",
    "names":{
      "de":"USA",
      "en":"United States",
      "es":"Estados Unidos",
      "fr":"États-Unis",
      "ja":"アメリカ合衆国",
      "pt-BR":"Estados Unidos",
      "ru":"США",
      "zh-CN":"美国"
    }
  },
  "isp":{
    "asn":"AS15169",
    "org":"Google Inc."
  },
  "location":{
    "latitude":"37.386",
    "longitude":"-122.0838",
    "time_zone":"America/Los_Angeles"
  },
  "postal":{
    "code":"94035"
  },
  "registered_country":{
    "iso_code":"US",
    "names":{
      "de":"USA",
      "en":"United States",
      "es":"Estados Unidos",
      "fr":"États-Unis",
      "ja":"アメリカ合衆国",
      "pt-BR":"Estados Unidos",
      "ru":"США",
      "zh-CN":"美国"
    }
  },
  "subdivisions":[
    {
      "iso_code":"CA",
      "names":{
        "de":"Kalifornien",
        "en":"California",
        "es":"California",
        "fr":"Californie",
        "ja":"カリフォルニア州",
        "pt-BR":"Califórnia",
        "ru":"Калифорния",
        "zh-CN":"加利福尼亚州"
      }
    }
  ]
}
```

## Performance

If you clone the repo and run the tests on your target system you should get a good idea of expected performance from the test results.

### Initializing & updating the database

- **System:** Intel Core i5 6600K running Windows 10 with the PostgreSQL DB on a SATA 6Gbps SSD
  - **Result:** (complete imports incomplete, no result available at this time)

Building gets done on secondary tables, and when complete the original table gets dropped and replaced with the new one. This is what I considered the best approach for minimizing potential downtime during an update.

You can also refer to the tests on Travis-CI for performance.

### Queries

Thanks to the built in operator class GiST [inet_ops](https://www.postgresql.org/docs/current/static/gist-builtin-opclasses.html), queries take ~30ms on my test system. The test cases ran on Travis-CI can also give you an idea of expected performance on systems with their infrastructure.

## License

MIT © [Caleb Blankemeyer](https://github.com/zikeji)

While I'm not technically including the data, I'm including the licensing disclaimers as per [GeoLite Documentation](https://dev.maxmind.com/geoip/legacy/geolite/) & [GeoLite 2 Documentation](https://dev.maxmind.com/geoip/geoip2/geolite2/)

>This product includes GeoLite2 data created by MaxMind, available from [http://www.maxmind.com](http://www.maxmind.com).

>This product includes GeoLite data created by MaxMind, available from [http://www.maxmind.com](http://www.maxmind.com).
## Support on Beerpay
Hey dude! Help me out for a couple of :beers:!

[![Beerpay](https://beerpay.io/zikeji/node-postgres-geolite/badge.svg?style=beer-square)](https://beerpay.io/zikeji/node-postgres-geolite)  [![Beerpay](https://beerpay.io/zikeji/node-postgres-geolite/make-wish.svg?style=flat-square)](https://beerpay.io/zikeji/node-postgres-geolite?focus=wish)