import unittest
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

spec = spec_from_file_location("import_ror", Path(__file__).with_name("import-ror.py"))
importer = module_from_spec(spec)
spec.loader.exec_module(importer)


class MatchingTests(unittest.TestCase):
    def row(self, name="Example State University", country="US", domain="example.edu"):
        return {"name": name, "alpha_two_code": country, "domains": [domain], "web_pages": []}

    def record(self, domain="example.edu"):
        return {"domains": [domain], "links": []}

    def test_exact_name_and_country_with_matching_website(self):
        record = self.record()
        index = {("US", importer.normalize("Example State University")): {"ror1": record}}
        self.assertEqual(importer.match_record(self.row(), index), (record, "name-country-website"))
        self.assertEqual(importer.match_record(self.row(country="CA"), index), (None, None))
        self.assertEqual(importer.match_record(self.row(name="Example State University Branch"), index), (None, None))
        self.assertEqual(importer.normalize("The Example State University"), importer.normalize("Example State University"))

    def test_ambiguous_names_require_one_matching_domain(self):
        first, second = self.record(), self.record("different.edu")
        index = {("US", importer.normalize("Example State University")): {"ror1": first, "ror2": second}}
        self.assertEqual(importer.match_record(self.row(), index)[0], first)
        self.assertEqual(importer.match_record(self.row(domain="unknown.edu"), index), (None, None))

    def test_shared_domain_does_not_resolve_ambiguous_records(self):
        index = {("US", importer.normalize("Example State University")): {"ror1": self.record(), "ror2": self.record()}}
        self.assertEqual(importer.match_record(self.row(), index), (None, None))

    def test_short_names_need_website_signal_and_domains_are_exact(self):
        index = {("US", importer.normalize("Example Uni")): {"ror1": self.record()}}
        self.assertEqual(importer.match_record(self.row(name="Example Uni", domain="example.edu.evil.test"), index), (None, None))
        self.assertEqual(importer.match_record(self.row(name="Example Uni"), index)[1], "name-country-website")


if __name__ == "__main__":
    unittest.main()
