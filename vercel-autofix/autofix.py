#!/usr/bin/env python3
"""Detect failed Vercel deployments and let Claude Code fix them.

Two entry points share everything but how they find the failure and what they do
with the fix:

  poll  (launchd on the Mac)   recent ERROR deployments -> fix in the working tree
  sha   (GitHub Actions)       deployments for one commit -> fix on a branch + PR

Both post the outcome to Slack #通知_vercel.
"""
import argparse
import json
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

WORKSPACE = Path(__file__).resolve().parent.parent
STATE = Path.home() / '.cache' / 'vercel-autofix' / 'seen.json'
ANSI = re.compile(r'\x1b\[[0-9;]*m')
CLI_AUTH = Path.home() / 'Library/Application Support/com.vercel.cli/auth.json'
# Noise that never explains a failure.
DROP = re.compile(r'^(npm (warn|notice)|>|\s*$)')
CAUSE_PATTERNS = [
    r'^Type error:', r'^Module not found', r'^Failed to compile', r'^error TS\d+',
    r'^npm ERR! (?:code|Missing|Cannot|404)', r'^(?:Syntax|Reference|Type)Error\b',
    r'^Error: (?!Command ")', r'^Error: Command "',
]
SKIP_DIRS = {'node_modules', '.next', '.git', '.vercel', 'dist', '.turbo', 'out', '__pycache__'}


def env(name, default=None):
    return os.environ.get(name) or default


def vercel_token():
    token = env('VERCEL_TOKEN')
    if token:
        return token
    # The CLI keeps a short-lived token; usable as a fallback on the Mac.
    if CLI_AUTH.exists():
        return json.loads(CLI_AUTH.read_text()).get('token')
    sys.exit('VERCEL_TOKEN is not set')


def api(path, **params):
    team = env('VERCEL_TEAM_ID')
    if team:
        params.setdefault('teamId', team)
    query = '&'.join(f'{k}={v}' for k, v in params.items() if v is not None)
    url = f'https://api.vercel.com{path}' + (f'?{query}' if query else '')
    req = urllib.request.Request(url, headers={'authorization': f'Bearer {vercel_token()}'})
    with urllib.request.urlopen(req, timeout=30) as res:
        return json.load(res)


def slack(text):
    token, channel = env('SLACK_BOT_TOKEN'), env('SLACK_CHANNEL_ID')
    if not (token and channel):
        print('[slack skipped]', text)
        return
    body = json.dumps({'channel': channel, 'text': text,
                       'unfurl_links': False, 'unfurl_media': False}).encode()
    req = urllib.request.Request(
        'https://slack.com/api/chat.postMessage', data=body,
        headers={'content-type': 'application/json; charset=utf-8',
                 'authorization': f'Bearer {token}'})
    with urllib.request.urlopen(req, timeout=20) as res:
        out = json.load(res)
    if not out.get('ok'):
        print('slack error:', out.get('error'), file=sys.stderr)


def build_log(deployment_id):
    """Return (cause line, log tail) for a failed build."""
    try:
        events = api(f'/v3/deployments/{deployment_id}/events', builds=1, limit=1000)
    except urllib.error.HTTPError as err:
        print('events fetch failed:', err, file=sys.stderr)
        return None, ''
    if not isinstance(events, list):
        return None, ''
    lines = []
    for e in events:
        if e.get('type') not in ('stdout', 'stderr'):
            continue
        text = ANSI.sub('', str(e.get('text') or (e.get('payload') or {}).get('text') or '')).rstrip()
        if text and not DROP.match(text):
            lines.append(text)
    cause = None
    for pattern in CAUSE_PATTERNS:
        cause = next((t for t in lines if re.match(pattern, t.strip())), None)
        if cause:
            break
    tail = lines[-60:]
    if cause and (at := next((i for i, t in enumerate(lines) if t == cause), -1)) >= 0:
        tail = lines[max(0, at - 5):at + 55]
    return (cause.strip() if cause else None), '\n'.join(tail)


def walk(root, max_depth=None):
    """os.walk over a tree, pruning build output and dependency directories."""
    root = Path(root)
    base = len(root.parts)
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS or d == '.vercel']
        path = Path(dirpath)
        if max_depth is not None and len(path.parts) - base >= max_depth:
            dirnames[:] = []
        yield path, dirnames, filenames


def project_dirs():
    """Map Vercel project id -> local directory, via each project's .vercel/project.json."""
    found = {}
    for dirpath, dirnames, _ in walk(WORKSPACE, max_depth=3):
        if '.vercel' not in dirnames:
            continue
        link = dirpath / '.vercel' / 'project.json'
        try:
            found[json.loads(link.read_text())['projectId']] = dirpath
        except (OSError, ValueError, KeyError):
            continue
    return found


def resolve_dir(deployment):
    by_id = project_dirs()
    if (d := by_id.get(deployment.get('projectId'))):
        return d
    # Git-linked projects may have no local .vercel: fall back to the root directory.
    name = deployment.get('name')
    guess = WORKSPACE / name if name else None
    return guess if guess and guess.is_dir() else None


def changed_files(directory, since):
    out = []
    for dirpath, _, filenames in walk(directory):
        for filename in filenames:
            path = dirpath / filename
            try:
                if path.stat().st_mtime > since:
                    out.append(str(path.relative_to(directory)))
            except OSError:
                continue
    return sorted(out)[:20]


PROMPT = """Vercelの本番ビルドが失敗しました。原因を特定して、ビルドが通る状態に直してください。

プロジェクト: {name}
原因（推定）: {cause}

ビルドログ（末尾）:
```
{log}
```

手順:
1. ログが指しているファイルを読んで、何が壊れているか確認する
2. 最小限の差分で直す
3. 実際にビルドコマンド（package.json の build スクリプト等）を走らせて、通ることを自分で確認する
4. 通らなければ通るまで直す

制約:
- ビルドを通すための最小限の修正だけ。機能追加・無関係なリファクタ・整形はしない
- 型エラーを `any` や `@ts-ignore` で握りつぶすのは最後の手段。まず正しい実装で直す
- 原因が外部要因（環境変数の不足、権限、外部APIの障害）でコードでは直せない場合は、何も変更せずその旨を述べて終わる

最後に1〜2行で「何を直したか」だけ日本語で報告してください。
"""


def claude_env():
    """Inherit the shell environment, minus anything a parent Claude Code session injected
    (ANTHROPIC_BASE_URL in particular makes the API key fail with a 401)."""
    clean = {k: v for k, v in os.environ.items()
             if not k.startswith('CLAUDE') and k not in ('ANTHROPIC_BASE_URL', 'ANTHROPIC_AUTH_TOKEN')}
    if not clean.get('ANTHROPIC_API_KEY'):
        sys.exit('ANTHROPIC_API_KEY is not set')
    return clean


def run_claude(directory, name, cause, log, timeout=1500):
    cmd = ['claude', '-p', PROMPT.format(name=name, cause=cause or '(不明)', log=log),
           '--permission-mode', 'bypassPermissions', '--output-format', 'json']
    try:
        proc = subprocess.run(cmd, cwd=directory, capture_output=True, text=True,
                              timeout=timeout, env=claude_env())
    except subprocess.TimeoutExpired:
        return None, f'タイムアウト（{timeout // 60}分）で打ち切りました'
    if proc.returncode != 0:
        return None, f'claude が異常終了しました: {(proc.stderr or proc.stdout).strip()[:300]}'
    try:
        result = json.loads(proc.stdout)
    except ValueError:
        return None, proc.stdout.strip()[-500:] or 'claude の出力を読めませんでした'
    summary = str(result.get('result') or '').strip()
    if result.get('is_error'):
        return None, f'claude がエラーを返しました: {summary[:300]}'
    return result, summary


def git(directory, *args, check=True):
    return subprocess.run(['git', *args], cwd=directory, capture_output=True,
                          text=True, check=check).stdout.strip()


def open_pr(deployment, summary):
    """Actions mode: commit the fix on a branch and open a PR. Returns the PR url."""
    branch = f"autofix/{deployment['uid'].replace('dpl_', '')[:12]}"
    git(WORKSPACE, 'checkout', '-b', branch)
    git(WORKSPACE, 'add', '-A')
    git(WORKSPACE, 'commit', '-m',
        f"Fix the failing {deployment['name']} build\n\n{summary}\n\n"
        "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>")
    git(WORKSPACE, 'push', '-u', 'origin', branch)
    body = (f"`{deployment['name']}` の本番ビルドが失敗したため自動修復しました。\n\n"
            f"{summary}\n\n"
            f"失敗したデプロイ: https://vercel.com/taiga-hados-projects/{deployment['name']}/"
            f"{deployment['uid'].replace('dpl_', '')}\n\n"
            "🤖 Generated with [Claude Code](https://claude.com/claude-code)")
    return subprocess.run(
        ['gh', 'pr', 'create', '--title', f"自動修復: {deployment['name']} のビルド失敗",
         '--body', body, '--base', 'main', '--head', branch],
        cwd=WORKSPACE, capture_output=True, text=True).stdout.strip().splitlines()[-1]


def handle(deployment, mode):
    name = deployment.get('name', '?')
    target = '本番' if deployment.get('target') == 'production' else 'プレビュー'
    directory = resolve_dir(deployment)
    cause, log = build_log(deployment['uid'])
    header = f"🛠 自動修復｜*{name}*（{target}）"

    if not directory:
        slack(f"{header}\nローカルにプロジェクトが見つからず、修復できませんでした。\n原因：{cause or '不明'}")
        return
    if not log:
        slack(f"{header}\nビルドログを取得できず、修復をスキップしました。")
        return

    started = time.time()
    result, summary = run_claude(directory, name, cause, log)
    touched = changed_files(directory, started)

    lines = [header, f"原因：{cause or '不明'}"]
    if not touched:
        lines.append("⚠️ コードは変更されませんでした（コードでは直せない可能性）")
        lines.append(f"Claudeの所見：{summary[:600]}")
        slack('\n'.join(lines))
        return

    lines.append(f"修正：{summary[:600]}")
    lines.append(f"変更ファイル：{', '.join(touched[:8])}" + (' ほか' if len(touched) > 8 else ''))
    if mode == 'pr':
        try:
            lines.append(f"→ {open_pr(deployment, summary)}")
        except subprocess.CalledProcessError as err:
            lines.append(f"⚠️ PR作成に失敗：{err.stderr.strip()[:200]}")
    else:
        lines.append(f"→ `{directory.name}` に適用済み。確認して再デプロイしてください")
    if result and result.get('total_cost_usd'):
        lines.append(f"（${result['total_cost_usd']:.2f}）")
    slack('\n'.join(lines))


def seen_ids():
    if not STATE.exists():
        return None
    try:
        return set(json.loads(STATE.read_text()))
    except ValueError:
        return set()


def save_seen(ids):
    STATE.parent.mkdir(parents=True, exist_ok=True)
    STATE.write_text(json.dumps(sorted(ids)[-400:]))


def poll(window_minutes, skip_git_linked):
    since = int((time.time() - window_minutes * 60) * 1000)
    deployments = api('/v6/deployments', limit=40).get('deployments', [])
    failures = [d for d in deployments if d.get('state') == 'ERROR' and d.get('created', 0) >= since]

    seen = seen_ids()
    if seen is None:  # first run: adopt the current state instead of fixing a backlog
        save_seen({d['uid'] for d in deployments})
        print(f'seeded state with {len(deployments)} deployments')
        return
    fresh = [d for d in failures if d['uid'] not in seen]
    if not fresh:
        return
    linked = git_linked_projects() if skip_git_linked else set()
    for deployment in fresh:
        seen.add(deployment['uid'])
        if deployment.get('projectId') in linked:
            print(f"skip {deployment['name']} (GitHub Actions が担当)")
            continue
        print(f"fixing {deployment['name']} {deployment['uid']}")
        handle(deployment, mode='worktree')
    save_seen(seen)


def git_linked_projects():
    projects = api('/v9/projects', limit=100).get('projects', [])
    return {p['id'] for p in projects if p.get('link')}


def by_sha(sha, wait_minutes):
    """Actions mode: wait for every deployment of this commit to settle."""
    deadline = time.time() + wait_minutes * 60
    while time.time() < deadline:
        deployments = [d for d in api('/v6/deployments', limit=40).get('deployments', [])
                       if (d.get('meta') or {}).get('githubCommitSha') == sha]
        if deployments and all(d.get('state') in ('READY', 'ERROR', 'CANCELED') for d in deployments):
            failures = [d for d in deployments if d['state'] == 'ERROR']
            for deployment in failures:
                print(f"fixing {deployment['name']} {deployment['uid']}")
                handle(deployment, mode='pr')
            print(f'{len(deployments)} deployment(s), {len(failures)} failed')
            return
        time.sleep(20)
    print('timed out waiting for deployments to settle')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('mode', choices=['poll', 'sha'])
    parser.add_argument('--sha')
    parser.add_argument('--window', type=int, default=30, help='poll: minutes to look back')
    parser.add_argument('--wait', type=int, default=20, help='sha: minutes to wait for a result')
    parser.add_argument('--all-projects', action='store_true',
                        help='poll: also handle projects GitHub Actions already covers')
    args = parser.parse_args()
    if args.mode == 'poll':
        poll(args.window, skip_git_linked=not args.all_projects)
    else:
        by_sha(args.sha or env('GITHUB_SHA'), args.wait)


if __name__ == '__main__':
    main()
