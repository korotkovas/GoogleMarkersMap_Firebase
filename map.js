/**
 * Функция инициализации карты
 * Получаем массив places, который раннее загрузили из Firebase
 */
var defaultMarker = './defaultMarker.svg'
var busMarker = './busMarker.svg'

function setMarkers(locations) {
    newData = [];
    newData =locations;
    var infoWindow = new google.maps.InfoWindow(
        {
            pixelOffset: 
            { 
                width: 0,
                height: -24
            }
        }
    );
    for (var i = 0; i < locations.length; i++) {
        var place = locations[i];
        var timeString = new Date(place.timestamp).toLocaleString();
        var myLatLng = new google.maps.LatLng(place.lat, place.lng);
        var marker = new google.maps.Marker({
            position: myLatLng,
            map: map,
            title: place.title,
            icon: busMarker,
            id: place.id,
            timestamp: place.timestamp
        });
        // Добавляем маркеры в массив markers
        markers.push(marker); 
    }
    markers.forEach(marker => {
        var timeString = new Date(marker.timestamp).toLocaleString();        
        // Двойной клик на маркер
        marker.addListener('dblclick', function() {
            firebase.database().ref().child('places/' + marker.id + '/').remove()
            marker.setMap(null);
            infoWindow.setMap(null);
        });
        // Клик на маркер
        marker.addListener('click', function(e) {
            infoWindow.setPosition(marker.position);
            infoWindow.setContent('Заголовок: ' + marker.title +'<br> Время: ' + timeString);            
            if (!infoWindow.map) {
                infoWindow.setMap(map);             
            };
        });
    });
}

function initMap() {
    var mapOptions = {
        zoom: 5,
        center: {lat: -34.397, lng: 150.644}
    }
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    // Загружаем метки из Firebase
    loadMarkers();
    
    // HTML5 Геолокация.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            // Записываем наше местоположение в переменную pos
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            // Добавляем маркер в наше местоположение
            var marker = new google.maps.Marker({
                position: pos,
                map: map,
                icon: defaultMarker
            });
            var infoWindow = new google.maps.InfoWindow(
                {
                    map: map,
                    pixelOffset: 
                    { 
                        width: 0,
                        height: -24
                    }
                }
            );
            infoWindow.setPosition(pos);
            infoWindow.setContent('Местоположение найдено!');
            map.setCenter(pos);
        }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
    // Браузер не поддерживает геолокацию
    handleLocationError(false, infoWindow, map.getCenter());
    } 
    // При клике на карту добавляем метку на карту
    var marker = new google.maps.Marker({        
        map: map,
        icon: defaultMarker
    });
    map.addListener('click', function(e) {
        data.lat = e.latLng.lat();
        data.lng = e.latLng.lng();
        marker.setPosition(
        {
            lat: data.lat, 
            lng: data.lng
        } 
        )        
    });
    // При клике на кнопку с id="add-marker" - добавляем маркер в базу данных
    document.getElementById('add-marker').addEventListener('click', function(e) {
        data.title = document.getElementById('title').value;        
        addToFirebase(data);
        reloadMarkers();
    });      
} 
  
  // Проверка на ошибку геолокации на устройстве
  function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
                          'Error: The Geolocation service failed.' :
                          'Error: Your browser doesn\'t support geolocation.');
  }