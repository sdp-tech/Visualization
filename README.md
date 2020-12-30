# SDP Visualization

<b>Project MaPPIng​</b>
>Project MaPPping focuses on large-scale infrastructure that can increase >connectivity with many of the megacities that arise from the intensive >urbanization of Asia. The project aims to collect, analyze, and visualize these >relevant indicators to show how sustainable development in Asia is happening and >how to move forward.​


#### Project Process
  - Phase 1

In December 2019, SDP was selected as the Data Reviewer and Research Assistant for the World Bank Group Singapore PPI team for the first time as an undergraduate group to participate in the "The World Bank 2019 PPI Report" project. SDP conducted open-source tracking and data review of all Private Partition Infrastructure (PPI) Deals conducted at Developing Country in 2019.

  - Phase 2

We continue to work with the World Bank through the "PPI Deal Tracking" project. In response to global pandemic in 2020, we collect and classify PPI Deals that have been affected by Covid-19. Furthermore, the goal is to build a SDP-specific infrastructure database to increase competitiveness.

  - Phase 3

Based on the infrastructure database of SDPs built through the previous Phases, we plan to make visualizations that can derive insights (and here it is!)

***
# Features
  - Retreive data from JSON API
  - Interactive filters
  - Multiple select dropdown
  - Pop-up bind marker

You can also:
  - Search data on Searchbar 

***
# Fix / Update 

**201120**
~

**201222**
> 1. Changed a json format of data into geojson format

**201225**
> 1. Filtering function implemented with Select2 & rangeSlider on filter bar

**201226**
> 1. Disable Mouse dragging or zooming when mouse is over the filter bar
> 2. Added a loading page before the map, map data is loaded

**201226**
> 1. added optgroup elements to region / sector for clarifying the child options

**201227**
> 1. added a filter clear button (using Select2, ionRangeSlider module)
> 2. Search Control added ** let marker open its own popup when searched **
> 3. added an Easybutton to get back to the initial setView
> 4. let optgroup be selectable so that user can selet/ unselect all according options by clicking the optgroup title

**201230**
> 1. Fixed subtle errors
> 2. Added content to main.html

***
# Tech

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

***
# Todos

***
# Who are we?

Sustainable Development Program
![alt text](sdp_logo.png)

- Webpage : https://www.sdpglobal.org/
- Instagram: @_sdp_official
- Phone: +82 010 9167 0663
- Email: sdpygl@gmail.com


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
