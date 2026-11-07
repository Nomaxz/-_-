"""Import a conservative, attributed subset of the CC0 ROR registry.

Usage: python scripts/import-ror.py /tmp/ror-data.zip /tmp/ror-release.json
Raw registry archives stay outside the project. Re-running replaces only the
generated factual metadata, never tuition, admissions, ratings or source JSON.
"""
import collections
import datetime
import hashlib
import json
from pathlib import Path
import re
import sys
import unicodedata
from urllib.parse import urlparse
import zipfile

ROOT = Path(__file__).resolve().parents[3]
OUTPUT = Path(__file__).resolve().parents[1] / "src/data/university-facts.json"


def normalize(value):
    value = unicodedata.normalize("NFKD", value).casefold()
    value = re.sub(r"^the\s+", "", value.strip())
    return "".join(c for c in value if c.isalnum())


def host(value):
    try:
        parsed = urlparse(value if "://" in value else f"https://{value}")
        return re.sub(r"^www\.", "", parsed.hostname or "").lower()
    except ValueError:
        return ""


def match_record(row, records_by_name):
    # Name/alias AND country must match exactly after punctuation/diacritic
    # normalization. A matching domain resolves ambiguity, not fuzzy names.
    candidates = records_by_name.get(
        (row["alpha_two_code"], normalize(row["name"])), {}
    )
    domains = {host(d) for d in row.get("domains", []) + row.get("web_pages", [])} - {""}
    domain_matches = [
        item for item in candidates.values()
        if domains.intersection(
            {host(d) for d in item.get("domains", [])}
            | {host(link["value"]) for link in item.get("links", [])
               if link["type"] == "website"}
        )
    ]
    if len(domain_matches) == 1:
        return domain_matches[0], "name-country-website"
    if len(candidates) == 1:
        item = next(iter(candidates.values()))
        # Short/generic names need the independent website signal.
        words = re.findall(r"\w+", row["name"], re.UNICODE)
        if len(words) >= 3 and len(normalize(row["name"])) >= 16:
            return item, "name-country"
    return None, None


def main():
    archive, metadata_file = map(Path, sys.argv[1:3])
    release = json.loads(metadata_file.read_text())
    expected = release["files"][0]["checksum"]
    if f"md5:{hashlib.md5(archive.read_bytes()).hexdigest()}" != expected:
        raise ValueError("ROR archive checksum mismatch")
    with zipfile.ZipFile(archive) as z:
        records = json.loads(z.read(next(n for n in z.namelist() if n.endswith(".json"))))
    by_name = collections.defaultdict(dict)
    for record in records:
        if "education" not in record["types"]:
            continue
        for location in record["locations"]:
            country = location["geonames_details"]["country_code"]
            for name in record["names"]:
                if name["types"] == ["acronym"]:
                    continue
                by_name[(country, normalize(name["value"]))][record["id"]] = record
    rows = json.loads((ROOT / "attached_assets/world_universities_and_domains_1793783307017.json").read_text())
    facts = {}
    counts = collections.Counter()
    for row in rows:
        if not row.get("name") or not row.get("country"):
            continue
        record, method = match_record(row, by_name)
        if record is None:
            continue
        country = row["alpha_two_code"]
        cities = sorted({
            loc["geonames_details"]["name"] for loc in record["locations"]
            if loc["geonames_details"]["country_code"] == country
        })
        names = {}
        for name in record["names"]:
            if name["lang"] in ("en", "ru") and "label" in name["types"]:
                names[name["lang"]] = name["value"]
        item = {
            "source": record["id"],
            "sourceName": next(n["value"] for n in record["names"] if "ror_display" in n["types"]),
            "countryCode": country,
            "cities": cities,
            "status": record["status"],
            "sourceUpdatedAt": record["admin"]["last_modified"]["date"],
            "matchMethod": method,
        }
        year = record.get("established")
        if isinstance(year, int) and 1 <= year <= datetime.date.today().year:
            item["established"] = year
        if names:
            item["names"] = names
        facts[f'{country}:{row["name"].strip()}'] = item
        counts[country] += 1
    result = {
        "release": release["doi"],
        "publishedAt": release["metadata"]["publication_date"],
        "importedAt": datetime.date.today().isoformat(),
        "license": "CC0-1.0",
        "institutions": facts,
    }
    OUTPUT.write_text(json.dumps(result, ensure_ascii=False, separators=(",", ":")) + "\n")
    print(f"Matched {len(facts)} institutions in {len(counts)} countries; {OUTPUT.stat().st_size:,} bytes")
    print("Country counts:", counts.most_common())


if __name__ == "__main__":
    main()
