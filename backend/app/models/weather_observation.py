from datetime import date

from sqlalchemy import Date, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class WeatherObservation(Base):
    __tablename__ = "weather_observations"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    farm_id: Mapped[int] = mapped_column(
        ForeignKey("farms.id"),
        nullable=False,
        index=True,
    )

    observation_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        index=True,
    )

    temperature: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    precipitation: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    humidity: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    wind_speed: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    solar_radiation: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    latitude: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    longitude: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    source: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="NASA POWER",
    )