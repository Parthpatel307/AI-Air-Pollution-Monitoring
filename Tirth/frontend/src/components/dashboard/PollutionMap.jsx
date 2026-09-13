import { useEffect, useState } from "react";

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


const INDIA_CENTER = [
  22.5,
  79.0,
];


function isValidCoordinate(item) {
  return (
    item &&
    Number.isFinite(
      Number(item.latitude)
    ) &&
    Number.isFinite(
      Number(item.longitude)
    )
  );
}


function getAQIColor(aqi) {
  const value =
    Number(aqi);

  if (!Number.isFinite(value)) {
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

  return "#ef4444";
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


function SelectedZoneFocus({
  zone,
}) {
  const map = useMap();

  useEffect(() => {
    if (
      !zone ||
      !isValidCoordinate(zone)
    ) {
      return;
    }

    map.flyTo(
      [
        Number(
          zone.latitude
        ),
        Number(
          zone.longitude
        ),
      ],
      Math.max(
        map.getZoom(),
        8
      ),
      {
        duration: 0.8,
      }
    );
  }, [
    zone?.zone_id,
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

  const validZones =
    zones.filter(
      isValidCoordinate
    );

  const validHotspots =
    hotspots.filter(
      isValidCoordinate
    );

  const selectedZone =
    validZones.find(
      (zone) =>
        zone.zone_id ===
        selectedZoneId
    ) || null;

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

  /*
   * State-level view:
   * do not show dozens of labels.
   *
   * City markers start appearing
   * when user manually zooms in.
   */
  const showCities =
    zoom >= 6;

  /*
   * At higher zoom show permanent
   * city name + AQI labels.
   */
  const showCityLabels =
    zoom >= 8;

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
          center={
            INDIA_CENTER
          }
          zoom={5}
          minZoom={4}
          maxZoom={13}
          scrollWheelZoom
          doubleClickZoom
          touchZoom
          dragging
          zoomControl
          style={{
            height: "100%",
            width: "100%",
            background:
              "#071713",
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

          <SelectedZoneFocus
            zone={
              selectedZone
            }
          />

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
                        ? 14
                        : 10
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
                        if (
                          onZoneSelect
                        ) {
                          onZoneSelect(
                            zone.zone_id
                          );
                        }
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
                      <div
                        style={{
                          minWidth:
                            "95px",
                        }}
                      >
                        <strong>
                          {zone.name}
                        </strong>

                        <br />

                        AQI:{" "}
                        <strong>
                          {aqi ??
                            "--"}
                        </strong>
                      </div>
                    </Tooltip>

                    <Popup>
                      <div>
                        <strong>
                          {zone.name}
                        </strong>

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
                      </div>
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
                  radius={12}
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
                    Hotspot AQI:{" "}
                    {hotspot.aqi ??
                      "--"}
                  </Tooltip>

                  <Popup>
                    <strong>
                      Pollution Hotspot
                    </strong>

                    <br />

                    AQI:{" "}
                    {hotspot.aqi ??
                      "--"}
                  </Popup>
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
              "rgba(4, 24, 20, 0.90)",
            border:
              "1px solid rgba(94, 234, 212, 0.18)",
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
              "rgba(4, 24, 20, 0.90)",
            border:
              "1px solid rgba(94, 234, 212, 0.18)",
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
          {" "}
          monitored cities
        </div>

        {!showCities && (
          <div
            style={{
              position:
                "absolute",
              zIndex: 1000,
              bottom:
                "20px",
              left: "50%",
              transform:
                "translateX(-50%)",
              background:
                "rgba(4, 24, 20, 0.92)",
              border:
                "1px solid rgba(94, 234, 212, 0.18)",
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
            Zoom in to view live city AQI
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
            Active Hotspots
          </span>

          <strong>
            {validHotspots.length}
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