import httpx


NASA_POWER_BASE_URL = (
    "https://power.larc.nasa.gov/api/temporal/daily/point"
)


async def get_power_daily_data(
    latitude: float,
    longitude: float,
    start_date: str,
    end_date: str,
):
    params = {
        "parameters": (
            "T2M,"
            "PRECTOTCORR,"
            "RH2M,"
            "WS10M,"
            "ALLSKY_SFC_SW_DWN"
        ),
        "community": "AG",
        "longitude": longitude,
        "latitude": latitude,
        "start": start_date,
        "end": end_date,
        "format": "JSON",
        "time-standard": "LST",
    }

    async with httpx.AsyncClient(timeout=60.0) as client:

        response = await client.get(
            NASA_POWER_BASE_URL,
            params=params,
        )

        response.raise_for_status()

        return response.json()