const cityName = document.getElementById("cityName");
const temp = document.getElementById("temp");
const wind = document.getElementById("wind");
const humidity = document.getElementById("humidity");
const weatherIcon = document.getElementById("weatherIcon");
const forecastDiv = document.getElementById("forecast");

document.getElementById("searchBtn").addEventListener("click", searchCity);

navigator.geolocation.getCurrentPosition(
  position => {
    fetchWeather(
      position.coords.latitude,
      position.coords.longitude,
      "Your Location"
    );
  },
  () => {
    fetchCityWeather("Coimbatore");
  }
);

async function searchCity(){
  const city=document.getElementById("cityInput").value;
  fetchCityWeather(city);
}

async function fetchCityWeather(city){

  const geoURL=
  `https://geocoding-api.open-meteo.com/v1/search?name=${city}`;

  const geo=await fetch(geoURL);
  const geoData=await geo.json();

  if(!geoData.results) return;

  const place=geoData.results[0];

  fetchWeather(
    place.latitude,
    place.longitude,
    place.name
  );
}

async function fetchWeather(lat,lon,place){

  const url=
  `https://api.open-meteo.com/v1/forecast?
  latitude=${lat}
  &longitude=${lon}
  &current=temperature_2m,wind_speed_10m
  &hourly=temperature_2m,relative_humidity_2m
  &daily=weather_code,temperature_2m_max,temperature_2m_min
  &forecast_days=7`
  .replace(/\s+/g,'');

  const response=await fetch(url);
  const data=await response.json();

  cityName.textContent=place;

  temp.textContent=data.current.temperature_2m;
  wind.textContent=data.current.wind_speed_10m;

  humidity.textContent=
  data.hourly.relative_humidity_2m[0];

  weatherIcon.textContent="☁️";

  renderForecast(data);
  drawChart(data.hourly.temperature_2m.slice(0,24));
}

function renderForecast(data){

  forecastDiv.innerHTML="";

  data.daily.time.forEach((day,index)=>{

    const card=document.createElement("div");

    card.className="forecast-card";

    card.innerHTML=`
      <h4>${new Date(day)
      .toLocaleDateString('en-US',
      {weekday:'short'})}</h4>

      <div class="icon">☁️</div>

      <h3>${data.daily.temperature_2m_max[index]}°</h3>

      <p>${data.daily.temperature_2m_min[index]}°</p>
    `;

    forecastDiv.appendChild(card);
  });
}

function drawChart(temps){

  const canvas=document.getElementById("tempChart");
  const ctx=canvas.getContext("2d");

  ctx.clearRect(0,0,canvas.width,canvas.height);

  const max=Math.max(...temps);
  const min=Math.min(...temps);

  const padding=50;

  ctx.strokeStyle="#4c89ff";
  ctx.lineWidth=3;

  ctx.beginPath();

  temps.forEach((temp,index)=>{

    const x=
    padding+
    (index*(canvas.width-padding*2))
    /(temps.length-1);

    const y=
    canvas.height-padding-
    ((temp-min)/(max-min))
    *(canvas.height-padding*2);

    if(index===0)
      ctx.moveTo(x,y);
    else
      ctx.lineTo(x,y);
  });

  ctx.stroke();

  ctx.fillStyle="#ffffff";

  for(let i=0;i<24;i+=4){

    const x=
    padding+
    (i*(canvas.width-padding*2))/23;

    ctx.fillText(
      `${i}:00`,
      x,
      canvas.height-20
    );
  }
}
