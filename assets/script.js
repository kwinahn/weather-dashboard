let today = moment().format('l');
let searchHistoryList = [];
let apiKey = '92e050c6c675d50dc4606e4adfb4d99e';

// function for current condition
function currentCondition(city) {
	let queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;

	$.ajax({
		url: queryURL,
		method: 'GET',
	}).then(function (cityWeatherResponse) {
		console.log(cityWeatherResponse);

		$('#weatherContent').css('display', 'block');
		$('#cityDetail').empty();

		let iconCode = cityWeatherResponse.weather[0].icon;
		let iconURL = `https://openweathermap.org/img/w/${iconCode}.png`;

		// Display tempt, humidity, and wind speed from Current Weather Data API//
		let currentCity = $(`
          <h2 id="currentCity">
              ${cityWeatherResponse.name} ${today} <img src="${iconURL}" alt="${cityWeatherResponse.weather[0].description}" />
          </h2>
          <p>Temperature: ${cityWeatherResponse.main.temp} °F</p>
          <p>Humidity: ${cityWeatherResponse.main.humidity}\%</p>
          <p>Wind Speed: ${cityWeatherResponse.wind.speed} MPH</p>
      `);

		$('#cityDetail').append(currentCity);

		// UV index from One Call API //
		let lat = cityWeatherResponse.coord.lat;
		let lon = cityWeatherResponse.coord.lon;
		let uviQueryURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;

		$.ajax({
			url: uviQueryURL,
			method: 'GET',
		}).then(function (uviResponse) {
			console.log(uviResponse);

			let uvIndex = uviResponse.value;
			let uvIndexP = $(`
            <p> UV Index: 
              <span id="uvIndexColor" class="px-2 py-2 rounded">${uvIndex}</span>
            </p>
          `);

			$('#cityDetail').append(uvIndexP);

			futureCondition(lat, lon);

			if (uvIndex >= 0 && uvIndex <= 2) {
				$('#uvIndexColor')
					.css('background-color', '#3EA72D')
					.css('color', 'white');
			} else if (uvIndex >= 3 && uvIndex <= 5) {
				$('#uvIndexColor').css('background-color', '#FFF300');
			} else if (uvIndex >= 6 && uvIndex <= 7) {
				$('#uvIndexColor').css('background-color', '#F18B00');
			} else if (uvIndex >= 8 && uvIndex <= 10) {
				$('#uvIndexColor')
					.css('background-color', '#E53210')
					.css('color', 'white');
			} else {
				$('#uvIndexColor')
					.css('background-color', '#B567A4')
					.css('color', 'white');
			}
		});
	});
}

// function for future condition
function futureCondition(lat, lon) {
	// 5-day forecast
	let futureURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=current,minutely,hourly,alerts&appid=${apiKey}`;
  
  let futureEl = document.getElementById("forecast-title");
  futureEl.textContent = "5-Day Forecast:";
  futureEl.style.fontSize = "200%";


	$.ajax({
		url: futureURL,
		method: 'GET',
	}).then(function (futureResponse) {
		console.log(futureResponse);
		$('#fiveDay').empty();

		for (let i = 1; i < 6; i++) {
			let cityInfo = {
				date: futureResponse.daily[i].dt,
				icon: futureResponse.daily[i].weather[0].icon,
				temp: futureResponse.daily[i].temp.day,
				humidity: futureResponse.daily[i].humidity,
			};

			let currDate = moment.unix(cityInfo.date).format('ll');
      let currDay = moment.unix(cityInfo.date).format('dddd');
			let iconURL = `<img src="https://openweathermap.org/img/w/${cityInfo.icon}.png" alt="${futureResponse.daily[i].weather[0].main}" />`;

			let futureCard = $(`
        <div class="pl-3">
          <div class="card pl-3 pt-3 mb-3 bg-dark text-light" style="width: 10rem;>
            <div class="card-body">
              <h5>${currDay}</h5>
              <h6>${currDate}</h6>
              <p>${iconURL}</p>
              <p>Temp: ${cityInfo.temp} °F</p>
              <p>Humidity: ${cityInfo.humidity}\%</p>
            </div>
          </div>
        <div>
          `);

			$('#fiveDay').append(futureCard);
		}
	});
}

// add on click event listener //
$('#searchBtn').on('click', function (event) {
	event.preventDefault();

	let city = $('#enterCity').val().trim();
	currentCondition(city);
	if (!searchHistoryList.includes(city)) {
		searchHistoryList.push(city);
		let searchedCity = $(`
          <li class="list-group-item">${city}</li>
          `);
		$('#searchHistory').append(searchedCity);
	}

	localStorage.setItem('city', JSON.stringify(searchHistoryList));
	console.log(searchHistoryList);
});

// Allow user to click on city that is in the search history list
$(document).on('click', '.list-group-item', function () {
	let listCity = $(this).text();
	currentCondition(listCity);
});
