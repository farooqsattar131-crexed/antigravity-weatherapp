export function getBackground(weatherData) {
  if (!weatherData || !weatherData.weather || !weatherData.weather[0]) {
    return {
      bgClass: "bg-gradient-to-br from-blue-200 to-blue-400",
      effectClass: "",
      isDay: true
    };
  }

  const weatherMain = weatherData.weather[0].main;
  
  // Calculate local time for the city searched using timezone offset (seconds from UTC)
  const timezoneOffset = weatherData.timezone || 0;
  const utcNow = new Date();
  
  // Create a proper time construct by adjusting the UTC by the offset locally
  const localTimeMs = utcNow.getTime() + (utcNow.getTimezoneOffset() * 60000) + (timezoneOffset * 1000);
  const localDate = new Date(localTimeMs);
  const hour = localDate.getHours();
  
  // Fallback to checking OpenWeather map icon if timezone calculation seems weird
  const icon = weatherData.weather[0].icon;
  const isNightIcon = icon.includes("n");
  
  // Use 6 AM to 6 PM (18:00) as day
  const isDay = (hour >= 6 && hour < 18) && !isNightIcon;

  let bgClass = "";
  let effectClass = "";

  if (isDay) {
    switch (weatherMain) {
      case "Clear":
        bgClass = "from-yellow-300 via-orange-200 to-orange-400";
        effectClass = "effect-sun";
        break;
      case "Clouds":
        bgClass = "from-gray-300 to-blue-200";
        effectClass = "effect-clouds";
        break;
      case "Rain":
      case "Drizzle":
        bgClass = "from-gray-500 to-blue-800";
        effectClass = "effect-rain";
        break;
      case "Thunderstorm":
        bgClass = "from-gray-800 to-indigo-900";
        effectClass = "effect-rain";
        break;
      case "Snow":
        bgClass = "from-blue-100 to-white";
        effectClass = "effect-snow";
        break;
      case "Fog":
      case "Mist":
      case "Haze":
        bgClass = "from-gray-300 to-gray-400";
        effectClass = "effect-fog";
        break;
      default:
        bgClass = "from-blue-200 to-blue-400";
    }
  } else {
    // NIGHT MODE
    switch (weatherMain) {
      case "Clear":
        bgClass = "from-slate-900 to-indigo-950 text-white";
        effectClass = "effect-stars";
        break;
      case "Clouds":
        bgClass = "from-gray-800 to-slate-900 text-white";
        effectClass = "effect-clouds-night";
        break;
      case "Rain":
      case "Drizzle":
      case "Thunderstorm":
        bgClass = "from-gray-900 to-blue-950 text-white";
        effectClass = "effect-rain";
        break;
      case "Snow":
        bgClass = "from-slate-800 to-slate-900 text-white";
        effectClass = "effect-snow";
        break;
      case "Fog":
      case "Mist":
      case "Haze":
        bgClass = "from-gray-800 to-gray-900 text-white";
        effectClass = "effect-fog";
        break;
      default:
        bgClass = "from-slate-900 to-slate-800 text-white";
    }
  }

  return {
    bgClass: `bg-gradient-to-br ${bgClass}`,
    effectClass,
    isDay
  };
}
