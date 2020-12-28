# SDP Visualization

SDP Failure Map is ~.
> Please fill this 
> box ... 

#### It contains ... 
  - blah
  - blahblah
  - blahblahblah

# Features
  - Retreive data from JSON API
  - Interactive filters
  - Multiple select dropdown
  - Pop-up bind marker

You can also:
  - Search data on Searchbar 

### Fix / Update 

**201128**
> map.js > load_data(), each_data()
속도 개선을 위해 load_data() , each_data() function 분리 
=> 데이터를 불러와서 Localstorage 에 저장하도록 함.

**201222**
> Changed a json format of data into geojson format

**201225**
> Filtering function implemented with Select2 & rangeSlider on filter bar

**201226**
> Disable Mouse dragging or zooming when mouse is over the filter bar
> Added a loading page before the map, map data is loaded

**201226**
> added optgroup elements to region / sector for clarifying the child options

**201227**
> added a filter clear button (using Select2, ionRangeSlider module)
> Search Control added ** let marker open its own popup when searched **
> added an Easybutton to get back to the initial setView


### Tech

SDP Failure Map uses a number of open source projects to work properly:

| Plugin | README |
| ------ | ------ |
|jQuery 3.5.1|https://github.com/jquery/jquery|
|Leaflet 1.7.1|http://leafletjs.com|
| Select2 ~4.0| https://select2.org/ |
| rangeSlider | https://skinnynpale.github.io/rangeSlider.js/ |
| leaflet.awesome-markers 2.0.5 | https://github.com/lvoogdt/Leaflet.awesome-markers |
|L.EasyButton|https://github.com/CliffCloud/Leaflet.EasyButton|

And of course SDP FailureMap itself is open source with a [public repository](https://github.com/sdp-tech/Visualization)
 on GitHub.

### Todos

- Search bar 

License
----

MIT


[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)


   [dill]: <https://github.com/joemccann/dillinger>
   [git-repo-url]: <https://github.com/joemccann/dillinger.git>
   [john gruber]: <http://daringfireball.net>
   [df1]: <http://daringfireball.net/projects/markdown/>
   [markdown-it]: <https://github.com/markdown-it/markdown-it>
   [Ace Editor]: <http://ace.ajax.org>
   [node.js]: <http://nodejs.org>
   [Twitter Bootstrap]: <http://twitter.github.com/bootstrap/>
   [jQuery]: <http://jquery.com>
   [@tjholowaychuk]: <http://twitter.com/tjholowaychuk>
   [express]: <http://expressjs.com>
   [AngularJS]: <http://angularjs.org>
   [Gulp]: <http://gulpjs.com>

   [PlDb]: <https://github.com/joemccann/dillinger/tree/master/plugins/dropbox/README.md>
   [PlGh]: <https://github.com/joemccann/dillinger/tree/master/plugins/github/README.md>
   [PlGd]: <https://github.com/joemccann/dillinger/tree/master/plugins/googledrive/README.md>
   [PlOd]: <https://github.com/joemccann/dillinger/tree/master/plugins/onedrive/README.md>
   [PlMe]: <https://github.com/joemccann/dillinger/tree/master/plugins/medium/README.md>
   [PlGa]: <https://github.com/RahulHP/dillinger/blob/master/plugins/googleanalytics/README.md>
