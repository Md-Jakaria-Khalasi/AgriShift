from datetime import datetime

from geoalchemy2 import Geometry
from sqlalchemy import DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base
from geoalchemy2.shape import from_shape, to_shape
from shapely.geometry import mapping


class Farm(Base):
    __tablename__ = "farms"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    area_hectare: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    boundary = mapped_column(
        Geometry(
            geometry_type="POLYGON",
            srid=4326,
            spatial_index=True,
        ),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )


    