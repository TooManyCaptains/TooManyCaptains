# Based on @jfrazelle's dockerfile
# You will want the custom seccomp profile:
# 	wget https://raw.githubusercontent.com/jfrazelle/dotfiles/master/etc/docker/seccomp/chrome.json -O ~/chrome.json

# Base docker image
FROM debian:buster

# Install Chromium
RUN apt-get update && apt-get install -y \
  chromium \
  libgl1-mesa-dri \
  libgl1-mesa-glx \
  libpango1.0-0 \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/* \
  && mkdir -p /etc/chromium.d/

# Add chromium user
RUN groupadd -r chromium && useradd -r -g chromium -G audio,video chromium \
  && mkdir -p /home/chromium && chown -R chromium:chromium /home/chromium

# Run as non privileged user
USER chromium

ENTRYPOINT [ "/usr/bin/chromium" ]
