import io
import json
import sys
import tempfile
import unittest
from contextlib import redirect_stdout
from pathlib import Path
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "scripts"))

import fetch_wager_leaderboards as wager  # noqa: E402
from lib import output  # noqa: E402

PAYLOAD = {
    "leaderboard": [{"rank": 1, "username": "J*****d", "wagered": "156,476", "prize": 3000, "img": "https://cdn/x.webp"}],
    "start_date": 1790000000,
    "end_date": 1793480700,
}


def fake_urlopen(responses):
    """Returns an urlopen replacement serving `responses` keyed by URL."""
    def _urlopen(req):
        body = responses[req.full_url]
        if isinstance(body, Exception):
            raise body
        res = mock.MagicMock()
        res.read.return_value = body.encode()
        res.__enter__.return_value = res
        return res
    return _urlopen


class FetchWagerLeaderboardsTest(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.root = Path(tmp.name)
        (self.root / "data").mkdir()
        patcher = mock.patch.object(output, "REPO_ROOT", self.root)
        patcher.start()
        self.addCleanup(patcher.stop)

    def run_main(self, responses):
        with mock.patch.object(wager.urllib.request, "urlopen", fake_urlopen(responses)), \
                redirect_stdout(io.StringIO()) as out:
            wager.main()
        return out.getvalue()

    def test_writes_each_site_with_four_space_indent_and_unicode(self):
        payload = dict(PAYLOAD, note="שלום")
        out = self.run_main({
            "https://ronen.gg/api/empiredrop": json.dumps(payload),
            "https://ronen.gg/api/csdrop": json.dumps(PAYLOAD),
        })
        written = (self.root / "data" / "empiredrop.json").read_text(encoding="utf-8")
        self.assertEqual(written, json.dumps(payload, ensure_ascii=False, indent=4))
        self.assertIn("שלום", written)
        self.assertFalse(written.endswith("\n"))
        self.assertIn("Successfully fetched and updated csdrop.json", out)

    def test_failing_site_keeps_its_previous_file(self):
        previous = '{"leaderboard": []}'
        (self.root / "data" / "csdrop.json").write_text(previous, encoding="utf-8")
        out = self.run_main({
            "https://ronen.gg/api/empiredrop": json.dumps(PAYLOAD),
            "https://ronen.gg/api/csdrop": OSError("connection refused"),
        })
        self.assertEqual((self.root / "data" / "csdrop.json").read_text(encoding="utf-8"), previous)
        self.assertTrue((self.root / "data" / "empiredrop.json").exists())
        self.assertIn("Error fetching csdrop: connection refused", out)

    def test_sends_browser_user_agent(self):
        seen = {}

        def capture(req):
            seen[req.full_url] = req.get_header("User-agent")
            raise OSError("stop")

        with mock.patch.object(wager.urllib.request, "urlopen", capture), redirect_stdout(io.StringIO()):
            wager.main()
        self.assertEqual(set(seen), {"https://ronen.gg/api/empiredrop", "https://ronen.gg/api/csdrop"})
        self.assertTrue(all(ua.startswith("Mozilla/5.0") for ua in seen.values()))


if __name__ == "__main__":
    unittest.main()
