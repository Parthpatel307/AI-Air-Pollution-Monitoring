import {
  useEffect,
  useMemo,
  useState,
} from "react";

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

import {
  getSatelliteNO2Map,
} from "../../services/satelliteService";


const INDIA_CENTER = [
  22.5,
  79.0,
];


function isValidCoordinate(
  item
) {
  return (
    item &&
    Number.isFinite(
      Number(
        item.latitude
      )
    ) &&
    Number.isFinite(
      Number(
        item.longitude
      )
    )
  );
}


function getAQIColor(
  aqi
) {
  const value =
    Number(aqi);

  if (
    !Number.isFinite(value)
  ) {
    return "#94a3b8";
  }

  if (value <= 50) {
    return "#34d399";
  }

  if (value <= 100) {
    return "#fbbf24";
  }

  if (value <= 150) {
    return "#fb923c";
  }

  if (value <= 200) {
    return "#f87171";
  }

  if (value <= 300) {
    return "#a855f7";
  }

  return "#7f1d1d";
}


function ZoomWatcher({
  onZoomChange,
}) {
  const map =
    useMapEvents({
      zoomend() {
        onZoomChange(
          map.getZoom()
        );
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

  useEffect(() => {
    if (cityTarget) {
      map.flyTo(
        [
          Number(
            cityTarget.latitude
          ),
          Number(
            cityTarget.longitude
          ),
        ],
        10,
        {
          duration: 1,
        }
      );

      onActionComplete?.();

      return;
    }

    if (
      stateTarget &&
      stateTarget.length > 0
    ) {
      const bounds =
        stateTarget.map(
          (zone) => [
            Number(
              zone.latitude
            ),
            Number(
              zone.longitude
            ),
          ]
        );

      if (
        bounds.length === 1
      ) {
        map.flyTo(
          bounds[0],
          8,
          {
            duration: 1,
          }
        );
      } else {
        map.fitBounds(
          bounds,
          {
            padding: [
              70,
              70,
            ],
            maxZoom: 8,
          }
        );
      }

      onActionComplete?.();
    }
  }, [
    cityTarget,
    stateTarget,
    map,
    onActionComplete,
  ]);

  return null;
}


function SatelliteMapController({
  enabled,
  center,
}) {
  const map = useMap();

  useEffect(() => {
    if (
      !enabled ||
      !center
    ) {
      return;
    }

    const latitude =
      Number(
        center.latitude
      );

    const longitude =
      Number(
        center.longitude
      );

    if (
      !Number.isFinite(
        latitude
      ) ||
      !Number.isFinite(
        longitude
      )
    ) {
      return;
    }

    map.flyTo(
      [
        latitude,
        longitude,
      ],
      9,
      {
        duration: 1,
      }
    );
  }, [
    enabled,
    center,
    map,
  ]);

  return null;
}


function PollutionMap({
  zones = [],
  hotspots = [],
  selectedZoneId = null,
  onZoneSelect = null,
}) {
  const [
    zoom,
    setZoom,
  ] = useState(5);

  const [
    selectedState,
    setSelectedState,
  ] = useState("");

  const [
    selectedCity,
    setSelectedCity,
  ] = useState("");

  const [
    searchText,
    setSearchText,
  ] = useState("");

  const [
    cityTarget,
    setCityTarget,
  ] = useState(null);

  const [
    stateTarget,
    setStateTarget,
  ] = useState(null);


  /*
   * -------------------------------------------------------
   * MAP MODE
   * -------------------------------------------------------
   */

  const [
    mapMode,
    setMapMode,
  ] = useState("aqi");

  const [
    satelliteMap,
    setSatelliteMap,
  ] = useState(null);

  const [
    satelliteLoading,
    setSatelliteLoading,
  ] = useState(false);

  const [
    satelliteError,
    setSatelliteError,
  ] = useState(null);


  /*
   * -------------------------------------------------------
   * VALID DATA
   * -------------------------------------------------------
   */

  const validZones =
    useMemo(
      () =>
        zones.filter(
          isValidCoordinate
        ),
      [
        zones,
      ]
    );

  const validHotspots =
    useMemo(
      () =>
        hotspots.filter(
          isValidCoordinate
        ),
      [
        hotspots,
      ]
    );


  const states =
    useMemo(() => {
      return [
        ...new Set(
          validZones
            .map(
              (zone) =>
                zone.state
            )
            .filter(Boolean)
        ),
      ].sort(
        (a, b) =>
          a.localeCompare(b)
      );
    }, [
      validZones,
    ]);


  const citiesForState =
    useMemo(() => {
      if (
        !selectedState
      ) {
        return [];
      }

      return validZones
        .filter(
          (zone) =>
            zone.state ===
            selectedState
        )
        .sort(
          (a, b) =>
            a.name.localeCompare(
              b.name
            )
        );
    }, [
      selectedState,
      validZones,
    ]);


  const searchOptions =
    useMemo(() => {
      return validZones
        .map(
          (zone) => ({
            ...zone,

            searchLabel:
              `${zone.name}, ${zone.state}`,
          })
        )
        .sort(
          (a, b) =>
            a.searchLabel.localeCompare(
              b.searchLabel
            )
        );
    }, [
      validZones,
    ]);


  const selectedZone =
    useMemo(
      () =>
        validZones.find(
          (zone) =>
            zone.zone_id ===
            selectedZoneId
        ) || null,
      [
        validZones,
        selectedZoneId,
      ]
    );


  const highestAQI =
    Math.max(
      ...validZones.map(
        (zone) =>
          Number(
            zone.current_aqi ??
              zone.aqi ??
              0
          )
      ),

      ...validHotspots.map(
        (hotspot) =>
          Number(
            hotspot.aqi ??
              0
          )
      ),

      0
    );


  const showCities =
    zoom >= 6;

  const showCityLabels =
    zoom >= 9;


  /*
   * -------------------------------------------------------
   * SYNC HEADER / GLOBAL SELECTED ZONE
   * -------------------------------------------------------
   */

  useEffect(() => {
    if (!selectedZone) {
      return;
    }

    setSelectedState(
      selectedZone.state ||
        ""
    );

    setSelectedCity(
      selectedZone.zone_id
    );

    setSearchText(
      `${selectedZone.name}, ${selectedZone.state}`
    );
  }, [
    selectedZone,
  ]);


  /*
   * -------------------------------------------------------
   * LOAD EARTH ENGINE MAP
   * -------------------------------------------------------
   */

  useEffect(() => {
    let cancelled =
      false;

    async function loadSatelliteMap() {
      if (
        mapMode !==
          "satellite" ||
        !selectedZoneId
      ) {
        return;
      }

      setSatelliteLoading(
        true
      );

      setSatelliteError(
        null
      );

      setSatelliteMap(
        null
      );

      try {
        const result =
          await getSatelliteNO2Map(
            selectedZoneId,
            5
          );

        if (cancelled) {
          return;
        }

        if (
          !result?.success ||
          !result?.tile_url
        ) {
          throw new Error(
            result?.message ||
              "No satellite map is available for this zone."
          );
        }

        setSatelliteMap(
          result
        );
      } catch (error) {
        if (!cancelled) {
          setSatelliteError(
            error?.message ||
              "Unable to load satellite NO2 map."
          );
        }
      } finally {
        if (!cancelled) {
          setSatelliteLoading(
            false
          );
        }
      }
    }

    loadSatelliteMap();

    return () => {
      cancelled = true;
    };
  }, [
    mapMode,
    selectedZoneId,
  ]);


  /*
   * -------------------------------------------------------
   * MAP ACTIONS
   * -------------------------------------------------------
   */

  function clearMapAction() {
    setCityTarget(
      null
    );

    setStateTarget(
      null
    );
  }


  function handleStateChange(
    event
  ) {
    const state =
      event.target.value;

    setSelectedState(
      state
    );

    setSelectedCity(
      ""
    );

    if (!state) {
      setStateTarget(
        null
      );

      return;
    }

    const matchingZones =
      validZones.filter(
        (zone) =>
          zone.state ===
          state
      );

    setCityTarget(
      null
    );

    setStateTarget(
      matchingZones
    );
  }


  function selectCity(
    zone
  ) {
    if (!zone) {
      return;
    }

    setSelectedState(
      zone.state ||
        ""
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

    setStateTarget(
      null
    );

    setCityTarget(
      zone
    );
  }


  function handleCityChange(
    event
  ) {
    const zoneId =
      event.target.value;

    setSelectedCity(
      zoneId
    );

    const zone =
      validZones.find(
        (item) =>
          item.zone_id ===
          zoneId
      );

    if (zone) {
      selectCity(
        zone
      );
    }
  }


  function handleSearchChange(
    event
  ) {
    const value =
      event.target.value;

    setSearchText(
      value
    );

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
      selectCity(
        match
      );
    }
  }


  /*
   * -------------------------------------------------------
   * VIEW
   * -------------------------------------------------------
   */

  return (
    <section className="card geo-map-card">

      {/* HEADER */}

      <div className="card-header">

        <div>
          <span className="card-kicker">
            {mapMode ===
            "satellite"
              ? "SATELLITE GEO INTELLIGENCE"
              : "LIVE GEO MONITORING"}
          </span>

          <h2>
            Pollution Map
          </h2>
        </div>


        <div className="geo-map-status">
          <span className="status-dot" />

          {mapMode ===
          "satellite"
            ? "SATELLITE"
            : "LIVE"}
        </div>

      </div>


      {/* MODE BUTTONS */}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginBottom: "14px",
        }}
      >
        <button
          type="button"
          onClick={() =>
            setMapMode(
              "aqi"
            )
          }
          style={{
            padding:
              "9px 14px",

            borderRadius:
              "10px",

            border:
              mapMode ===
              "aqi"
                ? "1px solid #2dd4bf"
                : "1px solid rgba(94,234,212,.18)",

            background:
              mapMode ===
              "aqi"
                ? "rgba(45,212,191,.14)"
                : "#071713",

            color:
              mapMode ===
              "aqi"
                ? "#5eead4"
                : "#94a3b8",

            fontWeight:
              700,

            cursor:
              "pointer",
          }}
        >
          LIVE AQI
        </button>


        <button
          type="button"
          disabled={
            !selectedZoneId
          }
          onClick={() =>
            setMapMode(
              "satellite"
            )
          }
          style={{
            padding:
              "9px 14px",

            borderRadius:
              "10px",

            border:
              mapMode ===
              "satellite"
                ? "1px solid #38bdf8"
                : "1px solid rgba(94,234,212,.18)",

            background:
              mapMode ===
              "satellite"
                ? "rgba(56,189,248,.14)"
                : "#071713",

            color:
              mapMode ===
              "satellite"
                ? "#7dd3fc"
                : "#94a3b8",

            fontWeight:
              700,

            cursor:
              selectedZoneId
                ? "pointer"
                : "not-allowed",

            opacity:
              selectedZoneId
                ? 1
                : 0.5,
          }}
        >
          SATELLITE NO₂
        </button>
      </div>


      {/* MAP FILTERS */}

      <div
        style={{
          display:
            "grid",

          gridTemplateColumns:
            "1fr 1fr 1.4fr",

          gap:
            "12px",

          marginBottom:
            "14px",
        }}
      >

        {/* STATE */}

        <select
          value={
            selectedState
          }
          onChange={
            handleStateChange
          }
          style={{
            width:
              "100%",

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

            outline:
              "none",
          }}
        >
          <option value="">
            Select State
          </option>

          {states.map(
            (state) => (
              <option
                key={
                  state
                }
                value={
                  state
                }
              >
                {state}
              </option>
            )
          )}
        </select>


        {/* CITY */}

        <select
          value={
            selectedCity
          }
          onChange={
            handleCityChange
          }
          disabled={
            !selectedState
          }
          style={{
            width:
              "100%",

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

            outline:
              "none",

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


        {/* SEARCH */}

        <div
          style={{
            display:
              "flex",

            gap:
              "8px",
          }}
        >
          <input
            list="pollution-city-search"
            value={
              searchText
            }
            onChange={
              handleSearchChange
            }
            onKeyDown={(
              event
            ) => {
              if (
                event.key ===
                "Enter"
              ) {
                handleSearchSubmit();
              }
            }}
            placeholder="Search city or state..."
            style={{
              width:
                "100%",

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

              outline:
                "none",
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

              border:
                "none",

              borderRadius:
                "10px",

              background:
                "#2dd4bf",

              color:
                "#03201b",

              fontWeight:
                700,

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
          height:
            "560px",

          width:
            "100%",

          borderRadius:
            "18px",

          overflow:
            "hidden",

          position:
            "relative",
        }}
      >
        <MapContainer
          center={
            INDIA_CENTER
          }
          zoom={5}
          minZoom={4}
          maxZoom={14}
          scrollWheelZoom
          doubleClickZoom
          touchZoom
          dragging
          zoomControl
          style={{
            height:
              "100%",

            width:
              "100%",

            background:
              "#071713",
          }}
        >

          {/* BASE MAP */}

          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />


          {/* EARTH ENGINE SATELLITE OVERLAY */}

          {mapMode ===
            "satellite" &&
            satelliteMap
              ?.tile_url && (
              <TileLayer
                key={
                  satelliteMap
                    .tile_url
                }
                url={
                  satelliteMap
                    .tile_url
                }
                opacity={
                  0.68
                }
                attribution="Sentinel-5P / Google Earth Engine"
              />
            )}


          <ZoomWatcher
            onZoomChange={
              setZoom
            }
          />


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


          <SatelliteMapController
            enabled={
              mapMode ===
              "satellite"
            }
            center={
              satelliteMap
                ?.center
            }
          />


          {/* LIVE AQI CITY MARKERS */}

          {mapMode ===
            "aqi" &&
            showCities &&
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
                      opacity={
                        0.95
                      }
                    >
                      <strong>
                        {zone.name}
                      </strong>

                      <br />

                      {zone.state}

                      <br />

                      AQI:{" "}

                      <strong>
                        {aqi ??
                          "--"}
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
                        "--"}{" "}
                      °C
                    </Popup>

                  </CircleMarker>
                );
              }
            )}


          {/* HOTSPOTS */}

          {mapMode ===
            "aqi" &&
            showCities &&
            validHotspots.map(
              (
                hotspot
              ) => (
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
                  radius={
                    11
                  }
                  pathOptions={{
                    color:
                      "#ffffff",

                    fillColor:
                      "#ef4444",

                    fillOpacity:
                      0.9,

                    weight:
                      2,
                  }}
                >
                  <Tooltip>
                    Pollution Hotspot
                  </Tooltip>
                </CircleMarker>
              )
            )}

        </MapContainer>


        {/* TOP LEFT MAP STATUS */}

        <div
          style={{
            position:
              "absolute",

            zIndex:
              1000,

            top:
              "15px",

            left:
              "55px",

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
          {mapMode ===
          "satellite"
            ? "Sentinel-5P NO₂"
            : "India Live Network"}

          {" • "}

          Zoom {zoom}
        </div>


        {/* TOP RIGHT STATUS */}

        <div
          style={{
            position:
              "absolute",

            zIndex:
              1000,

            top:
              "15px",

            right:
              "15px",

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
          {mapMode ===
          "satellite"
            ? (
              satelliteMap
                ?.zone_name ||
              selectedZone
                ?.name ||
              "Selected zone"
            )
            : (
              <>
                {validZones.length}
                {" monitored cities"}
              </>
            )}
        </div>


        {/* SATELLITE LOADING */}

        {mapMode ===
          "satellite" &&
          satelliteLoading && (
            <div
              style={{
                position:
                  "absolute",

                zIndex:
                  1200,

                top:
                  "65px",

                left:
                  "50%",

                transform:
                  "translateX(-50%)",

                padding:
                  "9px 14px",

                borderRadius:
                  "10px",

                background:
                  "rgba(4,24,20,.94)",

                border:
                  "1px solid rgba(56,189,248,.35)",

                color:
                  "#7dd3fc",

                fontSize:
                  "12px",
              }}
            >
              Loading Sentinel-5P NO₂ layer...
            </div>
          )}


        {/* SATELLITE ERROR */}

        {mapMode ===
          "satellite" &&
          satelliteError && (
            <div
              style={{
                position:
                  "absolute",

                zIndex:
                  1200,

                top:
                  "65px",

                left:
                  "50%",

                transform:
                  "translateX(-50%)",

                maxWidth:
                  "80%",

                padding:
                  "9px 14px",

                borderRadius:
                  "10px",

                background:
                  "rgba(60,10,10,.94)",

                border:
                  "1px solid rgba(248,113,113,.4)",

                color:
                  "#fca5a5",

                fontSize:
                  "12px",

                textAlign:
                  "center",
              }}
            >
              {satelliteError}
            </div>
          )}


        {/* SATELLITE LEGEND */}

        {mapMode ===
          "satellite" &&
          satelliteMap
            ?.tile_url && (
            <div
              style={{
                position:
                  "absolute",

                zIndex:
                  1100,

                right:
                  "16px",

                bottom:
                  "18px",

                width:
                  "185px",

                padding:
                  "12px",

                borderRadius:
                  "12px",

                background:
                  "rgba(4,24,20,.92)",

                border:
                  "1px solid rgba(56,189,248,.28)",

                color:
                  "#d8f5ee",

                pointerEvents:
                  "none",
              }}
            >
              <div
                style={{
                  fontSize:
                    "11px",

                  fontWeight:
                    700,

                  marginBottom:
                    "8px",
                }}
              >
                Sentinel-5P NO₂
              </div>


              <div
                style={{
                  height:
                    "10px",

                  borderRadius:
                    "999px",

                  background:
                    "linear-gradient(to right, black, blue, purple, cyan, green, yellow, red)",

                  marginBottom:
                    "6px",
                }}
              />


              <div
                style={{
                  display:
                    "flex",

                  justifyContent:
                    "space-between",

                  fontSize:
                    "9px",

                  color:
                    "#94a3b8",
                }}
              >
                <span>
                  Lower
                </span>

                <span>
                  Higher
                </span>
              </div>


              <div
                style={{
                  marginTop:
                    "8px",

                  fontSize:
                    "9px",

                  color:
                    "#64748b",
                }}
              >
                0 – 200 µmol/m²
              </div>
            </div>
          )}


        {/* AQI ZOOM HELP */}

        {mapMode ===
          "aqi" &&
          !showCities && (
            <div
              style={{
                position:
                  "absolute",

                zIndex:
                  1000,

                bottom:
                  "20px",

                left:
                  "50%",

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


      {/* SUMMARY */}

      {mapMode ===
      "aqi" ? (
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
      ) : (
        <div className="geo-map-summary">

          <div>
            <span>
              Satellite Zone
            </span>

            <strong>
              {satelliteMap
                ?.zone_name ||
                selectedZone
                  ?.name ||
                "--"}
            </strong>
          </div>


          <div>
            <span>
              Analysis Window
            </span>

            <strong>
              {satelliteMap
                ?.period_days ||
                5} Days
            </strong>
          </div>


          <div>
            <span>
              Satellite Images
            </span>

            <strong>
              {satelliteMap
                ?.image_count ??
                "--"}
            </strong>
          </div>


          <div>
            <span>
              Layer Status
            </span>

            <strong
              className={
                satelliteError
                  ? ""
                  : "network-online"
              }
            >
              {satelliteLoading
                ? "Loading"
                : satelliteError
                ? "Unavailable"
                : satelliteMap
                ? "Online"
                : "Waiting"}
            </strong>
          </div>

        </div>
      )}

    </section>
  );
}


export default PollutionMap;