import io
import json
import sys
import tempfile
import unittest
from contextlib import redirect_stdout
from pathlib import Path
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "scripts"))

import check_kick_live  # noqa: E402
from lib import output  # noqa: E402


def response(status, body):
    res = mock.Mock(status_code=status, text=json.dumps(body))
    res.json.return_value = body
    res.raise_for_status.side_effect = None if status < 400 else Exception(f"{status} error")
    return res


class ParseIsLiveTest(unittest.TestCase):
    def test_live(self):
        self.assertTrue(check_kick_live.parse_is_live({"data": [{"stream": {"is_live": True}}]}))

    def test_offline(self):
        self.assertFalse(check_kick_live.parse_is_live({"data": [{"stream": {"is_live": False}}]}))

    def test_missing_fields_mean_offline(self):
        self.assertFalse(check_kick_live.parse_is_live({}))
        self.assertFalse(check_kick_live.parse_is_live({"data": []}))
        self.assertFalse(check_kick_live.parse_is_live({"data": [{}]}))


class FetchIsLiveTest(unittest.TestCase):
    def run_quietly(self, *args):
        with redirect_stdout(io.StringIO()) as out:
            result = check_kick_live.fetch_is_live(*args)
        return result, out.getvalue()

    def test_missing_credentials_skip_the_api(self):
        with mock.patch.object(check_kick_live.requests, "post") as post:
            result, out = self.run_quietly(None, "secret")
        self.assertFalse(result)
        self.assertIn("Missing KICK_CLIENT_ID / KICK_CLIENT_SECRET", out)
        post.assert_not_called()

    @mock.patch.object(check_kick_live.requests, "get")
    @mock.patch.object(check_kick_live.requests, "post")
    def test_live_channel(self, post, get):
        post.return_value = response(200, {"access_token": "tok"})
        get.return_value = response(200, {"data": [{"stream": {"is_live": True}}]})
        result, _ = self.run_quietly("id", "secret")
        self.assertTrue(result)
        self.assertEqual(post.call_args.kwargs["data"]["grant_type"], "client_credentials")
        self.assertEqual(get.call_args.kwargs["headers"], {"Authorization": "Bearer tok"})
        self.assertEqual(get.call_args.kwargs["params"], {"slug": "ronengg"})

    @mock.patch.object(check_kick_live.requests, "get")
    @mock.patch.object(check_kick_live.requests, "post")
    def test_non_200_channel_response_is_logged_as_offline(self, post, get):
        post.return_value = response(200, {"access_token": "tok"})
        get.return_value = response(503, {"message": "down"})
        result, out = self.run_quietly("id", "secret")
        self.assertFalse(result)
        self.assertIn("Failed to fetch channel: 503", out)

    @mock.patch.object(check_kick_live.requests, "post")
    def test_token_failure_is_logged_as_offline(self, post):
        post.return_value = response(401, {"error": "invalid_client"})
        result, out = self.run_quietly("id", "secret")
        self.assertFalse(result)
        self.assertIn("Error fetching live status: 401 error", out)


class MainTest(unittest.TestCase):
    def test_writes_status_file_in_original_format(self):
        with tempfile.TemporaryDirectory() as tmp, \
                mock.patch.object(output, "REPO_ROOT", Path(tmp)), \
                mock.patch.object(check_kick_live, "fetch_is_live", return_value=True):
            check_kick_live.main()
            written = (Path(tmp) / "data" / "kick_live.json").read_text(encoding="utf-8")
        self.assertEqual(written, '{"is_live": true}')


if __name__ == "__main__":
    unittest.main()
