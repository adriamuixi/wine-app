#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
import time
import unicodedata
import urllib.parse
import urllib.request
from urllib.error import HTTPError
from pathlib import Path


TARGETS: list[tuple[str, str]] = [
    ("AR", "Cuyo"),
    ("AR", "Mendoza"),
    ("AR", "Patagonia"),
    ("AR", "Salta"),
    ("AU", "New South Wales"),
    ("AU", "South Australia"),
    ("AU", "Victoria"),
    ("AU", "Western Australia"),
    ("CL", "Aconcagua"),
    ("CL", "Central Valley"),
    ("CL", "Coquimbo"),
    ("FR", "Alsace"),
    ("FR", "Beaujolais"),
    ("FR", "Bordeaux"),
    ("FR", "Bourgogne"),
    ("FR", "Champagne"),
    ("FR", "Languedoc-Roussillon"),
    ("FR", "Provence"),
    ("FR", "Sud-Ouest"),
    ("FR", "Vallée du Loire"),
    ("FR", "Vallée du Rhône"),
    ("DE", "Baden"),
    ("DE", "Franken"),
    ("DE", "Mosel"),
    ("DE", "Nahe"),
    ("DE", "Pfalz"),
    ("DE", "Rheingau"),
    ("DE", "Rheinhessen"),
    ("IT", "Campania"),
    ("IT", "Lombardy"),
    ("IT", "Piedmont"),
    ("IT", "Sicily"),
    ("IT", "Tuscany"),
    ("IT", "Veneto"),
    ("IT", "Verona"),
    ("PT", "Alentejo"),
    ("PT", "Beira Alta"),
    ("PT", "Douro"),
    ("PT", "Madeira"),
    ("PT", "Minho"),
    ("ZA", "Cape South Coast"),
    ("ZA", "Coastal Region"),
    ("US", "California"),
    ("US", "Idaho"),
    ("US", "New York"),
    ("US", "Oregon"),
    ("US", "Texas"),
    ("US", "Virginia"),
    ("US", "Washington"),
]

COUNTRY_HINTS = {
    "AR": "Argentina",
    "AU": "Australia",
    "CL": "Chile",
    "FR": "France",
    "DE": "Germany",
    "IT": "Italy",
    "PT": "Portugal",
    "ZA": "South Africa",
    "US": "United States",
}

MANUAL_QUERIES = {
    ("FR", "Bourgogne"): ["flag of Burgundy", "Burgundy flag"],
    ("FR", "Sud-Ouest"): ["Gascony flag", "flag of Gascony"],
    ("FR", "Vallée du Loire"): ["flag of Anjou", "Anjou flag"],
    ("FR", "Vallée du Rhône"): ["flag of Dauphiné", "Dauphine flag"],
    ("FR", "Bordeaux"): ["flag of Guyenne", "Guyenne flag"],
    ("FR", "Champagne"): ["flag of Champagne", "Champagne-Ardenne flag"],
    ("IT", "Veneto"): ["flag of Veneto", "Veneto flag"],
    ("IT", "Verona"): ["flag of Verona", "Verona flag"],
    ("PT", "Beira Alta"): ["flag of Beira", "Beira Alta flag"],
    ("ZA", "Cape South Coast"): ["Western Cape flag", "flag of Western Cape"],
    ("ZA", "Coastal Region"): ["Western Cape flag", "flag of Western Cape"],
    ("CL", "Central Valley"): ["flag of Maule Region", "Maule Region flag"],
}

COMMONS_API = "https://commons.wikimedia.org/w/api.php"
BAD_URL_PATTERNS = [
    "palawan",
    "araucan",
    "summit.jpg",
    "bundespostflaggenbanner",
    "george_%28western_cape%29",
]


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-zA-Z0-9]+", "_", ascii_value).strip("_").lower()
    return f"{slug}.png"


def fetch_json(url: str) -> dict:
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "wine-app-region-flag-fetcher/1.0 (local dev tool)"
        },
    )
    for attempt in range(4):
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                time.sleep(0.35)
                return json.loads(response.read().decode("utf-8"))
        except HTTPError as exc:
            if exc.code != 429 or attempt == 3:
                raise
            time.sleep(2.5 * (attempt + 1))
    raise RuntimeError("unreachable")


def search_file(query: str) -> str | None:
    params = {
        "action": "query",
        "format": "json",
        "generator": "search",
        "gsrnamespace": "6",
        "gsrlimit": "8",
        "gsrsearch": query,
        "prop": "imageinfo",
        "iiprop": "url",
        "iiurlwidth": "330",
    }
    url = f"{COMMONS_API}?{urllib.parse.urlencode(params)}"
    data = fetch_json(url)
    pages = list(data.get("query", {}).get("pages", {}).values())
    preferred = sorted(
        pages,
        key=lambda page: (
            "flag" not in page.get("title", "").lower(),
            "coat" in page.get("title", "").lower(),
            page.get("index", 999),
        ),
    )

    for page in preferred:
        title = page.get("title", "")
        if not title.startswith("File:"):
            continue
        image_info = page.get("imageinfo", [])
        if not image_info:
            continue
        thumb_url = image_info[0].get("thumburl") or image_info[0].get("url")
        if thumb_url and not any(pattern in thumb_url.lower() for pattern in BAD_URL_PATTERNS):
            return thumb_url

    return None


def candidate_queries(country_code: str, region: str) -> list[str]:
    country = COUNTRY_HINTS[country_code]
    queries = MANUAL_QUERIES.get((country_code, region), []).copy()
    queries.extend(
        [
            f"flag of {region}",
            f"{region} flag",
            f"flag of {region} {country}",
            f"{region} {country} flag",
        ]
    )
    return queries


def download(url: str, target: Path) -> None:
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "wine-app-region-flag-fetcher/1.0 (local dev tool)"
        },
    )
    for attempt in range(5):
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                target.write_bytes(response.read())
                time.sleep(0.5)
                return
        except HTTPError as exc:
            if exc.code != 429 or attempt == 4:
                raise
            time.sleep(3.0 * (attempt + 1))


def main() -> int:
    target_dir = Path("shared/public/images/flags/regions")
    target_dir.mkdir(parents=True, exist_ok=True)

    failures: list[str] = []

    for country_code, region in TARGETS:
        filename = slugify(region)
        output_path = target_dir / filename

        if output_path.exists():
            print(f"SKIP {country_code} {region} -> {filename}")
            continue

        found_url = None
        for query in candidate_queries(country_code, region):
            try:
                found_url = search_file(query)
            except Exception as exc:  # noqa: BLE001
                print(f"ERROR search {country_code} {region} query={query!r}: {exc}", file=sys.stderr)
                continue
            if found_url:
                print(f"FOUND {country_code} {region} query={query!r} -> {found_url}")
                break

        if not found_url:
            failures.append(f"{country_code}\t{region}\tNOT_FOUND")
            continue

        try:
            download(found_url, output_path)
        except Exception as exc:  # noqa: BLE001
            failures.append(f"{country_code}\t{region}\tDOWNLOAD_ERROR\t{exc}")
            continue

    if failures:
        print("\nFailures:", file=sys.stderr)
        for failure in failures:
            print(failure, file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
