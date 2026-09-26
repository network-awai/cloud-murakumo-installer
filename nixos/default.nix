{ pkgs, ... }:
{
  # Base for a node operator. Import this from a host-specific configuration.nix.
  services.tailscale.enable = true;
  hardware.graphics.enable = true;
  environment.systemPackages = with pkgs; [
    curl
    nodejs_22
    vulkan-tools
  ];
  # Hardware, disks, model server, credentials, admission and firewall are
  # intentionally supplied by the operator's host configuration.
}
