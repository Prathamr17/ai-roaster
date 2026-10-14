import io
from typing import Any, Dict, Tuple

from pypdf import PdfReader
from pypdf.errors import PdfReadError

from app.core.errors import ApiError


async def extract_text(data: bytes) -> Tuple[str, Dict[str, Any]]:
    try:
        reader = PdfReader(io.BytesIO(data))
        pages_text = []
        for page in reader.pages:
            pages_text.append(page.extract_text() or "")
        text = "\n".join(pages_text).strip()

        if not text or len(text) < 50:
            raise ApiError.bad_request(
                "Could not extract readable text \u2013 is this a scanned/image-only PDF?"
            )

        return text, {"numPages": len(reader.pages)}
    except ApiError:
        raise
    except PdfReadError as err:
        raise ApiError.bad_request(f"Failed to parse PDF: {err}")
    except Exception as err:  # noqa: BLE001
        raise ApiError.bad_request(f"Failed to parse PDF: {err}")
