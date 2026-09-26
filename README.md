# cloud-murakumo-installer

The public Murakumo node CLI installer for existing macOS and Linux hosts.
The model server and network admission are separate operator steps. This
installer does not write an OS image or alter disk partitions. NixOS boot
media and OS installation live in
[`cloud-murakumo-usb-installer`](https://github.com/network-awai/cloud-murakumo-usb-installer).

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

Windows node installation is not supported by the current script. It requires
its own implementation and verification before being advertised.

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
this repository owns the CLI installation script for existing hosts;
`network-awai/cloud-murakumo` serves `/install.sh` on murakumo.cloud.
