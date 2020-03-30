import React from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng
} from "react-places-autocomplete";
import { getAddressComponent } from "../utils";

class LocationSearchInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = { address: props.value };
    this.textInput = React.createRef();
  }

  handleChange = address => {
    this.setState({ address });
  };

  handleSelect = address => {
    this.textInput.current.blur();
    geocodeByAddress(address)
      .then(async results => {
        this.setState({ address });
        const result = results[0];
        const latLng = await getLatLng(result);
        console.log("Success", latLng);
        this.props.onSuccess({
          latLng: latLng,
          name: address,
          address: result.formatted_address,
          place_id: result.place_id,
          types: result.types,
          city: getAddressComponent(result.address_components, "locality"),
          locality: getAddressComponent(
            result.address_components,
            "neighborhood"
          )
        });
      })
      .catch(error => console.error("Error", error));
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    const didValueChange = prevProps.value !== this.props.value;
    const isAddressDifferent = prevState.address !== this.props.value;
    if (didValueChange && isAddressDifferent) {
      this.setState({ address: this.props.value });
    }
  }

  clearInput() {
    this.setState({ address: "" });
  }

  render() {
    const location = this.props.currentLocation
      ? new window.google.maps.LatLng(
          this.props.currentLocation.lat,
          this.props.currentLocation.lng
        )
      : undefined;
    const options = location ? { location, radius: 200000 } : undefined;
    return (
      <PlacesAutocomplete
        value={this.state.address}
        onChange={this.handleChange}
        onSelect={this.handleSelect}
        searchOptions={options}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          <div>
            <InputGroup>
              <Form.Control
                {...getInputProps({
                  placeholder: "Search by store name, address or landmark",
                  defaultValue: this.props.defaultValue,
                  className: "location-search-input"
                })}
                ref={this.textInput}
              />
              <InputGroup.Append>
                <Button
                  onClick={e => this.clearInput(e)}
                  variant="outline-secondary"
                >
                  ×
                </Button>
              </InputGroup.Append>
            </InputGroup>
            <div className="autocomplete-dropdown-container">
              {loading && <div>Loading...</div>}
              {suggestions.map(suggestion => {
                const className = suggestion.active
                  ? "suggestion-item--active"
                  : "suggestion-item";

                return (
                  <div
                    {...getSuggestionItemProps(suggestion, {
                      className
                    })}
                  >
                    <span>{suggestion.description}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </PlacesAutocomplete>
    );
  }
}

class LocationSearchControl extends React.Component {
  render() {
    return <LocationSearchInput {...this.props} />;
  }
}

export default LocationSearchControl;
