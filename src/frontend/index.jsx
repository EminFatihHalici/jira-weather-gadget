import React, {useEffect, useState} from "react";
import ForgeReconciler, {
  Text,
  useProductContext,
  Textfield,
  Form,
  Button,
  FormSection,
  FormFooter,
  Label,
  RequiredAsterisk,
  useForm,
  ErrorMessage,
  RadioGroup,
  Box, 
  Inline,
  xcss, 
  Heading, 
  Strong, 
  Image
} from "@forge/react";
import { invoke, view } from "@forge/bridge";

let currentCC = null

export const Edit = () => {
const { handleSubmit, register, getValues, formState } = useForm();
const [locationOptions, setLocationOptions] = useState(null);
const [showOptions, setShowOptions] = useState(false);
const { errors } = formState;

const getOptions = () => {
  const values = getValues();

  if(values.city && values.country){

    if(currentCC && (currentCC.city == values.city)&&(currentCC.country == values.country)) {
      // do nothing if the city and country entered by the user hasn't changed
    } else {
      // store the curent city and country to compare for changes later
      currentCC = { 
        city: values.city, 
        country: values.country }
      // refresh locationOptions by calling the OpenWeather Geolocation API
      invoke('getLocationCoordinates', {location: values}).then((val) => { 
        setLocationOptions(val);
        // set showOptions to true - this will be used to display the radio button group, and the submit button
        setShowOptions(true);
      });
    }
  }
};  

function locationOption(obj, index, array) {
  return { name: "location", label: obj.name + ", " + obj.state + ", " + obj.country, value: index }
}



const configureGadget = (data) => {
  view.submit(locationOptions[data.location])
}


    return (
  <>
  <Form onSubmit={handleSubmit(configureGadget)}>
    <FormSection>
      <Label>City<RequiredAsterisk /></Label>
      <Textfield {...register("city", { required: true, onChange: getOptions() })} />
      <Label>Country<RequiredAsterisk /></Label>
      <Textfield {...register("country", { required: true })} />
      {showOptions && <Label>Select your location<RequiredAsterisk /></Label>}
      {showOptions && (
          <RadioGroup {...register("location", {required: true})} options={locationOptions.map(locationOption)}/>
        )}
        {errors["location"] && <ErrorMessage>Select a location</ErrorMessage>}
    </FormSection>
    <FormFooter>
      {showOptions && <Button appearance="primary" type="submit">
        Submit
      </Button>}
    </FormFooter>
  </Form>
</>

    );
};

const View = () => {
  const context = useProductContext();
  const [weather, setWeather] = useState(null)


  useEffect(() => {
    invoke('getCurrentWeather').then(setWeather);
  }, []);

  if (!context) {
    return "Loading...";
  }
  const {
    extension: { gadgetConfiguration },
  } = context;

  const containerStyle = xcss({
  padding: 'space.200'
});

  return (
    <>
     {console.log(weather)}
    <Heading as="h2">{weather ? weather.name : 'Loading...'} Weather</Heading>
    <Box xcss={containerStyle}>
    <Inline>
      <Image src={weather ? (`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`) : "https://openweathermap.org/img/wn/01d@2x.png"} alt={weather ? weather.weather[0].description : "Loading"} />
      <Box>
        <Text><Strong>Current Temperature</Strong> {weather ? weather.main.temp : '[ ]'} °C</Text>
        <Text><Strong>Feels like:</Strong> {weather ? weather.main.feels_like : '[ ]'} °C</Text>
        <Text><Strong>Humidity:</Strong> {weather ? weather.main.humidity : '[ ]'}%</Text>
      </Box>
    </Inline>
    </Box>
    </>

  );
};

const App = () => {
  const context = useProductContext();
  if (!context) {
    return "This is never displayed...";
  }

  return context.extension.entryPoint === "edit" ? <Edit /> : <View />;
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
