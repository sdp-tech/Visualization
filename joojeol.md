# SDPvisual
# visual_map


201128 
속도 개선을 위해 map.js에서 load_data() , each_data() 분리
=> 데이터를 불러와서 Localstorage 에 저장하도록 함.
// $getJSON timing 



201222
json => geojson으로 변환함

geojson 로컬파일 불러올 때 오류
    // #TODO Local file 관련 Error (정리하기)
    // https://velog.io/@takeknowledge/%EB%A1%9C%EC%BB%AC%EC%97%90%EC%84%9C-CORS-policy-%EA%B4%80%EB%A0%A8-%EC%97%90%EB%9F%AC%EA%B0%80-%EB%B0%9C%EC%83%9D%ED%95%98%EB%8A%94-%EC%9D%B4%EC%9C%A0-3gk4gyhreu
=> 이거 정리 잘 해두삼

    
// #TODO Uncaught TypeError: L.geoJSON is not a function
    $.getJSON(mapdata, function(json) {

        geoLayer = L.geoJSON(json, {
            onEachFeature: onEachFeature,
            pointToLayer: pointToLayer,
        }).addTo(mymap);
    });

    getJson 안써서 그런거였음 왜그럼

geojson feature -filter (module)
https://developer.aliyun.com/mirror/npm/package/feature-filter-geojson/v/1.0.0
근데 이건 검색 세분화일 때 유용할듯
기본 geojson filter사용 후 판단하기


// 필터를 구현했다 .. on christmas ...  하ㅏ루종일 .. 해서 .. 힘들다..
더러운 자바스크립트 ..
updatestaes ->

js object란?
Object.values() !!


//updateStates

    $(document).ready(function() 내에
        1. $('.country-select').on('change.select2', function (el) {
        2. $('.sector-select').on('change', function (el) {
    따로 구현함 
    처음에는 let 
    input of queryselectall(select)에서 onchange 로
    switch(input.id) case로 짰는데
    event change가 왜인지 << 아직 알아내지 못함>>
    모든 select가 변화하는 것으로 나오길래 select를 각각 분리할 수 밖에 없었음


// 필터링 구현
-> 아무것도 선택하지 않았을 때는 모든 것을 선택한 것으로 만들기
( 첫 화면에서 볼 수 있게, 그리고 옵션 들 중 하나만 적용됐을 때를 위해서)
countryselect = (customOption.countryOp.length == 0)? true : (customOption.countryOp.includes(feature.properties.country));
var variable = ()? true:false 형식 사용



// fc year range
https://www.cssscript.com/animated-customizable-range-slider-pure-javascript-rslider-js/

지도가 움직여서 fc 조절안됨.
지도 Fix하는 법?
차ㅏㅈ았음~

fc year Module
http://ionden.com/a/plugins/ion.rangeSlider/demo_interactions.html


