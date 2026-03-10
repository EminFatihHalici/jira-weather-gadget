import Resolver from "@forge/resolver";
import { fetch } from "@forge/api";

const resolver = new Resolver();

resolver.define("getText", (req) => {
  console.log(req);

  return "Hello, world!";
});

resolver.define("getCurrentWeather", async (req) => {
  console.log(req.context.extension.gadgetConfiguration);

  if (req.context.extension.gadgetConfiguration) {
    const coord = req.context.extension.gadgetConfiguration;
    const url =
      "https://api.openweathermap.org/data/2.5/weather?lat=" +
      coord.lat +
      "&lon=" +
      coord.lon +
      "&units=metric&appid=" +
      process.env.OPENWEATHER_KEY;
    const response = await fetch(url);
    if (!response.ok) {
      const errmsg = `Error from Open Weather Map Current Weather API: ${response.status} ${await response.text()}`;
      console.error(errmsg);
      throw new Error(errmsg);
    }
    const weather = await response.json();
    return weather;
  } else {
    return null;
  }
});

export const handler = resolver.getDefinitions();
