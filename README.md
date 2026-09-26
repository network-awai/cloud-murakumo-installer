# cloud-murakumo-installer

Murakumo node installation assets. The NixOS profile prepares a minimal Linux
host; `install.sh` installs the public Murakumo node CLI. The model server and
network admission are separate operator steps.

## Install the CLI

Requires Linux or macOS with Node.js 22+, npm and curl. Review the script first:

```sh
curl -fsSL https://murakumo.cloud/install.sh -o install.sh
sh install.sh
murakumo node init
murakumo node doctor --model YOUR_MODEL_ID --local-url http://127.0.0.1:11434/v1
```

The script uses only user directories, checks SHA-256 of the three downloaded
release files, and never registers a node or starts a service. `release-lock.json`
records the exact Murakumo commit and hashes. Release URLs use that immutable
commit, so a subsequent upstream `main` update cannot break an older installer.

## NixOS host preparation

The `nixos/default.nix` module enables Tailscale and graphics support and adds
Node.js 22, curl and `vulkaninfo`. For a real host, generate its own
`hardware-configuration.nix`, copy and edit `configuration.example.nix`, set a
real SSH public key, configure boot/storage/recovery, then import the module.
Apply with the target host's normal `nixos-rebuild switch` process. Install the
CLI as the intended node user. Keep the model server bound to loopback unless
the operator explicitly configures a protected network path.

The 2026-09-26 NixOS 26.05 VM pilot booted and ran `murakumo node --help` with
Node.js 22. The VM exposed llvmpipe only. Radeon 680M, Prism Vulkan,
model throughput, concurrent requests and restart recovery still need physical
host testing before replacing the Ubuntu installation.

## Promote a CLI release

Build and merge the desired `kotoba-lang/murakumo` release first. In a fetched
checkout of that repo, run:

```sh
node scripts/pin-release.mjs <40-character-main-commit> <murakumo-checkout>
```

This verifies that the commit is in `origin/main` and regenerates `install.sh`
and `release-lock.json` from the exact committed release files. Review the diff,
run `npm test`, and publish this repository before syncing the site. The site
copies a SHA-256-checked revision of this installer during its build.

Repository boundaries: `kotoba-lang/murakumo` owns CLI code and release files;
this repository owns the node installation script and NixOS base profile;
`network-awai/cloud-murakumo` serves `/install.sh` on murakumo.cloud.
