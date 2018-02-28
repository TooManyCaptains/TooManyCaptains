## Too Many Captains

  _______            __  __                      _____            _        _
 |__   __|          |  \/  |                    / ____|          | |      (_)
    | | ___   ___   | \  / | __ _ _ __  _   _  | |     __ _ _ __ | |_ __ _ _ _ __  ___
    | |/ _ \ / _ \  | |\/| |/ _` | '_ \| | | | | |    / _` | '_ \| __/ _` | | '_ \/ __|
    | | (_) | (_) | | |  | | (_| | | | | |_| | | |___| (_| | |_) | || (_| | | | | \__ \
    |_|\___/ \___/  |_|  |_|\__,_|_| |_|\__, |  \_____\__,_| .__/ \__\__,_|_|_| |_|___/
                                         __/ |             | |
                                        |___/              |_|

### How do I set this up?

Too Many Captains makes extensive use of Docker! If you're not familiar, it's a really cool technology that lets you
define how systems are configured with simple config files, rather than setting them up by hand. This means that the setup
is repeatable, portable, and easy to update and share.

Too Many Captains relies on two computers: one that runs the game engine and graphics (and is plugged into a TV), and another that controls the controls! We call the first computer (an Intel NUC) the **starship**, and the second (a Raspberry Pi) the **controller**.

To get things going, you'll need to set up the base operating systems on the starship and the controller.

#### Setting up the starship

1. Download Debian 9.x (codenamed *stretch*)
2. Write the disk image to a USB flash drive
3. Install Debian
4. Configure static ethernet connection in /etc/network/interfaces
5. Set up a docker machine to interface with the starship
```docker-machine create --driver generic --generic-ip-address=10.0.1.42 --generic-ssh-key ~/.ssh/id_rsa --generic-ssh-user=crew starship```
6. More steps coming soon!
