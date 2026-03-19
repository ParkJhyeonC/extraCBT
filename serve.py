import argparse
import os
import queue
import re
import shutil
import signal
import subprocess
import sys
import threading
from contextlib import suppress
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


URL_PATTERNS = {
    'cloudflared': re.compile(r'https://[-a-zA-Z0-9.]+trycloudflare\.com'),
    'localhost-run': re.compile(r'https://[-a-zA-Z0-9.]+\.lhr\.life|https://localhost\.run/[a-zA-Z0-9]+'),
}


class TunnelMonitor:
    def __init__(self, process, provider, public_url):
        self.process = process
        self.provider = provider
        self.public_url = public_url


class ReusableTCPServer(ThreadingHTTPServer):
    allow_reuse_address = True


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description='Serve the extraCBT static app locally and optionally expose it through a public tunnel.',
    )
    parser.add_argument('--host', default='0.0.0.0', help='Bind host. Default: 0.0.0.0')
    parser.add_argument('--port', type=int, default=8000, help='Bind port. Default: 8000')
    parser.add_argument(
        '--tunnel',
        choices=['none', 'auto', 'cloudflared', 'localhost-run'],
        default='none',
        help='Optional public tunnel provider. auto tries cloudflared first, then localhost.run.',
    )
    return parser.parse_args()


def build_provider_plan(tunnel: str) -> list[str]:
    if tunnel == 'auto':
        return ['cloudflared', 'localhost-run']
    if tunnel == 'none':
        return []
    return [tunnel]


def is_available(command: str) -> bool:
    return shutil.which(command) is not None


def resolve_cloudflared_command() -> list[str] | None:
    path_command = shutil.which('cloudflared')
    if path_command:
        return [path_command]

    local_candidates = [
        os.environ.get('EXTRACBT_CLOUDFLARED'),
        os.path.join(os.path.dirname(__file__), '.tools', 'cloudflared', 'cloudflared.exe'),
        os.path.join(os.path.dirname(__file__), '.tools', 'cloudflared', 'cloudflared'),
    ]
    for candidate in local_candidates:
        if candidate and os.path.exists(candidate):
            return [candidate]

    return None


def start_tunnel(provider: str, port: int) -> TunnelMonitor | None:
    if provider == 'cloudflared':
        cloudflared_command = resolve_cloudflared_command()
        if not cloudflared_command:
            return None
        cmd = [*cloudflared_command, 'tunnel', '--url', f'http://127.0.0.1:{port}', '--no-autoupdate']
    elif provider == 'localhost-run':
        if not is_available('ssh'):
            return None
        cmd = [
            'ssh',
            '-o',
            'StrictHostKeyChecking=no',
            '-o',
            'ServerAliveInterval=30',
            '-R',
            f'80:127.0.0.1:{port}',
            'nokey@localhost.run',
        ]
    else:
        return None

    process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        stdin=subprocess.DEVNULL,
        text=True,
        bufsize=1,
    )

    output_queue: queue.Queue[str] = queue.Queue()

    def pump_output() -> None:
        assert process.stdout is not None
        for line in process.stdout:
            print(f'[{provider}] {line.rstrip()}')
            output_queue.put(line)

    threading.Thread(target=pump_output, daemon=True).start()

    pattern = URL_PATTERNS[provider]
    public_url = None
    for _ in range(80):
        try:
            line = output_queue.get(timeout=0.5)
        except queue.Empty:
            if process.poll() is not None:
                break
            continue

        match = pattern.search(line)
        if match:
            public_url = match.group(0)
            break

    return TunnelMonitor(process, provider, public_url)


def stop_tunnel(tunnel: TunnelMonitor | None) -> None:
    if tunnel is None or tunnel.process.poll() is not None:
        return

    with suppress(ProcessLookupError):
        tunnel.process.terminate()
    with suppress(subprocess.TimeoutExpired):
        tunnel.process.wait(timeout=5)
    if tunnel.process.poll() is None:
        with suppress(ProcessLookupError):
            tunnel.process.kill()


def print_startup_summary(host: str, port: int, tunnel: TunnelMonitor | None, requested_tunnel: str) -> None:
    print(f'Local URL : http://127.0.0.1:{port}')
    print(f'LAN URL   : http://{host}:{port}')
    if tunnel and tunnel.public_url:
        print(f'Public URL: {tunnel.public_url}')
        print(f'Tunnel    : {tunnel.provider}')
    elif requested_tunnel != 'none':
        print('Public URL: 자동 생성 실패')
        print('힌트      : cloudflared 또는 ssh(localhost.run)가 설치되어 있는지 확인하세요.')
        print('            start-public.bat은 cloudflared 자동 설치 후 실행을 시도합니다.')


def main() -> int:
    args = parse_args()
    tunnel_monitor = None

    for provider in build_provider_plan(args.tunnel):
        tunnel_monitor = start_tunnel(provider, args.port)
        if tunnel_monitor and tunnel_monitor.public_url:
            break
        if tunnel_monitor and tunnel_monitor.process.poll() is None and not tunnel_monitor.public_url:
            break
        stop_tunnel(tunnel_monitor)
        tunnel_monitor = None

    server = ReusableTCPServer((args.host, args.port), SimpleHTTPRequestHandler)

    def shutdown_handler(signum, frame):  # noqa: ARG001
        stop_tunnel(tunnel_monitor)
        server.shutdown()

    signal.signal(signal.SIGINT, shutdown_handler)
    if hasattr(signal, 'SIGTERM'):
        signal.signal(signal.SIGTERM, shutdown_handler)

    print_startup_summary(args.host, args.port, tunnel_monitor, args.tunnel)

    try:
        server.serve_forever()
    finally:
        stop_tunnel(tunnel_monitor)
        server.server_close()

    return 0


if __name__ == '__main__':
    sys.exit(main())
