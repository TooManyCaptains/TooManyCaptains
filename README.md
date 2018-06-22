## Too Many Captains

```
  _______            __  __                      _____            _        _
 |__   __|          |  \/  |                    / ____|          | |      (_)
    | | ___   ___   | \  / | __ _ _ __  _   _  | |     __ _ _ __ | |_ __ _ _ _ __  ___
    | |/ _ \ / _ \  | |\/| |/ _` | '_ \| | | | | |    / _` | '_ \| __/ _` | | '_ \/ __|
    | | (_) | (_) | | |  | | (_| | | | | |_| | | |___| (_| | |_) | || (_| | | | | \__ \
    |_|\___/ \___/  |_|  |_|\__,_|_| |_|\__, |  \_____\__,_| .__/ \__\__,_|_|_| |_|___/
                                         __/ |             | |
                                        |___/              |_|
```

### How do I set this up?

Too Many Captains makes extensive use of Docker! If you're not familiar, it's a really cool technology that lets you
define how systems are configured with simple config files, rather than setting them up by hand. This means that the setup
is repeatable, portable, and easy to update and share.

Too Many Captains relies on two computers: one that runs the game engine and graphics (and is plugged into a TV), and another that controls the controls! We call the first computer (an Intel NUC) the **starship**, and the second (a Raspberry Pi) the **controller**.

To get things going, you'll need to set up the base operating systems on the starship and the controller.

#### Setting up the starship

1.  Download Debian 9.x (codenamed _stretch_)
2.  Write the disk image to a USB flash drive
3.  Install Debian
4.  Configure static ethernet connection in /etc/network/interfaces
5.  Set up a docker machine to interface with the starship
    `docker-machine create --driver generic --generic-ip-address=10.0.1.42 --generic-ssh-key ~/.ssh/id_rsa --generic-ssh-user=crew starship`
6.  More steps coming soon!

#### Setting up the Raspberry Pi (from Scratch)

(Instructions written based on a Raspberry Pi 3 B+ and Raspbian Stretch Lite, 2018-04-18, Kernel 4.14)

- Download Raspbian Stretch Lite from the [Raspberry Pi website](https://www.raspberrypi.org/downloads/raspbian/).
- Write the OS image to a microSD card. I'd recommend using [etcher](http://etcher.io/) to do this. It's very intuitive to use.
- Put the microSD card in the Pi. Connect the Pi to a USB keyboard and a monitor via HDMI and then turn it on by plugging the power in.
- Log in to the pi with the default credentials, username: pi, password: raspberry.
- Run `sudo raspi-config` and enable SSH, set the Wi-Fi region, and change the locale to your local one (if not UK English).
- Reboot the pi (`sudo reboot`)
- Connect the Pi to internet via Wi-Fi (use raspi-config) or Ethernet (should just work automatically).
- Install docker by running `curl -sSL https://get.docker.com | sh`.
- Add the pi user to the docker group: `sudo usermd -aG docker pi` [so you can manage Docker as a non-root user](https://docs.docker.com/install/linux/linux-postinstall/#manage-docker-as-a-non-root-user).
- Perform a [small hack](https://gist.github.com/calebbrewer/c41cab61216d8845b59fcc51f36343a7) to enable [Docker Machine](https://docs.docker.com/machine/overview/) to work with Rasbian. Edit `/etc/os-release`, and change the line that says `ID=raspbian` to `ID=debian`.
- Perform a [small hack](https://github.com/moby/moby/issues/15651#issuecomment-297675962) to get Docker to work nicely with Debian Stretch. Edit `/etc/systemd/system/docker.service.d/10-machine.conf` and replace the text `autf` with `overlay2`.
- If you know how to use vim, install it: `sudo apt install vim`
- Install the dependencies for ad-hoc Wi-Fi: `sudo apt install dnsmasq hostapd`
- SSH to your Pi from another machine. There's two ways to do this: ad-hoc Wi-Fi or ethernet. Ethernet is the easiest. If you turn on Internet sharing on your Mac, you can just plug the Pi in via Ethernet and it should work. Otherwise, you can configure hostapd on the pi (directly) and then use the ad-hoc network to continue setup.
- Set up ad-hoc wifi. **TODO**
- Copy your public key to the Pi, so you can SSH to it without typing a password: `ssh-copy-id pi@raspberrypi.local`. (Note: the hostname might not be raspberrypi.local, depending on how you networked it with your computer.)
