from app.database import get_firestore


ZONES = [
    # -----------------------------------------------------
    # Gujarat detailed network
    # -----------------------------------------------------
    {
        "zone_id": "zone_001",
        "name": "Ahmedabad",
        "state": "Gujarat",
        "latitude": 23.0225,
        "longitude": 72.5714,
    },
    {
        "zone_id": "zone_002",
        "name": "Mehsana",
        "state": "Gujarat",
        "latitude": 23.5880,
        "longitude": 72.3693,
    },
    {
        "zone_id": "zone_003",
        "name": "Gandhinagar",
        "state": "Gujarat",
        "latitude": 23.2156,
        "longitude": 72.6369,
    },
    {
        "zone_id": "zone_004",
        "name": "Vadodara",
        "state": "Gujarat",
        "latitude": 22.3072,
        "longitude": 73.1812,
    },
    {
        "zone_id": "zone_005",
        "name": "Surat",
        "state": "Gujarat",
        "latitude": 21.1702,
        "longitude": 72.8311,
    },
    {
        "zone_id": "zone_006",
        "name": "Rajkot",
        "state": "Gujarat",
        "latitude": 22.3039,
        "longitude": 70.8022,
    },
    {
        "zone_id": "zone_007",
        "name": "Bhavnagar",
        "state": "Gujarat",
        "latitude": 21.7645,
        "longitude": 72.1519,
    },
    {
        "zone_id": "zone_008",
        "name": "Jamnagar",
        "state": "Gujarat",
        "latitude": 22.4707,
        "longitude": 70.0577,
    },
    {
        "zone_id": "zone_009",
        "name": "Junagadh",
        "state": "Gujarat",
        "latitude": 21.5222,
        "longitude": 70.4579,
    },
    {
        "zone_id": "zone_010",
        "name": "Anand",
        "state": "Gujarat",
        "latitude": 22.5645,
        "longitude": 72.9289,
    },
    {
        "zone_id": "zone_011",
        "name": "Bhuj",
        "state": "Gujarat",
        "latitude": 23.2420,
        "longitude": 69.6669,
    },

    # -----------------------------------------------------
    # India State / UT capital network
    # -----------------------------------------------------

    {
        "zone_id": "india_ap",
        "name": "Amaravati",
        "state": "Andhra Pradesh",
        "latitude": 16.5062,
        "longitude": 80.6480,
    },
    {
        "zone_id": "india_ar",
        "name": "Itanagar",
        "state": "Arunachal Pradesh",
        "latitude": 27.0844,
        "longitude": 93.6053,
    },
    {
        "zone_id": "india_as",
        "name": "Dispur",
        "state": "Assam",
        "latitude": 26.1433,
        "longitude": 91.7898,
    },
    {
        "zone_id": "india_br",
        "name": "Patna",
        "state": "Bihar",
        "latitude": 25.5941,
        "longitude": 85.1376,
    },
    {
        "zone_id": "india_ct",
        "name": "Raipur",
        "state": "Chhattisgarh",
        "latitude": 21.2514,
        "longitude": 81.6296,
    },
    {
        "zone_id": "india_ga",
        "name": "Panaji",
        "state": "Goa",
        "latitude": 15.4909,
        "longitude": 73.8278,
    },
    {
        "zone_id": "india_hr",
        "name": "Chandigarh",
        "state": "Haryana",
        "latitude": 30.7333,
        "longitude": 76.7794,
    },
    {
        "zone_id": "india_hp",
        "name": "Shimla",
        "state": "Himachal Pradesh",
        "latitude": 31.1048,
        "longitude": 77.1734,
    },
    {
        "zone_id": "india_jh",
        "name": "Ranchi",
        "state": "Jharkhand",
        "latitude": 23.3441,
        "longitude": 85.3096,
    },
    {
        "zone_id": "india_ka",
        "name": "Bengaluru",
        "state": "Karnataka",
        "latitude": 12.9716,
        "longitude": 77.5946,
    },
    {
        "zone_id": "india_kl",
        "name": "Thiruvananthapuram",
        "state": "Kerala",
        "latitude": 8.5241,
        "longitude": 76.9366,
    },
    {
        "zone_id": "india_mp",
        "name": "Bhopal",
        "state": "Madhya Pradesh",
        "latitude": 23.2599,
        "longitude": 77.4126,
    },
    {
        "zone_id": "india_mh",
        "name": "Mumbai",
        "state": "Maharashtra",
        "latitude": 19.0760,
        "longitude": 72.8777,
    },
    {
        "zone_id": "india_mn",
        "name": "Imphal",
        "state": "Manipur",
        "latitude": 24.8170,
        "longitude": 93.9368,
    },
    {
        "zone_id": "india_ml",
        "name": "Shillong",
        "state": "Meghalaya",
        "latitude": 25.5788,
        "longitude": 91.8933,
    },
    {
        "zone_id": "india_mz",
        "name": "Aizawl",
        "state": "Mizoram",
        "latitude": 23.7271,
        "longitude": 92.7176,
    },
    {
        "zone_id": "india_nl",
        "name": "Kohima",
        "state": "Nagaland",
        "latitude": 25.6751,
        "longitude": 94.1086,
    },
    {
        "zone_id": "india_od",
        "name": "Bhubaneswar",
        "state": "Odisha",
        "latitude": 20.2961,
        "longitude": 85.8245,
    },
    {
        "zone_id": "india_pb",
        "name": "Chandigarh",
        "state": "Punjab",
        "latitude": 30.7333,
        "longitude": 76.7794,
    },
    {
        "zone_id": "india_rj",
        "name": "Jaipur",
        "state": "Rajasthan",
        "latitude": 26.9124,
        "longitude": 75.7873,
    },
    {
        "zone_id": "india_sk",
        "name": "Gangtok",
        "state": "Sikkim",
        "latitude": 27.3314,
        "longitude": 88.6138,
    },
    {
        "zone_id": "india_tn",
        "name": "Chennai",
        "state": "Tamil Nadu",
        "latitude": 13.0827,
        "longitude": 80.2707,
    },
    {
        "zone_id": "india_tg",
        "name": "Hyderabad",
        "state": "Telangana",
        "latitude": 17.3850,
        "longitude": 78.4867,
    },
    {
        "zone_id": "india_tr",
        "name": "Agartala",
        "state": "Tripura",
        "latitude": 23.8315,
        "longitude": 91.2868,
    },
    {
        "zone_id": "india_up",
        "name": "Lucknow",
        "state": "Uttar Pradesh",
        "latitude": 26.8467,
        "longitude": 80.9462,
    },
    {
        "zone_id": "india_uk",
        "name": "Dehradun",
        "state": "Uttarakhand",
        "latitude": 30.3165,
        "longitude": 78.0322,
    },
    {
        "zone_id": "india_wb",
        "name": "Kolkata",
        "state": "West Bengal",
        "latitude": 22.5726,
        "longitude": 88.3639,
    },

    # -----------------------------------------------------
    # Union Territories
    # -----------------------------------------------------

    {
        "zone_id": "india_dl",
        "name": "New Delhi",
        "state": "Delhi",
        "latitude": 28.6139,
        "longitude": 77.2090,
    },
    {
        "zone_id": "india_ch",
        "name": "Chandigarh",
        "state": "Chandigarh",
        "latitude": 30.7333,
        "longitude": 76.7794,
    },
    {
        "zone_id": "india_jk",
        "name": "Srinagar",
        "state": "Jammu and Kashmir",
        "latitude": 34.0837,
        "longitude": 74.7973,
    },
    {
        "zone_id": "india_la",
        "name": "Leh",
        "state": "Ladakh",
        "latitude": 34.1526,
        "longitude": 77.5771,
    },
    {
        "zone_id": "india_py",
        "name": "Puducherry",
        "state": "Puducherry",
        "latitude": 11.9416,
        "longitude": 79.8083,
    },
    {
        "zone_id": "india_an",
        "name": "Port Blair",
        "state": "Andaman and Nicobar Islands",
        "latitude": 11.6234,
        "longitude": 92.7265,
    },
    {
        "zone_id": "india_ld",
        "name": "Kavaratti",
        "state": "Lakshadweep",
        "latitude": 10.5667,
        "longitude": 72.6417,
    },
    {
        "zone_id": "india_dn",
        "name": "Daman",
        "state": "Dadra and Nagar Haveli and Daman and Diu",
        "latitude": 20.3974,
        "longitude": 72.8328,
    },
]


def seed_zones():
    db = get_firestore()

    for zone in ZONES:
        db.collection(
            "zones"
        ).document(
            zone["zone_id"]
        ).set(
            {
                "name": zone["name"],
                "state": zone["state"],
                "latitude": zone["latitude"],
                "longitude": zone["longitude"],

                # These are placeholders only.
                # Actual dashboard AQI comes from Open-Meteo.
                "current_aqi": 0.0,
                "risk_level": "UNKNOWN",
            },
            merge=True,
        )

        print(
            f"Added/updated: "
            f"{zone['name']} - "
            f"{zone['state']}"
        )

    print(
        f"\nDone. Total monitored locations: "
        f"{len(ZONES)}"
    )


if __name__ == "__main__":
    seed_zones()