# Cryptopus Add-on
Currently in Development, there is no working build as of yet.
--------
### What's it about
The Add-on's purpose is to access Accounts contained within a specific Cryptopus host.
It is supposed to work similar like [LastPass](https://www.lastpass.com/de), with the difference that it won't be accessing local ressources but those saved on the mentioned Cryptopus server.

The authentication is handled by an external API.

Currently, we are developing the Firefox version of this Add-On.

--------

### Development

Copy the git repo.

``git clone https://github.com/puzzle/cryptopus-add-on.git``

To get jasmine working, you'll need Yeoman, Bower and the Jasmine-Generator:

``npm install -g yo``
``npm install -g bower``
``npm install -g generator-jasmine``

In the Project directory, do

``yo jasmine``

When promptet to replace existing files, choose no.

Install the Web-Ext tool from Firefox for testing the Add-on.

``npm install --global web-ext``

Show Web-Ext Version.

``web-ext --version``

Run Web-Ext.

``cd src/``

``web-ext run``
