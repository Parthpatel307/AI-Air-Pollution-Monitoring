import { useMemo, useRef, useState } from "react";

import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";


const INDIA_CENTER = [22.5, 79.0];


function isValidCoordinate(item) {
  return (
    item &&
    Number.isFinite(Number(item.latitude)) &&
    Number.isFinite(Number(item.longitude))
  );
}


function getAQIColor(aqi) {
  const value = Number(aqi);

  if (!Number.isFinite(value)) {
    return "#94a3b8";
  }

  if (value <= 50) return "#34d399";
  if (value <= 100) return "#fbbf24";
  if (value <= 150) return "#fb923c";
  if (value <= 200) return "#f87171";
  if (value <= 300) return "#a855f7";

  return "#7f1d1d";
}


function ZoomWatcher({ onZoomChange }) {
  const map = useMapEvents({
    zoomend() {
      onZoomChange(map.getZoom());
    },
  });

  return null;
}


function MapController({
  cityTarget,
  stateTarget,
  onActionComplete,
}) {
  const map = useMap();

  if (cityTarget) {
    setTimeout(() => {
      map.flyTo(
        [
          Number(cityTarget.latitude),
          Number(cityTarget.longitude),
        ],
        10,
        {
          duration: 1,
        }
      );

      onActionComplete?.();
    }, 0);
  }

  if (
    !cityTarget &&
    stateTarget &&
    stateTarget.length > 0
  ) {
    setTimeout(() => {
      const bounds = stateTarget.map((zone) => [
        Number(zone.latitude),
        Number(zone.longitude),
      ]);

      if (bounds.length === 1) {
        map.flyTo(bounds[0], 8, {
          duration: 1,
        });
      } else {
        map.fitBounds(bounds, {
          padding: [70, 70],
          maxZoom: 8,
        });
      }

      onActionComplete?.();
    }, 0);
  }

  return null;
}


function PollutionMap({
  zones = [],
  hotspots = [],
  selectedZoneId = null,
  onZoneSelect = null,
}) {
  const [zoom, setZoom] = useState(5);

  const [selectedState, setSelectedState] =
    useState("");

  const [selectedCity, setSelectedCity] =
    useState("");

  const [searchText, setSearchText] =
    useState("");

  const [cityTarget, setCityTarget] =
    useState(null);

  const [stateTarget, setStateTarget] =
    useState(null);

  const actionLock = useRef(false);

  const validZones = useMemo(
    () => zones.filter(isValidCoordinate),
    [zones]
  );

  const validHotspots = useMemo(
    () => hotspots.filter(isValidCoordinate),
    [hotspots]
  );

  const states = useMemo(() => {
    return [
      ...new Set(
        validZones
          .map((zone) => zone.state)
          .filter(Boolean)
      ),
    ].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [validZones]);

  const citiesForState = useMemo(() => {
    if (!selectedState) {
      return [];
    }

    return validZones
      .filter(
        (zone) =>
          zone.state === selectedState
      )
      .sort((a, b) =>
        a.name.localeCompare(b.name)
      );
  }, [
    selectedState,
    validZones,
  ]);

  const searchOptions = useMemo(() => {
    return validZones
      .map((zone) => ({
        ...zone,
        searchLabel: `${zone.name}, ${zone.state}`,
      }))
      .sort((a, b) =>
        a.searchLabel.localeCompare(
          b.searchLabel
        )
      );
  }, [validZones]);

  const highestAQI = Math.max(
    ...validZones.map((zone) =>
      Number(
        zone.current_aqi ??
          zone.aqi ??
          0
      )
    ),
    ...validHotspots.map((hotspot) =>
      Number(hotspot.aqi ?? 0)
    ),
    0
  );

  const showCities = zoom >= 6;
  const showCityLabels = zoom >= 9;


  function clearMapAction() {
    actionLock.current = false;
    setCityTarget(null);
    setStateTarget(null);
  }


  function handleStateChange(event) {
    const state =
      event.target.value;

    setSelectedState(state);
    setSelectedCity("");

    if (!state) {
      return;
    }

    const matchingZones =
      validZones.filter(
        (zone) =>
          zone.state === state
      );

    actionLock.current = true;

    setCityTarget(null);
    setStateTarget(matchingZones);
  }


  function selectCity(zone) {
    if (!zone) {
      return;
    }

    setSelectedState(
      zone.state || ""
    );

    setSelectedCity(
      zone.zone_id
    );

    setSearchText(
      `${zone.name}, ${zone.state}`
    );

    onZoneSelect?.(
      zone.zone_id
    );

    actionLock.current = true;

    setStateTarget(null);
    setCityTarget(zone);
  }


  function handleCityChange(event) {
    const zoneId =
      event.target.value;

    setSelectedCity(zoneId);

    const zone =
      validZones.find(
        (item) =>
          item.zone_id === zoneId
      );

    if (zone) {
      selectCity(zone);
    }
  }


  function handleSearchChange(event) {
    const value =
      event.target.value;

    setSearchText(value);

    const normalized =
      value
        .trim()
        .toLowerCase();

    const exactMatch =
      searchOptions.find(
        (zone) =>
          zone.searchLabel
            .toLowerCase() ===
          normalized
      );

    if (exactMatch) {
      selectCity(
        exactMatch
      );
    }
  }


  function handleSearchSubmit() {
    const normalized =
      searchText
        .trim()
        .toLowerCase();

    if (!normalized) {
      return;
    }

    const match =
      searchOptions.find(
        (zone) =>
          zone.name
            .toLowerCase() ===
            normalized ||
          zone.searchLabel
            .toLowerCase() ===
            normalized
      ) ||
      searchOptions.find(
        (zone) =>
          zone.name
            .toLowerCase()
            .includes(
              normalized
            ) ||
          zone.state
            ?.toLowerCase()
            .includes(
              normalized
            )
      );

    if (match) {
      selectCity(match);
    }
  }


  return (
    <section className="card geo-map-card">
      <div className="card-header">
        <div>
          <span className="card-kicker">
            LIVE GEO MONITORING
          </span>

          <h2>
            Pollution Map
          </h2>
        </div>

        <div className="geo-map-status">
          <span className="status-dot" />
          LIVE
        </div>
      </div>


      {/* MAP FILTERS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 1fr 1.4fr",
          gap: "12px",
          marginBottom: "14px",
        }}
      >
        <select
          value={selectedState}
          onChange={
            handleStateChange
          }
          style={{
            width: "100%",
            padding: "11px 12px",
            borderRadius: "10px",
            border:
              "1px solid rgba(94,234,212,.18)",
            background: "#071713",
            color: "#d8f5ee",
            outline: "none",
          }}
        >
          <option value="">
            Select State
          </option>

          {states.map(
            (state) => (
              <option
                key={state}
                value={state}
              >
                {state}
              </option>
            )
          )}
        </select>


        <select
          value={selectedCity}
          onChange={
            handleCityChange
          }
          disabled={
            !selectedState
          }
          style={{
            width: "100%",
            padding: "11px 12px",
            borderRadius: "10px",
            border:
              "1px solid rgba(94,234,212,.18)",
            background: "#071713",
            color: "#d8f5ee",
            outline: "none",
            opacity:
              selectedState
                ? 1
                : 0.55,
          }}
        >
          <option value="">
            Select City
          </option>

          {citiesForState.map(
            (zone) => (
              <option
                key={
                  zone.zone_id
                }
                value={
                  zone.zone_id
                }
              >
                {zone.name}
              </option>
            )
          )}
        </select>


        <div
          style={{
            display: "flex",
            gap: "8px",
          }}
        >
          <input
            list="pollution-city-search"
            value={searchText}
            onChange={
              handleSearchChange
            }
            onKeyDown={(event) => {
              if (
                event.key ===
                "Enter"
              ) {
                handleSearchSubmit();
              }
            }}
            placeholder="Search city or state..."
            style={{
              width: "100%",
              padding:
                "11px 12px",
              borderRadius:
                "10px",
              border:
                "1px solid rgba(94,234,212,.18)",
              background:
                "#071713",
              color:
                "#d8f5ee",
              outline: "none",
            }}
          />

          <datalist id="pollution-city-search">
            {searchOptions.map(
              (zone) => (
                <option
                  key={
                    zone.zone_id
                  }
                  value={
                    zone.searchLabel
                  }
                />
              )
            )}
          </datalist>

          <button
            type="button"
            onClick={
              handleSearchSubmit
            }
            style={{
              padding:
                "0 16px",
              border: "none",
              borderRadius:
                "10px",
              background:
                "#2dd4bf",
              color:
                "#03201b",
              fontWeight: 700,
              cursor:
                "pointer",
            }}
          >
            Go
          </button>
        </div>
      </div>


      {/* MAP */}

      <div
        style={{
          height: "560px",
          width: "100%",
          borderRadius: "18px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <MapContainer
          center={INDIA_CENTER}
          zoom={5}
          minZoom={4}
          maxZoom={14}
          scrollWheelZoom
          doubleClickZoom
          touchZoom
          dragging
          zoomControl
          style={{
            height: "100%",
            width: "100%",
            background: "#071713",
          }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <ZoomWatcher
            onZoomChange={
              setZoom
            }
          />

          {(cityTarget ||
            stateTarget) &&
            !actionLock.current ? null : (
              <MapController
                cityTarget={
                  cityTarget
                }
                stateTarget={
                  stateTarget
                }
                onActionComplete={
                  clearMapAction
                }
              />
            )}


          {showCities &&
            validZones.map(
              (zone) => {
                const aqi =
                  zone.current_aqi ??
                  zone.aqi ??
                  null;

                const selected =
                  zone.zone_id ===
                  selectedZoneId;

                const color =
                  getAQIColor(
                    aqi
                  );

                return (
                  <CircleMarker
                    key={
                      zone.zone_id
                    }
                    center={[
                      Number(
                        zone.latitude
                      ),
                      Number(
                        zone.longitude
                      ),
                    ]}
                    radius={
                      selected
                        ? 13
                        : 9
                    }
                    pathOptions={{
                      color:
                        selected
                          ? "#ffffff"
                          : color,
                      fillColor:
                        color,
                      fillOpacity:
                        0.9,
                      weight:
                        selected
                          ? 4
                          : 2,
                    }}
                    eventHandlers={{
                      click() {
                        selectCity(
                          zone
                        );
                      },
                    }}
                  >
                    <Tooltip
                      permanent={
                        showCityLabels
                      }
                      direction="right"
                      offset={[
                        10,
                        0,
                      ]}
                      opacity={0.95}
                    >
                      <strong>
                        {zone.name}
                      </strong>

                      <br />

                      {zone.state}

                      <br />

                      AQI:{" "}
                      <strong>
                        {aqi ?? "--"}
                      </strong>
                    </Tooltip>

                    <Popup>
                      <strong>
                        {zone.name}
                      </strong>

                      <br />

                      {zone.state}

                      <br />

                      Live AQI:{" "}
                      {aqi ??
                        "Unavailable"}

                      <br />

                      PM2.5:{" "}
                      {zone.pm25 ??
                        "--"}

                      <br />

                      PM10:{" "}
                      {zone.pm10 ??
                        "--"}

                      <br />

                      Temperature:{" "}
                      {zone.temperature ??
                        "--"}
                      °C
                    </Popup>
                  </CircleMarker>
                );
              }
            )}


          {showCities &&
            validHotspots.map(
              (hotspot) => (
                <CircleMarker
                  key={
                    hotspot.hotspot_id
                  }
                  center={[
                    Number(
                      hotspot.latitude
                    ),
                    Number(
                      hotspot.longitude
                    ),
                  ]}
                  radius={11}
                  pathOptions={{
                    color:
                      "#ffffff",
                    fillColor:
                      "#ef4444",
                    fillOpacity:
                      0.9,
                    weight: 2,
                  }}
                >
                  <Tooltip>
                    Pollution Hotspot
                  </Tooltip>
                </CircleMarker>
              )
            )}
        </MapContainer>


        <div
          style={{
            position: "absolute",
            zIndex: 1000,
            top: "15px",
            left: "55px",
            background:
              "rgba(4,24,20,.90)",
            border:
              "1px solid rgba(94,234,212,.18)",
            borderRadius:
              "10px",
            padding:
              "8px 12px",
            pointerEvents:
              "none",
            color:
              "#d8f5ee",
            fontSize:
              "12px",
          }}
        >
          India Live Network
          {" • "}
          Zoom {zoom}
        </div>


        <div
          style={{
            position: "absolute",
            zIndex: 1000,
            top: "15px",
            right: "15px",
            background:
              "rgba(4,24,20,.90)",
            border:
              "1px solid rgba(94,234,212,.18)",
            borderRadius:
              "10px",
            padding:
              "8px 12px",
            pointerEvents:
              "none",
            color:
              "#d8f5ee",
            fontSize:
              "12px",
          }}
        >
          {validZones.length}
          {" monitored cities"}
        </div>


        {!showCities && (
          <div
            style={{
              position:
                "absolute",
              zIndex: 1000,
              bottom: "20px",
              left: "50%",
              transform:
                "translateX(-50%)",
              background:
                "rgba(4,24,20,.92)",
              border:
                "1px solid rgba(94,234,212,.18)",
              borderRadius:
                "10px",
              padding:
                "9px 14px",
              pointerEvents:
                "none",
              color:
                "#d8f5ee",
              fontSize:
                "12px",
            }}
          >
            Select a state or zoom in to view cities
          </div>
        )}
      </div>


      <div className="geo-map-summary">
        <div>
          <span>
            Monitored Cities
          </span>

          <strong>
            {validZones.length}
          </strong>
        </div>

        <div>
          <span>
            States / UTs
          </span>

          <strong>
            {states.length}
          </strong>
        </div>

        <div>
          <span>
            Highest AQI
          </span>

          <strong>
            {highestAQI}
          </strong>
        </div>

        <div>
          <span>
            Network Status
          </span>

          <strong className="network-online">
            Online
          </strong>
        </div>
      </div>
    </section>
  );
}


export default PollutionMap;