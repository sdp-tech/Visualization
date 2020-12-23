# SDPvisual
# visual_map


201128 
속도 개선을 위해 map.js에서 load_data() , each_data() 분리
=> 데이터를 불러와서 Localstorage 에 저장하도록 함.


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
