let checkboxStates

// json test = json file

const map = L.map('map').setView([48.2083537, 16.3725042], 2)

L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg', {
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.',
  subdomains: 'abcd'
}).addTo(map)

const geojsonLayer = L.geoJSON(null,{
	filter: (feature) => {
  	const isYearChecked = checkboxStates.years.includes(feature.properties.year)
    const isEventTypeChecked = checkboxStates.eventTypes.includes(feature.properties.eventType)
    return isYearChecked && isEventTypeChecked //only true if both are true
  }
}).addTo(map)

function updateCheckboxStates() {
	checkboxStates = {
  	years: [],
    eventTypes: []
  }
  
	for (let input of document.querySelectorAll('input')) {
  	if(input.checked) {
    	switch (input.className) {
      	case 'event-type': checkboxStates.eventTypes.push(input.value); break
        case 'year': checkboxStates.years.push(input.value); break
      }
    }
  }
}


for (let input of document.querySelectorAll('input')) {
  //Listen to 'change' event of all inputs
  input.onchange = (e) => {
    geojsonLayer.clearLayers()
  	updateCheckboxStates()
    geojsonLayer.addData(jsontest)   
  }
}


/****** INIT ******/
updateCheckboxStates()
geojsonLayer.addData(jsontest)