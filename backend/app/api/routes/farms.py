from fastapi import APIRouter, HTTPException, Query
from pyproj import Geod
from shapely.geometry import shape, mapping
from geoalchemy2.shape import from_shape, to_shape
from sqlalchemy import select
from sqlalchemy.orm import Session
from datetime import date, timedelta

from app.models.weather_observation import WeatherObservation
from app.services.nasa.power import get_power_daily_data

from app.database.connection import engine
from app.models.farm import Farm
from app.schemas.farm import (
    FarmAreaResponse,
    FarmBoundaryRequest,
)


router = APIRouter(
    prefix="/api/farms",
    tags=["Farms"],
)

geod = Geod(ellps="WGS84")


@router.post(
    "/calculate-area",
    response_model=FarmAreaResponse,
)
def calculate_farm_area(data: FarmBoundaryRequest):

    try:
        geometry = shape(data.boundary)

        if geometry.geom_type != "Polygon":
            raise HTTPException(
                status_code=400,
                detail="Farm boundary must be a Polygon.",
            )

        if not geometry.is_valid:
            raise HTTPException(
                status_code=400,
                detail="Farm boundary geometry is invalid.",
            )

        area_square_meters, _ = geod.geometry_area_perimeter(
            geometry
        )

        area_square_meters = abs(area_square_meters)

        area_hectare = area_square_meters / 10_000

        return {
            "name": data.name,
            "area_hectare": round(area_hectare, 4),
            "boundary": data.boundary,
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid farm boundary: {str(e)}",
        )


@router.post("/save")
def save_farm(data: FarmBoundaryRequest):

    try:
        geometry = shape(data.boundary)

        if geometry.geom_type != "Polygon":
            raise HTTPException(
                status_code=400,
                detail="Farm boundary must be a Polygon.",
            )

        if not geometry.is_valid:
            raise HTTPException(
                status_code=400,
                detail="Farm boundary geometry is invalid.",
            )

        area_square_meters, _ = geod.geometry_area_perimeter(
            geometry
        )

        area_square_meters = abs(area_square_meters)

        area_hectare = area_square_meters / 10_000

        farm = Farm(
            name=data.name,
            area_hectare=round(area_hectare, 4),
            boundary=from_shape(
                geometry,
                srid=4326,
            ),
        )

        with Session(engine) as db:

            db.add(farm)

            db.commit()

            db.refresh(farm)

            return {
                "message": "Farm saved successfully",
                "farm_id": farm.id,
                "name": farm.name,
                "area_hectare": farm.area_hectare,
            }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to save farm: {str(e)}",
        )
@router.get("")
def get_farms():

    with Session(engine) as db:

        result = db.execute(
            select(Farm).order_by(Farm.id.desc())
        )

        farms = result.scalars().all()

        return [
            {
                "id": farm.id,
                "name": farm.name,
                "area_hectare": farm.area_hectare,
                "created_at": (
                    farm.created_at.isoformat()
                    if farm.created_at
                    else None
                ),
            }
            for farm in farms
        ]
@router.get("/{farm_id}")
def get_farm(farm_id: int):

    with Session(engine) as db:

        farm = db.get(Farm, farm_id)

        if farm is None:
            raise HTTPException(
                status_code=404,
                detail="Farm not found.",
            )

        boundary_geometry = to_shape(farm.boundary)

        return {
            "id": farm.id,
            "name": farm.name,
            "area_hectare": farm.area_hectare,
            "boundary": mapping(boundary_geometry),
            "created_at": (
                farm.created_at.isoformat()
                if farm.created_at
                else None
            ),
        }
@router.get("/{farm_id}/weather")
async def get_farm_weather(
    farm_id: int,
    start_date: date | None = Query(
        default=None,
        description="Start date in YYYY-MM-DD format",
    ),
    end_date: date | None = Query(
        default=None,
        description="End date in YYYY-MM-DD format",
    ),
):

    # Default: last 30 days
    if end_date is None:
        end_date = date.today()

    if start_date is None:
        start_date = end_date - timedelta(days=29)

    if start_date > end_date:
        raise HTTPException(
            status_code=400,
            detail="start_date cannot be after end_date.",
        )

    # ---------------------------------
    # 1. Get farm
    # ---------------------------------

    with Session(engine) as db:

        farm = db.get(Farm, farm_id)

        if farm is None:
            raise HTTPException(
                status_code=404,
                detail="Farm not found.",
            )

        # ---------------------------------
        # 2. Get farm centroid
        # ---------------------------------

        boundary_geometry = to_shape(farm.boundary)

        centroid = boundary_geometry.centroid

        longitude = centroid.x
        latitude = centroid.y

    # ---------------------------------
    # 3. Request NASA POWER data
    # ---------------------------------

    try:

        nasa_data = await get_power_daily_data(
            latitude=latitude,
            longitude=longitude,
            start_date=start_date.strftime("%Y%m%d"),
            end_date=end_date.strftime("%Y%m%d"),
        )

    except Exception as e:

        raise HTTPException(
            status_code=502,
            detail=f"NASA POWER request failed: {str(e)}",
        )

    # ---------------------------------
    # 4. Extract NASA parameters
    # ---------------------------------

    try:

        parameters = nasa_data["properties"]["parameter"]

        temperature_data = parameters.get("T2M", {})
        precipitation_data = parameters.get(
            "PRECTOTCORR",
            {},
        )
        humidity_data = parameters.get(
            "RH2M",
            {},
        )
        wind_data = parameters.get(
            "WS10M",
            {},
        )
        solar_data = parameters.get(
            "ALLSKY_SFC_SW_DWN",
            {},
        )

    except KeyError:

        raise HTTPException(
            status_code=502,
            detail="Unexpected NASA POWER response format.",
        )

    # ---------------------------------
    # 5. Save observations
    # ---------------------------------

    saved_records = []

    with Session(engine) as db:

        for date_key in temperature_data.keys():

            observation_date = date(
                int(date_key[0:4]),
                int(date_key[4:6]),
                int(date_key[6:8]),
            )

            def clean_value(data, key):

                value = data.get(key)

                if value is None:
                    return None

                if value == -999:
                    return None

                return float(value)

            temperature = clean_value(
                temperature_data,
                date_key,
            )

            precipitation = clean_value(
                precipitation_data,
                date_key,
            )

            humidity = clean_value(
                humidity_data,
                date_key,
            )

            wind_speed = clean_value(
                wind_data,
                date_key,
            )

            solar_radiation = clean_value(
                solar_data,
                date_key,
            )

            # Check if record already exists
            existing = db.execute(
                select(WeatherObservation).where(
                    WeatherObservation.farm_id == farm_id,
                    WeatherObservation.observation_date
                    == observation_date,
                )
            ).scalar_one_or_none()

            if existing:

                existing.temperature = temperature
                existing.precipitation = precipitation
                existing.humidity = humidity
                existing.wind_speed = wind_speed
                existing.solar_radiation = solar_radiation
                existing.latitude = latitude
                existing.longitude = longitude
                existing.source = "NASA POWER"

            else:

                observation = WeatherObservation(
                    farm_id=farm_id,
                    observation_date=observation_date,
                    temperature=temperature,
                    precipitation=precipitation,
                    humidity=humidity,
                    wind_speed=wind_speed,
                    solar_radiation=solar_radiation,
                    latitude=latitude,
                    longitude=longitude,
                    source="NASA POWER",
                )

                db.add(observation)

            saved_records.append(
                {
                    "date": observation_date.isoformat(),
                    "temperature": temperature,
                    "precipitation": precipitation,
                    "humidity": humidity,
                    "wind_speed": wind_speed,
                    "solar_radiation": solar_radiation,
                }
            )

        db.commit()

    # ---------------------------------
    # 6. Return result
    # ---------------------------------

    return {
        "farm_id": farm_id,
        "farm_name": farm.name,
        "source": "NASA POWER",
        "community": "AG",
        "latitude": round(latitude, 6),
        "longitude": round(longitude, 6),
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "records": saved_records,
        "record_count": len(saved_records),
    }