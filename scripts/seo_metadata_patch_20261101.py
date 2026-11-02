#!/usr/bin/env python3
"""Offline, byte-preserving company-8/website-1 HYDRO-BLOK SEO patch for view 7920.

This script NEVER connects to or writes Odoo. Obtain the latest complete view XML
using the approved read-only connector. Do not release without owner approval,
a complete XML backup, production readback, and change-focused browser QA.

  python scripts/seo_metadata_patch_20261101.py self-test
  python scripts/seo_metadata_patch_20261101.py patch --input original.xml --output staged.xml
  python scripts/seo_metadata_patch_20261101.py rollback --input staged.xml --output restored.xml
"""
import argparse
from html import unescape
from pathlib import Path
from types import SimpleNamespace
from xml.etree import ElementTree as ET
from xml.sax.saxutils import escape

ANCHOR = '<xpath expr="//t[@t-call=\'website.layout\']" position="inside">'
TITLE_OLD = """<t t-set="title" t-value="product.website_meta_title if product.website_meta_title and product.website_meta_title != product.name else (product.name + ' | Dalla Terra Tile &amp; Stone')"/>"""
DESC_OLD = """<t t-set="website_meta_description" t-value="'Explore ' + product.name + ' at Dalla Terra Tile &amp; Stone. Compare colours, sizes, specifications, packaging and suggested retail prices. Approved dealers can sign in to order.'"/>"""
GUARD = "website.id == 1 and website.company_id.id == 8"
WALL_TITLE = "HYDRO-BLOK Wallboard Sizes & Thicknesses | Dalla Terra"
PAN_TITLE = "HYDRO-BLOK Standard Drain Shower Pans | Dalla Terra"
WALL_DESC = "Compare HYDRO-BLOK wallboard formats for shower installations. Review product options and public MSRP; approved dealers sign in for assigned pricing."
PAN_DESC = "Explore HYDRO-BLOK shower pan formats and drain-position options. Confirm the selected size, compatible assembly and per-unit price before ordering."
MARKERS = (
    "DT8_HB_FAMILY_COPY_SITE1_ALL_VARIANTS_V2_20261101",
    "DT8_HB_PRICE_HIERARCHY_V1_20261030",
)

def get_expr(tag):
    return unescape(tag.split('t-value="', 1)[1].rsplit('"/>', 1)[0])

def xml_tag(name, expression):
    return '<t t-set="' + name + '" t-value="' + escape(expression, {'"': '&quot;'}) + '"/>'

TITLE_BASE, DESC_BASE = get_expr(TITLE_OLD), get_expr(DESC_OLD)
TITLE_EXPR = (
    f"({WALL_TITLE!r} if {GUARD} and product.id == 6604 else "
    f"({PAN_TITLE!r} if {GUARD} and product.id == 6621 else ({TITLE_BASE})))"
)
DESC_EXPR = (
    f"({WALL_DESC!r} if {GUARD} and product.id == 6604 else "
    f"({PAN_DESC!r} if {GUARD} and product.id == 6621 else ({DESC_BASE})))"
)
TITLE_NEW = xml_tag("title", TITLE_EXPR)
DESC_NEW = xml_tag("website_meta_description", DESC_EXPR)

def transform(source, mode):
    if not source.startswith("<data>") or not source.rstrip().endswith("</data>"):
        raise ValueError("Expected complete QWeb arch_db; refusing partial input")
    if source.count(ANCHOR) != 1 or any(m not in source for m in MARKERS):
        raise ValueError("View baseline or safeguard markers changed; abort")
    before, after = (
        ((TITLE_OLD, TITLE_NEW), (DESC_OLD, DESC_NEW))
        if mode == "patch" else
        ((TITLE_NEW, TITLE_OLD), (DESC_NEW, DESC_OLD))
    )
    block = source[source.index(ANCHOR):source.index(ANCHOR) + 3000]
    for old, _ in (before, after):
        if source.count(old) != 1 or old not in block:
            raise ValueError("Original assignment not unique/in expected block; abort")
    ET.fromstring(source)
    result = source
    for old, new in (before, after):
        result = result.replace(old, new, 1)
    inverse = result
    for old, new in (before, after):
        inverse = inverse.replace(new, old, 1)
    if inverse != source:
        raise AssertionError("Changed bytes beyond two metadata tags")
    ET.fromstring(result)
    return result

def self_test():
    for expr in (TITLE_BASE, DESC_BASE, TITLE_EXPR, DESC_EXPR):
        compile(expr, "<QWeb>", "eval")
    tested = 0
    for wid, cid in ((1, 8), (1, 2), (2, 8), (2, 2)):
        for pid in (6604, 6621, 6606, 1300, 38944):
            for custom_title in ("", "Existing custom product SEO title"):
                product = SimpleNamespace(id=pid, name="Reference Product", website_meta_title=custom_title)
                website = SimpleNamespace(id=wid, company_id=SimpleNamespace(id=cid))
                context = {"website": website, "product": product}
                old_t = eval(TITLE_BASE, {"__builtins__": {}}, context)
                old_d = eval(DESC_BASE, {"__builtins__": {}}, context)
                new_t = eval(TITLE_EXPR, {"__builtins__": {}}, context)
                new_d = eval(DESC_EXPR, {"__builtins__": {}}, context)
                target = wid == 1 and cid == 8 and pid in (6604, 6621)
                if target:
                    assert new_t == (WALL_TITLE if pid == 6604 else PAN_TITLE)
                    assert new_d == (WALL_DESC if pid == 6604 else PAN_DESC)
                else:
                    assert (new_t, new_d) == (old_t, old_d)
                tested += 1
    xml = (
        "<data>\n<!-- " + " ".join(MARKERS) + " -->\n" + ANCHOR + "\n"
        + TITLE_OLD + "\n" + DESC_OLD + "\n</xpath>"
        + '<xpath expr="//form" position="inside"><span>Unrelated &amp; preserved</span></xpath>\n</data>'
    )
    patched = transform(xml, "patch")
    assert transform(patched, "rollback") == xml
    for bad in (xml.replace(MARKERS[0], "missing"), xml.replace(TITLE_OLD, "")):
        try:
            transform(bad, "patch")
        except ValueError:
            continue
        raise AssertionError("Unsafe baseline unexpectedly accepted")
    print(f"PASS: {tested} product/site/title combinations")
    print("PASS: XML syntax, exact two-tag change and byte-for-byte rollback")
    print("PASS: reject altered/missing-marker original")

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("mode", choices=("self-test", "patch", "rollback"))
    parser.add_argument("--input", type=Path)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    if args.mode == "self-test":
        self_test()
        return
    if not args.input or not args.output:
        parser.error("--input and --output are required")
    if args.input.resolve() == args.output.resolve():
        parser.error("Input and output must be different files")
    source = args.input.read_text(encoding="utf-8")
    result = transform(source, args.mode)
    args.output.write_text(result, encoding="utf-8")
    print(f"PASS: offline {args.mode}, input {len(source)} -> output {len(result)} chars")

if __name__ == "__main__":
    main()
