import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!city && (!lat || !lon)) {
    return NextResponse.json(
      { error: 'City or coordinates are required' },
      { status: 400 }
    );
  }

  try {
    let latitude = lat;
    let longitude = lon;
    let cityName = city;

    // ✅ Step 1: Get coordinates from city
    if (city) {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`
      );

      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        return NextResponse.json(
          { error: 'City not found' },
          { status: 404 }
        );
      }

      const place = geoData.results[0];
      latitude = place.latitude;
      longitude = place.longitude;
      cityName = `${place.name}, ${place.country}`; // ✅ add country
    }

    // ✅ Step 2: Fetch weather
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    );

    if (!weatherRes.ok) {
      throw new Error(`Weather API error: ${weatherRes.status}`);
    }

    const weatherData = await weatherRes.json();

    // ✅ Step 3: Return data WITH ICON
    return NextResponse.json({
      name: cityName,
      main: {
        temp: weatherData.current_weather.temperature,
      },
      wind: {
        speed: weatherData.current_weather.windspeed,
      },
      weather: [
        {
          main: getWeatherCondition(weatherData.current_weather.weathercode),
          icon: getWeatherIcon(weatherData.current_weather.weathercode), // ✅ FIXED
        },
      ],
    });

  } catch (error) {
    console.error(`Fetch failed: ${error.message}`);
    return NextResponse.json(
      { error: 'Service unavailable' },
      { status: 503 }
    );
  }
}

// ✅ Weather text
function getWeatherCondition(code) {
  if (code === 0) return 'Clear ☀️';
  if (code <= 2) return 'Partly Cloudy ⛅';
  if (code === 3) return 'Cloudy ☁️';
  if (code <= 48) return 'Fog 🌫️';
  if (code <= 67) return 'Rain 🌧️';
  if (code <= 77) return 'Snow ❄️';
  if (code <= 99) return 'Storm ⛈️';
  return 'Unknown';
}

// ✅ Weather icon (NEW)
function getWeatherIcon(code) {
  if (code === 0) return "https://cdn-icons-png.flaticon.com/512/869/869869.png";
  if (code <= 2) return "https://cdn-icons-png.flaticon.com/512/1163/1163661.png";
  if (code === 3) return "https://cdn-icons-png.flaticon.com/512/414/414825.png";
  if (code <= 48) return "https://cdn-icons-png.flaticon.com/512/4005/4005901.png";
  if (code <= 67) return "https://cdn-icons-png.flaticon.com/512/1163/1163657.png";
  if (code <= 77) return "https://cdn-icons-png.flaticon.com/512/642/642102.png";
  if (code <= 99) return "https://cdn-icons-png.flaticon.com/512/1146/1146860.png";
  return "https://cdn-icons-png.flaticon.com/512/869/869869.png";
}