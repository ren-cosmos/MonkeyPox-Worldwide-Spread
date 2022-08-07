function updateMap() {
    fetch("/latest.json")
        .then(response => response.json())
        .then(dataArray => {
            // console.log(dataArray);
            dataArray.forEach(element => {
                // storing data
                let country = element.Country;
                let city = element.City;
                let location = (city == "") ? country : city;
                let stats = element.Status;
                age = element.Age;
                gender = element.Gender;
                date_confirmed = element.Date_confirmation;
                date_entry = element.Date_entry;

                // console.log(iter);
                // iter++;

                // Adding location to citiesOrCountries if it's not already present
                if (!(location in citiesOrCountries)) {
                    citiesOrCountries[`${location}`] = {

                        "Status": stats,
                        "Suspected": (stats == "confirmed") ? 0 : 1,
                        "Confirmed": (stats == "suspected") ? 0 : 1,
                        "Location": location,
                        "City": city,
                        "Country": country,
                        "Age": age,
                        "Gender": gender,
                        "Date_confirmation": date_confirmed,
                        "Date_entry": date_entry
                    }
                }

                // Incrementing suspected/Confirmed if location is already in citiesOrCountries
                else {
                    if (stats == "confirmed") {
                        citiesOrCountries[location].Confirmed++;
                    }
                    if (stats == "suspected") {
                        citiesOrCountries[location].Suspected++;
                    }
                }
                // console.log(citiesOrCountries)
            }
            )

        })
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

citiesOrCountries = {}
iter = 0
updateMap()

sleep(1000).then(() => {
    console.log(citiesOrCountries)

    for (const location in citiesOrCountries) {

        // console.log(iter);
        // iter++;
        // console.log(location)

        let country = citiesOrCountries[location].Country
        let city = citiesOrCountries[location].City
        let suspected = citiesOrCountries[location].Suspected
        let confirmed = citiesOrCountries[location].Confirmed
        let total_cases = suspected + confirmed


        // forward geocoding
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${location}.json?access_token=pk.eyJ1Ijoic2hpdmFtZ3JvdmVyMzYwIiwiYSI6ImNsNXlsZDNuczE0cXgzZG1hbjVtMzBpczYifQ.EjYRUTRkKIEmD7bq5bEhYQ`
        fetch(url)
            .then(data => data.json())
            .then(res => {
                //console.log(res)
                var long = res.features[0].geometry.coordinates[0];
                var lat = res.features[0].geometry.coordinates[1];

                //Popup for a Marker
                const popup = new mapboxgl.Popup({
                    offset: 25
                }).setHTML(
                    `Country: ${country} <br>
                    City: ${city} <br>
                    Suspected Cases: ${suspected} <br>
                    Confirmed Cases: ${confirmed} <br>
                    Total Cases: ${total_cases}`
                )

                // Marker on Map
                new mapboxgl.Marker({
                    draggable: false,
                    color: (total_cases >= 255) ? "rgb(255, 0, 0)" : `rgb(${total_cases}, 0, 0)`
                })
                    .setLngLat([long, lat])
                    .setPopup(popup)
                    .addTo(map);
            })
    }
})